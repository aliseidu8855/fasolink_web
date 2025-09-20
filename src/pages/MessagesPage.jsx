import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRightIcon, CloseIcon } from '../components/icons/Icons.jsx';
import ConversationList from '../components/messaging/ConversationList';
import ChatWindow from '../components/messaging/ChatWindow';
import './MessagesPage.css';
import { useAuth } from '../context/AuthContext';
import EmptyState from '../components/ui/EmptyState';

const MessagesPage = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation(['messaging']);

  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true); // desktop default
  const chatScrollRef = useRef(null);

  useEffect(() => {
    const handler = () => {
      const mobile = window.innerWidth <= 720; // keep in sync with CSS
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };
    handler();
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  // Reset scroll when switching conversation
  useEffect(() => {
    if (conversationId) {
      const target = chatScrollRef.current || document.querySelector('.chat-wrapper');
      if (target) target.scrollTop = 0;
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [conversationId]);

  return (
    <div className="container messages-page-wrapper" data-mobile={isMobile}>
      <div className="messages-page-body">
        {isMobile ? (
          <div className="messages-main">
            {isAuthenticated ? (
              conversationId ? (
                <div className="chat-wrapper">
                  <div className="chat-mobile-bar">
                    <button
                      className="back-btn"
                      onClick={() => navigate('/messages')}
                      aria-label={t('messaging:backToList')}
                    >
                      <span aria-hidden="true" style={{ display:'inline-block', transform:'rotate(180deg)' }}>
                        <ArrowRightIcon size={18} />
                      </span>
                    </button>
                  </div>
                  <div ref={chatScrollRef} className="chat-scroll-anchor">
                    <ChatWindow conversationId={conversationId} />
                  </div>
                </div>
              ) : (
                <ConversationList />
              )
            ) : (
              <EmptyState
                title={t('messaging:messages')}
                description={t('messaging:loginToViewMessages')}
                primaryAction={{ label: t('common:login','Login'), onClick: ()=>window.location.assign('/auth') }}
              />
            )}
          </div>
        ) : (
          <>
            <div className={`messages-sidebar ${sidebarOpen ? 'open' : ''}`}>
              <ConversationList />
            </div>
            <div className="messages-main">
              {isAuthenticated ? (
                conversationId ? (
                  <div className="chat-wrapper">
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
          </>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;