import React, { useState, useEffect, useRef } from 'react';
import { SearchIcon } from '../icons/Icons.jsx';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { fetchConversations } from '../../services/api';
import { useAuth } from '../../context/AuthContext'; // To identify the other user
import formatRelativeTime from '../../utils/time';
import './ConversationList.css';

const ConversationList = () => {
  const { conversationId: activeConversationId } = useParams(); // Get active ID from URL
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const { t } = useTranslation(['messaging','common']);
  const [loading, setLoading] = useState(true);
  const pollRef = useRef(null);

  const pageVisible = () => document.visibilityState === 'visible';

  useEffect(() => {
    if (!user) return; // wait for user before fetching
    let isCancelled = false;
    const getConversations = async (silent=false) => {
      try {
        if (!silent) setLoading(true);
        const response = await fetchConversations();
        if (!isCancelled) setConversations(response.data);
      } catch (error) {
        if (!isCancelled) console.error("Failed to fetch conversations", error);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };
    getConversations();
    // Visibility aware polling every 5s
    pollRef.current = setInterval(() => {
      if (pageVisible()) getConversations(true);
    }, 5000);
    return () => {
      isCancelled = true;
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [user]);

  if (!user) return <div className="loading-pane"><p>{t('messaging:loadingUser')}</p></div>;
  if (loading) return <div className="loading-pane"><p>{t('messaging:loadingConversations')}</p></div>;

  return (
    <div className="conversation-list-container">
      <div className="list-header">
        <h2>{t('messaging:messages')}</h2>
      </div>
      <div className="search-bar">
        <span className="search-icon-inline" aria-hidden="true"><SearchIcon size={16} strokeWidth={1.6} /></span>
        <input type="text" placeholder={t('messaging:searchPlaceholder')} aria-label={t('messaging:search','Search')} />
      </div>
      <div className="conversations">
        {conversations.length > 0 ? conversations.map(convo => {
          // Find the other participant's name
          const otherParticipant = convo.participants.find(p => p !== user?.username);
          const unread = convo.unread_count && convo.unread_count > 0;

          return (
            <Link 
              to={`/messages/${convo.id}`} 
              key={convo.id} 
              className={`convo-item ${convo.id == activeConversationId ? 'active' : ''} ${unread ? 'unread' : ''}`}
            >
              <img src={`https://i.pravatar.cc/50?u=${otherParticipant}`} alt="User" className="avatar" />
              <div className="convo-details">
                <div className="convo-header">
                  <span className="user-name">{otherParticipant || 'User'}</span>
                  <span className="timestamp">{formatRelativeTime(convo.last_message_timestamp)}</span>
                </div>
                <p className="last-message">{convo.last_message || t('listing:interestedInYour', { title: convo.listing_title })}</p>
                <div className="listing-tag">{convo.listing_title}</div>
                {unread && (
                  <span className="unread-badge">
                    {convo.unread_count > 99
                      ? '99+'
                      : (convo.unread_count === 1
                          ? t('messaging:unreadOne')
                          : t('messaging:unreadMany', { count: convo.unread_count })
                        )
                    }
                  </span>
                )}
              </div>
            </Link>
          );
        }) : (
          <div className="no-conversations">{t('messaging:noConversations')}</div>
        )}
      </div>
    </div>
  );
};

export default ConversationList;