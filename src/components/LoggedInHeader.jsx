import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import Button from './Button';
import Logo from '../assets/logo.svg';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const LoggedInHeader = ({ isScrolled }) => {
  const { user, logout } = useAuth();
  const { t } = useTranslation(['navigation','auth','common']);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const toggle = () => setOpen(o => !o);
  const handleLogout = () => {
    logout();
    setOpen(false);
  };

  // Close on outside click or Esc
  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keyup', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keyup', handleKey);
    };
  }, [open]);

  return (
    <header className={`main-header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container header-container">
        <div className="header-left">
          <Link to="/" className="logo">
            <img src={Logo} alt={t('navigation:brand')} />
            <span>{t('navigation:brand')}</span>
          </Link>
          <nav className="main-nav">
            <NavLink to="/dashboard">{t('navigation:dashboard')}</NavLink>
            <NavLink to="/listings">{t('navigation:browse','Browse')}</NavLink>
            <NavLink to="/messages">{t('navigation:messages')}</NavLink>
            <NavLink to="/help">{t('navigation:help')}</NavLink>
          </nav>
        </div>
        <div className="header-right">
          <Button
            variant={location.pathname.startsWith('/create-listing') ? 'secondary' : 'primary'}
            onClick={() => navigate('/create-listing')}
            className={`post-ad-btn ${location.pathname.startsWith('/create-listing') ? 'active' : ''}`}
          >
            + {t('navigation:postAd')}
          </Button>
            <div className="icon-group" style={{ display:'flex', gap:'0.5rem' }}>
              <div className="icon-wrapper" style={{ position:'relative', fontSize:'var(--fs-xs)', fontWeight:600 }}>Notif<span className="notification-badge">2</span></div>
              <Link to="/messages" className="icon-wrapper" style={{ fontSize:'var(--fs-xs)', fontWeight:600 }}>{t('navigation:messages')}</Link>
            </div>
          <LanguageSwitcher />
          <div className="profile-menu-wrapper" ref={dropdownRef}>
            <button className="profile-trigger" onClick={toggle} aria-haspopup="true" aria-expanded={open}>
              {user?.avatar ? (
                <img src={user.avatar} alt={user.username} className="profile-avatar-thumb" />
              ) : (
                <span style={{
                  width:30,
                  height:30,
                  borderRadius:'50%',
                  background:'rgba(0,0,0,0.08)',
                  display:'flex',
                  alignItems:'center',
                  justifyContent:'center',
                  fontSize:'11px',
                  fontWeight:600,
                  color:'var(--brand-ink)'
                }}>{(user?.username||'?').slice(0,1).toUpperCase()}</span>
              )}
              <span className="profile-name-short">{user?.username || t('auth:username')}</span>
            </button>
            {open && (
              <div className="profile-dropdown">
                <div className="dropdown-header">{t('auth:loggedInAs', { user: user?.username || '' })}</div>
                <Link to="/dashboard" className="dropdown-item" onClick={() => setOpen(false)}>{t('navigation:dashboard')}</Link>
                <Link to="/dashboard" className="dropdown-item" onClick={() => setOpen(false)}>{t('navigation:myListings')}</Link>
                <Link to="/messages" className="dropdown-item" onClick={() => setOpen(false)}>{t('navigation:messages')}</Link>
                <div className="dropdown-separator" />
                <button className="dropdown-item logout" onClick={handleLogout}>
                  {t('navigation:logout')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default LoggedInHeader;