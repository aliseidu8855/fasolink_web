import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import ConversationList from '../components/messaging/ConversationList';
import ChatWindow from '../components/messaging/ChatWindow';
// Removed global LoggedInHeader for a focused messaging workspace
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
      const mobile = window.innerWidth <= 720; // align with CSS breakpoint
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
    <div className="messages-page-wrapper" data-mobile={isMobile}>
      <div className="messages-topbar" role="banner">
        {isMobile && (
          <button
            className="mt-menu-btn"
            aria-label={sidebarOpen ? t('messaging:closeList') : t('messaging:openList')}
            aria-expanded={sidebarOpen}
            onClick={() => setSidebarOpen(o => !o)}
          >
            <span aria-hidden="true">☰</span>
          </button>
        )}
        <div className="mt-left">
          <a href="/" className="mt-home" aria-label={t('common:home','Home')}>🏠</a>
          <h1 className="mt-title">{t('messaging:messages')}</h1>
        </div>
        <div className="mt-right">
          {/* future actions */}
        </div>
      </div>
      <div className="messages-page-body">
        <div className={`messages-sidebar ${sidebarOpen ? 'open' : ''} ${isMobile ? 'mobile' : ''}`}>
          {isMobile && (
            <div className="sidebar-header">
              <h2 className="sidebar-title">{t('messaging:conversations')}</h2>
              <button className="close-btn" onClick={() => setSidebarOpen(false)} aria-label={t('messaging:closeList')}>&times;</button>
            </div>
          )}
          <ConversationList onSelect={() => { if (isMobile) setSidebarOpen(false); }} />
        </div>
        <div className="messages-main">
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
              <div className="messages-placeholder" role="status">{t('messaging:selectConversation')}</div>
            )
          ) : (
            <div className="messages-placeholder" role="status">{t('messaging:loginToViewMessages')}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;