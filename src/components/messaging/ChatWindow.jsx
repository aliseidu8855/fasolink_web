import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Skeleton, SkeletonAvatar } from '../ui/Skeleton';
import { PaperclipIcon, SendIcon } from '../icons/Icons.jsx';
import Spinner from '../ui/Spinner';
import { useTranslation } from 'react-i18next';
import { fetchConversationById, sendMessage, sendMessageMultipart, fetchConversationMessages, markConversationRead, MESSAGE_PAGE_SIZE } from '../../services/api';
import { connectSocket } from '../../services/socket';
import { useAuth } from '../../context/AuthContext';
import ListingSnippet from './ListingSnippet';
import InitialsAvatar from '../ui/InitialsAvatar';
import './ChatWindow.css';

const ChatWindow = ({ conversationId }) => {
  const { user } = useAuth();
  const { t } = useTranslation(['messaging','listing']);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]); // Keep state oldest->newest and render in natural order (newest at bottom)
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [pendingFiles, setPendingFiles] = useState([]); // FileList[] for attachments
  // Polling removed in favor of WebSockets
  const wsRef = useRef(null);
  const typingRef = useRef(false);
  const typingTimeoutRef = useRef(null);
  const [otherTyping, setOtherTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const firstRenderRef = useRef(true);
  const fileInputRef = useRef(null);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [atBottom, setAtBottom] = useState(true);
  const [newSinceScroll, setNewSinceScroll] = useState(0);
  // Quick reply presets (localized or generic fallbacks)
  const quickReplies = useMemo(() => ([
    t('messaging:qr_isAvailable', 'Is this still available?'),
    t('messaging:qr_bestPrice', 'What’s your best price?'),
    t('messaging:qr_meetup', 'Can we meet to inspect?'),
  ]), [t]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // const pageVisible = () => document.visibilityState === 'visible';

  // With newest-at-bottom UI, scroll to bottom to show latest.
  const scrollToLatest = (instant=false) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: instant ? 'auto' : 'smooth' });
  };

  // Persist/restore scroll position per-thread using sessionStorage
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el || !conversationId) return;
    const key = `chat:scroll:${conversationId}`;
    // Restore
    try {
      const saved = sessionStorage.getItem(key);
      if (saved) {
        const top = parseInt(saved, 10);
        if (!isNaN(top)) el.scrollTop = top;
      }
    } catch { /* ignore */ }
    const onScroll = () => {
      try { sessionStorage.setItem(key, String(el.scrollTop)); } catch { /* ignore */ }
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [conversationId]);

  // Track if user is at/near latest (bottom) to decide whether to auto-scroll
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const onScroll = () => {
      const threshold = 80; // px from bottom considered "at latest"
      const distanceFromBottom = el.scrollHeight - el.clientHeight - el.scrollTop;
      const nowAtBottom = distanceFromBottom <= threshold;
      setAtBottom(nowAtBottom);
      if (nowAtBottom && newSinceScroll > 0) {
        setNewSinceScroll(0);
      }
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    // initialize once
    onScroll();
    return () => el.removeEventListener('scroll', onScroll);
  }, [newSinceScroll]);

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
    if (targetPage === 1) setLoadingOlder(true);
    else setLoadingOlder(true);
    const container = scrollContainerRef.current;
    const prevScrollHeight = container ? container.scrollHeight : 0;
    // saved scroll restoration handled in initial loader
    try {
      const res = await fetchConversationMessages(conversationId, targetPage);
      // Assuming backend returns {results, next, previous, count}
      const data = res.data;
      let newMsgs = data.results || data.messages || data; // fallback
      // Normalize order to oldest->newest if backend differs between environments
      if (Array.isArray(newMsgs)) {
        newMsgs = [...newMsgs].sort((a, b) => {
          const ta = a.timestamp ? new Date(a.timestamp).getTime() : 0;
          const tb = b.timestamp ? new Date(b.timestamp).getTime() : 0;
          if (ta !== tb) return ta - tb;
          // Fallback to id compare to keep stable order
          return (a.id || 0) - (b.id || 0);
        });
      }
      setMessages(prev => {
        if (prev.length === 0) return newMsgs; // initial fill
        // When loading older (earlier page numbers), prepend older to the start of the state array
        return [...newMsgs, ...prev];
      });
      // Determine if more older pages exist: in this paging scheme, page numbers decrease for older
      setHasMore(targetPage > 1 || Boolean(data.previous));
      setPage(targetPage);
      // Preserve anchor when prepending older pages by maintaining visual position
      setTimeout(() => {
        if (container) {
          const newScrollHeight = container.scrollHeight;
          container.scrollTop = container.scrollTop + (newScrollHeight - prevScrollHeight);
        }
      }, 30);
    } catch (e) {
      console.error('Failed to load messages page', e);
    } finally {
      setLoadingOlder(false);
    }
  }, [conversationId]);

  // Initial latest-page load: compute last page via count, then fetch it
  const loadInitialLatest = useCallback(async () => {
    if (!conversationId) return;
    setInitialLoading(true);
    try {
      const first = await fetchConversationMessages(conversationId, 1);
      const firstData = first.data || {};
      const count = typeof firstData.count === 'number' ? firstData.count : null;
      const pageSize = Array.isArray(firstData.results) ? firstData.results.length || MESSAGE_PAGE_SIZE : MESSAGE_PAGE_SIZE;
      const lastPage = count ? Math.max(1, Math.ceil(count / (pageSize || MESSAGE_PAGE_SIZE))) : 1;
      if (lastPage > 1) {
        const last = await fetchConversationMessages(conversationId, lastPage);
        const data = last.data || {};
        let newMsgs = data.results || data.messages || [];
        if (Array.isArray(newMsgs)) {
          newMsgs = [...newMsgs].sort((a, b) => {
            const ta = a.timestamp ? new Date(a.timestamp).getTime() : 0;
            const tb = b.timestamp ? new Date(b.timestamp).getTime() : 0;
            if (ta !== tb) return ta - tb;
            return (a.id || 0) - (b.id || 0);
          });
        }
        setMessages(newMsgs);
        setPage(lastPage);
        setHasMore(Boolean(data.previous) || lastPage > 1);
      } else {
        // Only one page; normalize and set
        let newMsgs = firstData.results || firstData.messages || [];
        if (Array.isArray(newMsgs)) {
          newMsgs = [...newMsgs].sort((a, b) => {
            const ta = a.timestamp ? new Date(a.timestamp).getTime() : 0;
            const tb = b.timestamp ? new Date(b.timestamp).getTime() : 0;
            if (ta !== tb) return ta - tb;
            return (a.id || 0) - (b.id || 0);
          });
        }
        setMessages(newMsgs);
        setPage(1);
        setHasMore(false);
      }
      // Snap to latest unless there is a saved scroll
      const key = `chat:scroll:${conversationId}`;
      const hadSaved = (() => { try { return !!sessionStorage.getItem(key); } catch { return false; } })();
      if (!hadSaved) {
        setTimeout(() => scrollToLatest(true), 30);
      }
    } catch (e) {
      console.error('Failed to load latest page', e);
    } finally {
      setInitialLoading(false);
    }
  }, [conversationId]);

  // Polling refreshNewest removed; updates now arrive via websocket

  // Mark as read after initial load or when new messages that belong to others arrive
  const markReadIfNeeded = useCallback(async () => {
    if (!messages.length || !user) return;
    const anyUnreadFromOther = messages.some(m => m.sender !== user.username && m.is_read === false);
    if (anyUnreadFromOther) {
      try { await markConversationRead(conversationId); } catch { /* silent */ }
    }
  }, [messages, user, conversationId]);

  // Initial load
  const initialMessagesCountRef = useRef(0);
  useEffect(() => {
    setConversation(null);
    setMessages([]);
    initialMessagesCountRef.current = 0;
    setPage(1);
    setHasMore(true);
    setPendingFiles([]);
    loadConversationMeta();
    loadInitialLatest();
  }, [conversationId, loadConversationMeta, loadInitialLatest]);

  // Real-time: open websocket per conversation
  useEffect(() => {
    if (!conversationId) return;
    // Close previous
  if (wsRef.current) { try { wsRef.current.close(); } catch { /* ignore */ } wsRef.current = null; }
    const { socket, close } = connectSocket(`/ws/conversations/${conversationId}/`, {
      onMessage: (data) => {
        if (data?.event === 'message.created' && data.message) {
          const m = data.message;
          setMessages(prev => {
            const exists = prev.some(x => x.id === m.id);
            if (exists) return prev;
            // Prefer server-provided sender fields; fallback to mapping by sender_id
            const other = conversation?.participants?.find(p => p !== user?.username) || 'user';
            const derivedSender = m.sender || m.sender_username || (m.sender_id === user?.id ? user?.username : other);
            return [...prev, { ...m, sender: derivedSender }];
          });
          // Auto-scroll only if user is near bottom; otherwise increment the new message counter
          setTimeout(() => {
            if (atBottom) {
              scrollToLatest();
            } else {
              setNewSinceScroll(c => c + 1);
            }
          }, 30);
        } else if (data?.event === 'typing') {
          // Show typing indicator for a short time only if the other user is typing
          if (data.user_id && user && data.user_id !== user.id) {
            setOtherTyping(true);
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => setOtherTyping(false), 1500);
          }
        } else if (data?.event === 'read') {
          // If the other user read, mark our sent messages as read
          if (data.user_id && user && data.user_id !== user.id) {
            setMessages(prev => prev.map(m => m.sender === user.username ? { ...m, is_read: true } : m));
          }
        }
      },
      onClose: () => {},
      onError: () => {},
    });
    wsRef.current = socket;
  return () => { try { close(); } catch { /* ignore */ } };
  }, [conversationId, user, conversation, atBottom]);

  // Mark read when messages change
  useEffect(() => { markReadIfNeeded(); }, [messages, markReadIfNeeded]);

  // Scroll to latest when messages appended (not when prepending older)
  const prevCountRef = useRef(0);
  useEffect(() => {
    if (firstRenderRef.current) { prevCountRef.current = messages.length; firstRenderRef.current = false; return; }
    if (messages.length > prevCountRef.current) {
      if (atBottom) scrollToLatest();
    }
    prevCountRef.current = messages.length;
  }, [messages, atBottom]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const trimmed = newMessage.trim();
    if ((trimmed.length === 0 && pendingFiles.length === 0) || sending) return;
    const files = pendingFiles;
    setNewMessage('');
    setPendingFiles([]);
    const tempId = 'temp-' + Date.now();
    const tempMessage = { id: tempId, content: trimmed, sender: user.username, pending: true, attachments: files.map((f, idx) => ({ id: `temp-att-${idx}`, name: f.name })) };
    setMessages(prev => [...prev, tempMessage]);
    setSending(true);
  setTimeout(() => scrollToLatest(), 10);
    try {
      // Prefer multipart when sending files; allow empty content when only attachments
      const response = files.length > 0
        ? await sendMessageMultipart(conversationId, { content: trimmed, files })
        : await sendMessage(conversationId, trimmed);
    setMessages(prev => prev.map(m => m.id === tempId ? response.data : m));
  setTimeout(() => scrollToLatest(), 20);
    } catch (err) {
      console.error('Failed to send message', err);
      setMessages(prev => prev.map(m => m.id === tempId ? { ...m, pending:false, failed:true } : m));
    } finally {
      setSending(false);
    }
  };

  // Typing indicator: fire when user types, throttled/debounced
  useEffect(() => {
    if (!newMessage || !conversationId) return;
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    if (!typingRef.current) {
      typingRef.current = true;
      wsRef.current.send(JSON.stringify({ action: 'typing' }));
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => { typingRef.current = false; }, 1500);
    return () => { if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current); };
  }, [newMessage, conversationId]);

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
  if (initialLoading) {
    return (
      <div className="chat-window" aria-busy="true">
        <div className="chat-header">
          <SkeletonAvatar size={40} />
          <div style={{ display:'flex', flexDirection:'column', gap:'.35rem' }}>
            <Skeleton variant="rect" height={14} width="120px" />
            <Skeleton variant="rect" height={12} width="200px" />
          </div>
        </div>
        <div className="safety-tip">
          <Skeleton variant="text" lines={2} />
        </div>
        <div className="messages-area" role="log" aria-busy="true">
          {Array.from({ length: 5 }).map((_,i)=>(
            <div key={i} className={`message-bubble-wrapper ${i%2===0 ? 'received':'sent'}`} aria-hidden="true">
              <div className="message-bubble skeleton-msg">
                <Skeleton variant="text" lines={2} />
              </div>
            </div>
          ))}
        </div>
        <form className="message-input-area" onSubmit={e=>e.preventDefault()} aria-disabled="true">
          <button type="button" className="attach-btn" disabled aria-hidden="true"><PaperclipIcon size={18} strokeWidth={1.7} /></button>
          <Skeleton variant="rect" height={40} style={{ flex:1, borderRadius:8 }} />
          <button type="button" className="send-button" disabled aria-hidden="true"><SendIcon size={18} strokeWidth={1.7} /></button>
        </form>
      </div>
    );
  }
  if (!conversation) return null;

  const otherParticipant = conversation.participants.find(p => p !== user?.username);
  const isOtherOwner = conversation?.listing?.user === otherParticipant;

  return (
    <div className="chat-window">
      <div className="chat-header">
        <InitialsAvatar name={otherParticipant} alt={t('messaging:avatarAlt', { user: otherParticipant })} className="avatar" size={40} />
        <div>
          <h3>
            {otherParticipant}
            {isOtherOwner && <span className="owner-badge" title={t('messaging:ownerTooltip','Listing owner')}>{t('messaging:owner','Owner')}</span>}
          </h3>
          <p>
            {otherTyping ? t('messaging:typing','Typing…') : (
              conversation?.listing?.user === user?.username
                ? t('messaging:buyerInterested', { title: conversation.listing.title, defaultValue: 'Interested in your {{title}}' })
                : t('messaging:youInterested', { title: conversation.listing.title, defaultValue: 'You are interested in {{title}}' })
            )}
          </p>
        </div>
      </div>
      <div className="safety-tip">
        <p><strong>{t('messaging:safetyTipTitle')}</strong> {t('messaging:safetyTipBody')}</p>
      </div>
      {!isOnline && (
        <div className="offline-banner" role="status" aria-live="polite">{t('messaging:offlineNotice','You are offline. Messages will send when you are back online.')}</div>
      )}
      <div 
        className="messages-area" 
        ref={scrollContainerRef}
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        aria-label={t('messaging:conversationWith', { user: otherParticipant })}
      >
        {hasMore && (
          <button
            type="button"
            className="load-older-btn"
            disabled={loadingOlder}
            onClick={() => page > 1 && loadMessagesPage(page - 1)}
            aria-label={t('messaging:loadOlderAria','Load older messages')}
            style={{ marginBottom: '1rem' }}
          >
                {loadingOlder ? (
                  <span style={{ display:'inline-flex', alignItems:'center', gap:6 }}>
                    <Spinner size={14} stroke={2} /> {t('common:loading')}
                  </span>
                ) : t('messaging:loadOlder')}
          </button>
        )}
            {loadingOlder && (
              Array.from({ length: 3 }).map((_,i)=>(
                <div key={`older-skel-${i}`} className={`message-bubble-wrapper ${i%2===0 ? 'received':'sent'}`} aria-hidden="true">
                  <div className="message-bubble skeleton-msg">
                    <Skeleton variant="text" lines={2} />
                  </div>
                </div>
              ))
            )}
        <ListingSnippet listing={conversation.listing} />
        {/* Render messages in natural order: oldest at top, newest at bottom. */}
        {messages.map((msg, idx) => {
          const statusLabel = msg.failed ? ` (${t('messaging:failedSend')})` : (msg.pending ? ' …' : '');
          const ts = msg.timestamp ? new Date(msg.timestamp) : null;
          const timeShort = ts ? ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
          const timeFull = ts ? ts.toLocaleString() : '';
          const showDateSeparator = (() => {
            if (!ts) return false;
            if (idx === 0) return true;
            const prev = messages[idx - 1];
            if (!prev?.timestamp) return true;
            const a = new Date(prev.timestamp);
            return a.getFullYear() !== ts.getFullYear() || a.getMonth() !== ts.getMonth() || a.getDate() !== ts.getDate();
          })();
          const dateLabel = ts ? ts.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' }) : '';
          return (
            <React.Fragment key={msg.id}>
              {showDateSeparator && (
                <div className="date-separator" role="separator" aria-label={dateLabel}>
                  <span>{dateLabel}</span>
                </div>
              )}
              <div className={`message-bubble-wrapper ${msg.sender === user?.username ? 'sent' : 'received'}`}>
                <div 
                className={`message-bubble ${msg.failed ? 'failed' : ''}`}
                role="article"
                aria-label={msg.sender === user?.username ? t('messaging:youSaid', { content: msg.content }) : t('messaging:userSaid', { user: msg.sender, content: msg.content })}
                >
                {msg.content}{statusLabel}
                {Array.isArray(msg.attachments) && msg.attachments.length > 0 && (
                  <div className="attachments">
                    {msg.attachments.map(att => (
                      <a key={att.id} href={att.url || '#'} target="_blank" rel="noopener noreferrer" className="attachment-link">
                        {att.name || t('messaging:attachment','Attachment')}
                      </a>
                    ))}
                  </div>
                )}
                {msg.sender === user?.username && (
                  <div className="message-meta" aria-hidden>
                    <span title={timeFull}>{timeShort}</span>
                    {' '}
                    {msg.is_read ? '✓✓' : '✓'}
                  </div>
                )}
                {msg.sender !== user?.username && ts && (
                  <div className="message-meta left" aria-hidden>
                    <span title={timeFull}>{timeShort}</span>
                  </div>
                )}
                {msg.failed && (
                  <button type="button" className="retry-btn" onClick={() => retryMessage(msg)}>{t('messaging:retrySend')}</button>
                )}
                </div>
              </div>
            </React.Fragment>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      {newSinceScroll > 0 && (
        <div className="new-messages-chip" role="status" aria-live="polite">
          <button type="button" onClick={() => { scrollToLatest(); setNewSinceScroll(0); }}>
            {t('messaging:newMessages',{ count: newSinceScroll, defaultValue: '{{count}} new messages' }).replace('{{count}}', String(newSinceScroll))}
          </button>
        </div>
      )}
      {/* Quick reply chips */}
      <div className="quick-replies" role="group" aria-label={t('messaging:quickReplies','Quick replies')}>
        {quickReplies.map((q, i) => (
          <button
            type="button"
            key={i}
            className="quick-reply-chip"
            onClick={() => setNewMessage(m => (m ? `${m} ${q}` : q))}
          >
            {q}
          </button>
        ))}
      </div>
      <form className="message-input-area" onSubmit={handleSendMessage}>
        <button
          type="button"
          className="attach-btn"
          aria-label={t('messaging:attach','Attach a file')}
          onClick={() => fileInputRef.current?.click()}
        >
          <PaperclipIcon size={18} strokeWidth={1.7} />
        </button>
        <input
          ref={el => (fileInputRef.current = el)}
          type="file"
          style={{ display: 'none' }}
          multiple
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            if (files.length) setPendingFiles(files);
          }}
        />
        <input
          type="text"
          placeholder={t('messaging:placeholder','Type your message...')}
          aria-label={t('messaging:messageInputLabel','Type a message')}
          maxLength={1000}
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          onPaste={(e) => {
            const files = Array.from(e.clipboardData?.files || []);
            if (files.length) {
              setPendingFiles(prev => [...prev, ...files]);
            }
          }}
        />
        {pendingFiles.length > 0 && (
          <div className="pending-files" aria-live="polite">
            {pendingFiles.slice(0, 3).map((f, i) => (
              <span key={i} className="pending-file-chip" title={f.name}>{f.name}</span>
            ))}
            {pendingFiles.length > 3 && <span className="pending-file-chip more">+{pendingFiles.length - 3}</span>}
            <button type="button" className="clear-files" onClick={() => setPendingFiles([])}>{t('messaging:clear','Clear')}</button>
          </div>
        )}
        <button type="submit" className="send-button" aria-label={t('messaging:sendMessageAria','Send message')} disabled={sending || !isOnline}>
          {sending ? <Spinner size={16} stroke={2} /> : <SendIcon size={18} strokeWidth={1.7} />}
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;