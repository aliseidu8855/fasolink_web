import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMessaging } from '../../context/MessagingContext';

const MessagesIndicator = () => {
  const { t } = useTranslation('navigation');
  const { unreadTotal } = useMessaging() || { unreadTotal: 0 };
  const unread = unreadTotal || 0;
  return (
    <Link to="/messages" className="nav-icon-btn" aria-label={t('messages')} data-unread={unread > 0 || undefined}>
      <span style={{ fontSize:'var(--fs-xs)', fontWeight:600 }}>{t('messages')}</span>
      {unread > 0 && <span className="badge badge-unread" aria-label={t('messaging:unreadTotal', { count: unread, defaultValue: `${unread} unread` })}>{unread}</span>}
    </Link>
  );
};

export default MessagesIndicator;