import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import LanguageSwitcher from '../LanguageSwitcher';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { ShopIcon, MessageBubbleIcon, HelpCircleIcon, SettingsIcon, LogoutIcon } from '../icons/Icons';

const UserMenu = () => {
  const { user, logout } = useAuth();
  const { t } = useTranslation(['navigation','auth']);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const toggle = () => setOpen(o => !o);
  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) close(); };
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keyup', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keyup', onKey); };
  }, [open]);

  // Derive a deterministic background from username for good contrast
  const initials = useMemo(() => (user?.username || '?').slice(0, 1).toUpperCase(), [user?.username]);
  const avatarHue = useMemo(() => {
    const str = user?.username || 'user';
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return Math.abs(hash) % 360; // 0-359
  }, [user?.username]);
  const avatarBg = `hsl(${avatarHue} 70% 45%)`;
  const avatarFg = '#fff';

  return (
    <div className="user-menu" ref={ref}>
      <button className="user-trigger" onClick={toggle} aria-haspopup="menu" aria-expanded={open}>
        {user?.avatar ? (
          <img src={user.avatar} alt={user.username} className="avatar-thumb" />
        ) : (
          <span className="avatar-thumb" aria-hidden="true" style={{
            width: 32,
            height: 32,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: avatarBg,
            color: avatarFg,
            fontSize: 12,
            fontWeight: 700
          }}>{initials}</span>
        )}
        <span className="user-name-short">{user?.username || t('auth:username')}</span>
      </button>
      {open && (
        <div className="user-dropdown" role="menu">
          <div className="user-dropdown-header">{t('auth:loggedInAs', { user: user?.username || '' })}</div>
          {user?.email && <div className="user-email" title={user.email}>{user.email}</div>}
          <div className="user-dropdown-sep" />
          <Link to="/dashboard" role="menuitem" className="user-dropdown-item" onClick={close}>
            <span className="mdi"><ShopIcon size={18} /></span>
            <span className="mdi-text">
              <span className="mdi-title">{t('navigation:myShop')}</span>
              <span className="mdi-sub">{t('navigation:myShopSubtitle')}</span>
            </span>
          </Link>
          <Link to="/messages" role="menuitem" className="user-dropdown-item" onClick={close}>
            <span className="mdi"><MessageBubbleIcon size={18} /></span>
            <span className="mdi-title">{t('navigation:messages')}</span>
          </Link>
          <Link to="/help" role="menuitem" className="user-dropdown-item" onClick={close}>
            <span className="mdi"><HelpCircleIcon size={18} /></span>
            <span className="mdi-title">{t('navigation:help')}</span>
          </Link>
          <Link to="/settings" role="menuitem" className="user-dropdown-item" onClick={close}>
            <span className="mdi"><SettingsIcon size={18} /></span>
            <span className="mdi-title">{t('navigation:settings')}</span>
          </Link>
          <div className="user-dropdown-sep" />
          <div className="user-dropdown-item" style={{ cursor:'default', justifyContent:'space-between' }}>
            <span style={{ fontSize:'var(--font-size-xs)', opacity:.8 }}>{t('navigation:account')}</span>
            <LanguageSwitcher />
          </div>
          <div className="user-dropdown-sep" />
          <button role="menuitem" className="user-dropdown-item logout" onClick={() => { logout(); close(); }}>
            <span className="mdi"><LogoutIcon size={18} /></span>
            <span className="mdi-title">{t('navigation:logout')}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;