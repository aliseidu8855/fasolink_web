import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { IoLogOutOutline, IoPersonCircle, IoSettingsOutline, IoHelpCircleOutline } from 'react-icons/io5';
import LanguageSwitcher from '../LanguageSwitcher';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

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

  return (
    <div className="user-menu" ref={ref}>
      <button className="user-trigger" onClick={toggle} aria-haspopup="menu" aria-expanded={open}>
        {user?.avatar ? (
          <img src={user.avatar} alt={user.username} className="avatar-thumb" />
        ) : (
          <IoPersonCircle size={28} />
        )}
        <span className="user-name-short">{user?.username || t('auth:username')}</span>
      </button>
      {open && (
        <div className="user-dropdown" role="menu">
          <div className="user-dropdown-header">{t('auth:loggedInAs', { user: user?.username || '' })}</div>
          {user?.email && <div className="user-email" title={user.email}>{user.email}</div>}
          <div className="user-dropdown-sep" />
          <Link to="/dashboard" role="menuitem" className="user-dropdown-item" onClick={close}>{t('navigation:dashboard')}</Link>
          <Link to="/dashboard" role="menuitem" className="user-dropdown-item" onClick={close}>{t('navigation:myListings')}</Link>
          <Link to="/messages" role="menuitem" className="user-dropdown-item" onClick={close}>{t('navigation:messages')}</Link>
          <Link to="/help" role="menuitem" className="user-dropdown-item" onClick={close}><IoHelpCircleOutline size={16} /> {t('navigation:help')}</Link>
          <Link to="/settings" role="menuitem" className="user-dropdown-item" onClick={close}><IoSettingsOutline size={16} /> Settings</Link>
          <div className="user-dropdown-sep" />
          <div className="user-dropdown-item" style={{ cursor:'default', justifyContent:'space-between' }}>
            <span style={{ fontSize:'var(--font-size-xs)', opacity:.8 }}>{t('navigation:account')}</span>
            <LanguageSwitcher />
          </div>
          <div className="user-dropdown-sep" />
          <button role="menuitem" className="user-dropdown-item logout" onClick={() => { logout(); close(); }}>
            <IoLogOutOutline /> {t('navigation:logout')}
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;