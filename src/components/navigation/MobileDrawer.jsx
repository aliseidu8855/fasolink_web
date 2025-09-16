import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
// Auth modal removed; using /auth route now
import LanguageSwitcher from '../LanguageSwitcher';
import MobileMenuToggle from './MobileMenuToggle';

// Simple body scroll lock helper
const lockBody = (locked) => {
  if (locked) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
};

const MobileDrawer = () => {
  const { t } = useTranslation('navigation');
  const { isAuthenticated } = useAuth();
  // const { openModal } = useModal(); (legacy)
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const firstFocusableRef = useRef(null);
  const panelRef = useRef(null);
  const previouslyFocusedRef = useRef(null);

  // Mark rest of the page inert when drawer is open for better a11y (non-standard but supported by many browsers behind flags; fallback via aria-hidden)
  useEffect(() => {
    const rootMain = document.querySelector('main');
    if (open) {
      if (rootMain) {
        rootMain.setAttribute('aria-hidden', 'true');
      }
    } else {
      if (rootMain) {
        rootMain.removeAttribute('aria-hidden');
      }
    }
  }, [open]);

  const close = () => setOpen(false);

  // Focus trap & Esc
  useEffect(() => {
    if (!open) return;
    lockBody(true);
    previouslyFocusedRef.current = document.activeElement;
    firstFocusableRef.current?.focus();

    const onKey = (e) => {
      if (e.key === 'Escape') close();
      if (e.key === 'Tab') {
        const focusable = panelRef.current.querySelectorAll('a, button');
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      lockBody(false);
      document.removeEventListener('keydown', onKey);
      previouslyFocusedRef.current?.focus?.();
    };
  }, [open]);

  // Close drawer automatically on route change
  useEffect(() => {
    if (open) {
      close();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <>
      <div className="nav-mobile-trigger">
        <MobileMenuToggle onOpen={() => setOpen(o => !o)} isOpen={open} />
      </div>
      {open && createPortal(
        <div className="mobile-drawer-overlay" role="dialog" aria-modal="true" aria-label={t('mobileMenu','Mobile menu')}>
          <div className="mobile-drawer-panel" ref={panelRef}>
            <div className="mobile-drawer-header">
              <button ref={firstFocusableRef} className="close-btn" onClick={close} aria-label={t('closeMenu','Close menu')}>
                <span style={{fontSize:'20px', lineHeight:1}}>×</span>
              </button>
              <LanguageSwitcher />
            </div>
            <nav className="mobile-drawer-nav">
              <NavLink to="/help" onClick={close}>{t('help')}</NavLink>
              {isAuthenticated && <NavLink to="/dashboard" onClick={close}>{t('dashboard')}</NavLink>}
              {isAuthenticated && <NavLink to="/messages" onClick={close}>{t('messages')}</NavLink>}
            </nav>
            <div className="mobile-drawer-actions">
              {isAuthenticated ? (
                <Link to="/create-listing" className="mobile-action-primary" onClick={close}>+ {t('postAd')}</Link>
              ) : (
                <Link to="/auth?mode=login" className="mobile-action-primary" onClick={close}>{t('signIn')}</Link>
              )}
            </div>
            <div className="mobile-drawer-footer">
              <p>&copy; {new Date().getFullYear()} FasoLink</p>
            </div>
          </div>
          <div className="mobile-drawer-backdrop" onClick={close} />
        </div>,
        document.body
      )}
    </>
  );
};

export default MobileDrawer;