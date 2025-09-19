import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMessaging } from '../context/MessagingContext';

// Lightweight, dismissible banner shown when there are unread messages and user isn't on the messages page.
// Auto-hides when navigating to /messages. Persists per-session only (sessionStorage).
export default function UnreadMessagesBanner() {
  const { t } = useTranslation(['messaging']);
  const { unreadTotal } = useMessaging() || { unreadTotal: 0 };
  const location = useLocation();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);

  const isMessagesRoute = location.pathname.startsWith('/messages');

  useEffect(() => {
    // Restore session dismissal state
    try {
      const v = sessionStorage.getItem('unreadBanner:dismissed');
      setDismissed(v === '1');
    } catch {
      // ignore storage access issues
    }
  }, []);

  useEffect(() => {
    // Auto-hide when entering messages route
    if (isMessagesRoute && dismissed) {
      setDismissed(true);
    }
  }, [isMessagesRoute, dismissed]);

  if (isMessagesRoute || dismissed || unreadTotal <= 0) return null;

  const onOpenMessages = () => navigate('/messages');
  const onDismiss = () => {
    setDismissed(true);
    try { sessionStorage.setItem('unreadBanner:dismissed', '1'); } catch {
      // ignore storage access issues
    }
  };

  return (
    <div role="status" aria-live="polite" style={container}>
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <span aria-hidden="true" style={dot} />
        <span>{t('messaging:youHaveUnread', { count: unreadTotal, defaultValue: unreadTotal === 1 ? 'You have 1 unread message' : `You have ${unreadTotal} unread messages` })}</span>
      </div>
      <div style={{ display:'flex', gap:8 }}>
        <button onClick={onOpenMessages} style={primaryBtn}>{t('messaging:viewMessages','View')}</button>
        <button onClick={onDismiss} style={ghostBtn}>{t('messaging:dismiss','Dismiss')}</button>
      </div>
    </div>
  );
}

const container = {
  position: 'fixed',
  left: 16,
  right: 16,
  bottom: 84, // above MobileBottomNav
  zIndex: 1100,
  background: 'var(--color-bg-surface, #fff)',
  color: 'var(--color-text, #111)',
  border: '1px solid var(--color-border, #ddd)',
  borderRadius: 8,
  padding: '10px 12px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 8,
};

const primaryBtn = {
  background: 'var(--color-brand, #DE0000)',
  color: 'var(--color-on-brand, #fff)',
  border: 'none',
  borderRadius: 6,
  padding: '8px 12px',
  cursor: 'pointer',
  fontWeight: 600,
};

const ghostBtn = {
  background: 'transparent',
  color: 'inherit',
  border: '1px solid var(--color-border, #ddd)',
  borderRadius: 6,
  padding: '8px 12px',
  cursor: 'pointer',
};

const dot = {
  width: 10,
  height: 10,
  borderRadius: '50%',
  background: 'var(--brand-peach, #fecaca)',
};
