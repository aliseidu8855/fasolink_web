import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import ConversationList from '../components/messaging/ConversationList';
import ChatWindow from '../components/messaging/ChatWindow';
// Removed global LoggedInHeader for a focused messaging workspace
import './MessagesPage.css';
import { useAuth } from '../context/AuthContext';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/Button';

const MessagesPage = () => {
  const { conversationId } = useParams();
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation(['messaging']);

  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const chatScrollRef = useRef(null);

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

  // Scroll to top when conversation changes
  useEffect(()=>{
    if (conversationId) {
      // Try specific chat wrapper first
      const target = chatScrollRef.current || document.querySelector('.chat-wrapper');
      if (target) {
        target.scrollTop = 0;
      }
      // Fallback ensure window scroll also resets
      window.scrollTo({ top:0, behavior:'auto' });
    }
  }, [conversationId]);

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
            <span aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </span>
          </button>
        )}
        <div className="mt-left">
          <a href="/" className="mt-home" aria-label={t('common:home','Home')}>
            <span aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 11.5l9-8 9 8" />
                <path d="M5 10v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10" />
              </svg>
            </span>
          </a>
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
                <div ref={chatScrollRef} className="chat-scroll-anchor">
                  <ChatWindow conversationId={conversationId} />
                </div>
              </div>
            ) : (
              <EmptyState
                title={t('messaging:messages')}
                description={t('messaging:selectConversation')}
                secondaryAction={{ label: t('messaging:refresh'), onClick: ()=>window.location.reload() }}
              />
            )
          ) : (
            <EmptyState
              title={t('messaging:messages')}
              description={t('messaging:loginToViewMessages')}
              primaryAction={{ label: t('common:login','Login'), onClick: ()=>window.location.assign('/auth') }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;