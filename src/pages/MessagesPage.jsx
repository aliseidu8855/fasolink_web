import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import ConversationList from '../components/messaging/ConversationList';
import ChatWindow from '../components/messaging/ChatWindow';
import LoggedInHeader from '../components/LoggedInHeader';
import './MessagesPage.css';
import { useAuth } from '../context/AuthContext';

const MessagesPage = () => {
  const { conversationId } = useParams();
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation(['messaging']);

  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handler = () => {
      const mobile = window.innerWidth <= 700;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(true); // always open on desktop
      } else {
        setSidebarOpen(false); // default closed on mobile
      }
    };
    handler();
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  // Open sidebar automatically if no conversation chosen on mobile
  useEffect(() => {
    if (isMobile && !conversationId) {
      setSidebarOpen(true);
    }
  }, [isMobile, conversationId]);

  return (
    <div className="messages-page-wrapper">
      <LoggedInHeader />
      <div className="messages-page-body">
        <div className={`messages-sidebar ${sidebarOpen ? 'open' : ''} ${isMobile ? 'mobile' : ''}`}>
          {isMobile && (
            <div className="sidebar-header">
              <button className="close-btn" onClick={() => setSidebarOpen(false)} aria-label={t('messaging:closeList')}>&times;</button>
              <h2 className="sidebar-title">{t('messaging:conversations')}</h2>
            </div>
          )}
          <ConversationList onSelect={() => { if (isMobile) setSidebarOpen(false); }} />
        </div>
        <div className="messages-main">
          {isMobile && !sidebarOpen && (
            <button className="open-sidebar-btn" onClick={() => setSidebarOpen(true)} aria-label={t('messaging:openList')}>
              {t('messaging:openList')}
            </button>
          )}
          {isAuthenticated ? (
            conversationId ? (
              <div className="chat-wrapper">
                {isMobile && (
                  <div className="chat-mobile-bar">
                    <button className="back-btn" onClick={() => setSidebarOpen(true)} aria-label={t('messaging:backToList')}>&larr; {t('messaging:back')}</button>
                  </div>
                )}
                <ChatWindow conversationId={conversationId} />
              </div>
            ) : (
              <div className="messages-placeholder">{t('messaging:selectConversation')}</div>
            )
          ) : (
            <div className="messages-placeholder">{t('messaging:loginToViewMessages')}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;