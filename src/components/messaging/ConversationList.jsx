import React, { useState, useMemo } from 'react';
import { SearchIcon } from '../icons/Icons.jsx';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useMessaging } from '../../context/MessagingContext';
import formatRelativeTime from '../../utils/time';
import './ConversationList.css';
import { Skeleton, SkeletonAvatar } from '../ui/Skeleton';

const ConversationList = ({ onSelect }) => {
  const { conversationId: activeConversationId } = useParams();
  const { user } = useAuth();
  const { conversations, loading, refresh } = useMessaging();
  const { t } = useTranslation(['messaging','common']);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter(c => {
      const other = c.participants.find(p => p !== user?.username) || '';
      return (other.toLowerCase().includes(q) || (c.listing_title||'').toLowerCase().includes(q));
    });
  }, [query, conversations, user]);

  if (!user) return <div className="loading-pane"><p>{t('messaging:loadingUser')}</p></div>;

  const loadingSkeleton = loading && !conversations.length;

  const skeletonItems = loadingSkeleton ? Array.from({ length: 6 }).map((_,i)=>(
    <div className="convo-item skeleton" key={`sk-${i}`} aria-hidden="true">
      <SkeletonAvatar size={40} />
      <div className="convo-details" style={{ width:'100%' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'.35rem' }}>
          <Skeleton variant="rect" height={10} width="55%" />
          <Skeleton variant="rect" height={10} width="18%" />
        </div>
        <Skeleton variant="text" lines={2} />
        <Skeleton variant="rect" height={10} width="40%" style={{ marginTop:'.5rem' }} />
      </div>
    </div>
  )) : null;

  return (
    <div className="conversation-list-container">
      <div className="list-header">
        <h2>{t('messaging:messages')}</h2>
        <button className="refresh-btn" aria-label={t('messaging:refreshList','Refresh conversations')} onClick={()=>refresh()}>{t('messaging:refresh','↻')}</button>
      </div>
      <div className="search-bar">
        <span className="search-icon-inline" aria-hidden="true"><SearchIcon size={16} strokeWidth={1.6} /></span>
        <input 
          type="text" 
          value={query}
          onChange={e=>setQuery(e.target.value)}
          placeholder={t('messaging:searchPlaceholder')} 
          aria-label={t('messaging:search','Search conversations')} 
        />
      </div>
      <div className="conversations" aria-busy={loadingSkeleton}>
        {loadingSkeleton && skeletonItems}
        {!loadingSkeleton && (filtered.length > 0 ? filtered.map(convo => {
          // Find the other participant's name
          const otherParticipant = convo.participants.find(p => p !== user?.username);
          const unread = convo.unread_count && convo.unread_count > 0;

          return (
            <Link 
              to={`/messages/${convo.id}`} 
              key={convo.id} 
              className={`convo-item ${convo.id == activeConversationId ? 'active' : ''} ${unread ? 'unread' : ''}`}
              onClick={() => { if (onSelect) onSelect(convo.id); }}
            >
              <img
                src={`https://i.pravatar.cc/50?u=${otherParticipant}`}
                alt={t('messaging:avatarAlt', { user: otherParticipant || t('messaging:user','User') })}
                className="avatar"
              />
              <div className="convo-details">
                <div className="convo-header">
                  <span className="user-name">{otherParticipant || t('messaging:user','User')}</span>
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
          <div className="no-conversations">{query ? t('messaging:noMatches','No matches') : t('messaging:noConversations')}</div>
        ))}
      </div>
    </div>
  );
};

export default ConversationList;