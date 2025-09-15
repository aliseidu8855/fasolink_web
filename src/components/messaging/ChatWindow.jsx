import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PaperclipIcon, SendIcon } from '../icons/Icons.jsx';
import { useTranslation } from 'react-i18next';
import { fetchConversationById, sendMessage, fetchConversationMessages, markConversationRead, MESSAGE_PAGE_SIZE } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import ListingSnippet from './ListingSnippet';
import './ChatWindow.css';

const ChatWindow = ({ conversationId }) => {
  const { user } = useAuth();
  const { t } = useTranslation(['messaging','listing']);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]); // paginated, newest at end
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const pollRef = useRef(null);
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const firstRenderRef = useRef(true);

  const pageVisible = () => document.visibilityState === 'visible';

  const scrollToBottom = (instant=false) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: instant ? 'auto' : 'smooth' });
    }
  };

  // Load base conversation meta (listing, participants)
  const loadConversationMeta = useCallback(async () => {
    try {
      const res = await fetchConversationById(conversationId);
      setConversation(res.data);
    } catch (e) {
      console.error('Failed meta load', e);
    }
  }, [conversationId]);

  // Load a page of messages (pagination backend: page param) prepend older
  const loadMessagesPage = useCallback(async (targetPage) => {
    if (!conversationId) return;
    if (targetPage === 1) setInitialLoading(true);
    else setLoadingOlder(true);
    try {
      const res = await fetchConversationMessages(conversationId, targetPage);
      // Assuming backend returns {results, next, previous, count}
      const data = res.data;
      const newMsgs = data.results || data.messages || data; // fallback
      setMessages(prev => {
        if (targetPage === 1) return newMsgs.reverse(); // ensure oldest -> newest order
        // When loading older, we prepend newMsgs (which are older) to the start
        return [...newMsgs.reverse(), ...prev];
      });
      // Determine hasMore via next or length
      if (data.next === null || newMsgs.length < MESSAGE_PAGE_SIZE) {
        if (targetPage === 1) setHasMore(false); // no more pages if first page incomplete
        else if (newMsgs.length < MESSAGE_PAGE_SIZE) setHasMore(false);
      }
      setPage(targetPage);
    } catch (e) {
      console.error('Failed to load messages page', e);
    } finally {
      setInitialLoading(false);
      setLoadingOlder(false);
    }
  }, [conversationId]);

  // Poll new messages (only fetch page 1 meta and newest messages - simple approach re-fetch page1 meta)
  const refreshNewest = useCallback(async () => {
    if (!conversationId) return;
    try {
      const res = await fetchConversationMessages(conversationId, 1);
      const data = res.data;
      const newest = (data.results || data.messages || data).reverse();
      setMessages(prev => {
        // Merge keeping existing older messages
        // Assume IDs unique and stable
        const existingIds = new Set(prev.map(m => m.id));
        const merged = [...prev];
        let added = false;
        newest.forEach(m => {
          if (!existingIds.has(m.id)) { merged.push(m); added = true; }
        });
        if (added) setTimeout(() => scrollToBottom(), 50);
        return merged;
      });
      // update conversation meta (like unread counts externally) separately
    } catch (e) {
      console.error('Failed polling newest', e);
    }
  }, [conversationId]);

  // Mark as read after initial load or when new messages that belong to others arrive
  const markReadIfNeeded = useCallback(async () => {
    if (!messages.length || !user) return;
    const anyUnreadFromOther = messages.some(m => m.sender !== user.username && m.is_read === false);
    if (anyUnreadFromOther) {
      try { await markConversationRead(conversationId); } catch { /* silent */ }
    }
  }, [messages, user, conversationId]);

  // Initial load
  useEffect(() => {
    setConversation(null);
    setMessages([]);
    setPage(1);
    setHasMore(true);
    loadConversationMeta();
    loadMessagesPage(1).then(() => setTimeout(() => scrollToBottom(true), 30));
  }, [conversationId, loadConversationMeta, loadMessagesPage]);

  // Poll newest messages visibility aware
  useEffect(() => {
    pollRef.current = setInterval(() => { if (pageVisible()) refreshNewest(); }, 5000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [refreshNewest]);

  // Mark read when messages change
  useEffect(() => { markReadIfNeeded(); }, [messages, markReadIfNeeded]);

  // Scroll to bottom when messages appended (not when prepending older)
  const prevCountRef = useRef(0);
  useEffect(() => {
    if (firstRenderRef.current) { prevCountRef.current = messages.length; firstRenderRef.current = false; return; }
    if (messages.length > prevCountRef.current) {
      scrollToBottom();
    }
    prevCountRef.current = messages.length;
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;
    const content = newMessage;
    setNewMessage('');
    const tempId = 'temp-' + Date.now();
    const tempMessage = { id: tempId, content, sender: user.username, pending: true };
    setMessages(prev => [...prev, tempMessage]);
    setSending(true);
    try {
      const response = await sendMessage(conversationId, content);
      setMessages(prev => prev.map(m => m.id === tempId ? response.data : m));
      setTimeout(() => scrollToBottom(), 20);
    } catch (err) {
      console.error('Failed to send message', err);
      setMessages(prev => prev.map(m => m.id === tempId ? { ...m, pending:false, failed:true } : m));
    } finally {
      setSending(false);
    }
  };

  const retryMessage = async (msg) => {
    if (msg.pending || !msg.failed) return;
    const tempId = msg.id;
    setMessages(prev => prev.map(m => m.id === tempId ? { ...m, pending:true, failed:false } : m));
    try {
      const response = await sendMessage(conversationId, msg.content);
      setMessages(prev => prev.map(m => m.id === tempId ? response.data : m));
    } catch (err) {
      console.error('Retry failed', err);
      setMessages(prev => prev.map(m => m.id === tempId ? { ...m, pending:false, failed:true } : m));
    }
  };

  if (!user) return <div className="loading-pane"><h2>{t('messaging:loadingChat')}</h2></div>;
  if (initialLoading) return <div className="loading-pane"><h2>{t('messaging:loadingChat')}</h2></div>;
  if (!conversation) return null;

  const otherParticipant = conversation.participants.find(p => p !== user?.username);

  return (
    <div className="chat-window">
      <div className="chat-header">
        <img src={`https://i.pravatar.cc/40?u=${otherParticipant}`} alt="User" className="avatar" />
        <div>
          <h3>{otherParticipant}</h3>
          <p>{t('listing:interestedInYour', { title: conversation.listing.title })}</p>
        </div>
      </div>
      <div className="safety-tip">
        <p><strong>{t('messaging:safetyTipTitle')}</strong> {t('messaging:safetyTipBody')}</p>
      </div>
      <div className="messages-area" ref={scrollContainerRef}>
        {hasMore && (
          <button
            type="button"
            className="load-older-btn"
            disabled={loadingOlder}
            onClick={() => loadMessagesPage(page + 1)}
          >
            {loadingOlder ? t('common:loading') : t('messaging:loadOlder')}
          </button>
        )}
        <ListingSnippet listing={conversation.listing} />
        {messages.map(msg => {
          const statusLabel = msg.failed ? ` (${t('messaging:failedSend')})` : (msg.pending ? ' …' : '');
          return (
            <div key={msg.id} className={`message-bubble-wrapper ${msg.sender === user?.username ? 'sent' : 'received'}`}>
              <div className={`message-bubble ${msg.failed ? 'failed' : ''}`}>
                {msg.content}{statusLabel}
                {msg.failed && (
                  <button type="button" className="retry-btn" onClick={() => retryMessage(msg)}>{t('messaging:retry')}</button>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <form className="message-input-area" onSubmit={handleSendMessage}>
        <button type="button" className="attach-btn" aria-label={t('messaging:attach','Attach a file')}>
          <PaperclipIcon size={18} strokeWidth={1.7} />
        </button>
        <input
          type="text"
          placeholder={t('messaging:placeholder','Type your message...')}
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
        />
        <button type="submit" className="send-button" aria-label={t('messaging:send','Send')}>
          <SendIcon size={18} strokeWidth={1.7} />
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;