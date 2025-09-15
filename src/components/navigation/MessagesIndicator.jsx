import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { fetchConversations } from '../../services/api';
import { useTranslation } from 'react-i18next';

// Simple visibility check
const isVisible = () => document.visibilityState === 'visible';

const MessagesIndicator = () => {
  const { t } = useTranslation('navigation');
  const [unread, setUnread] = useState(0);
  const timerRef = useRef(null);

  const load = async (silent = true) => {
    try {
      const res = await fetchConversations();
      const totalUnread = res.data.reduce((acc, c) => acc + (c.unread_count || 0), 0);
      setUnread(totalUnread);
    } catch (e) {
      if (!silent) console.error('Failed to fetch conversations', e);
    }
  };

  useEffect(() => {
    load(false);
    timerRef.current = setInterval(() => {
      if (isVisible()) load();
    }, 15000);
    const handleVis = () => { if (isVisible()) load(); };
    document.addEventListener('visibilitychange', handleVis);
    return () => {
      clearInterval(timerRef.current);
      document.removeEventListener('visibilitychange', handleVis);
    };
  }, []);

  return (
    <Link to="/messages" className="nav-icon-btn" aria-label={t('messages')} data-unread={unread > 0 || undefined}>
      <span style={{ fontSize:'var(--fs-xs)', fontWeight:600 }}>{t('messages')}</span>
      {unread > 0 && <span className="badge badge-unread" aria-label={`${unread} unread`}>{unread}</span>}
    </Link>
  );
};

export default MessagesIndicator;