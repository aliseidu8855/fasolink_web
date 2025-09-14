import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { IoHomeOutline, IoChatbubblesOutline, IoAddCircle, IoPersonCircleOutline, IoGridOutline } from 'react-icons/io5';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import AuthForms from '../../pages/AuthForms';
import './MobileBottomNav.css';

// Compact bottom navigation for mobile devices.
// Appears only below a max-width breakpoint (handled via CSS).
const MobileBottomNav = () => {
  const { t } = useTranslation(['navigation']);
  const { isAuthenticated, captureIntendedPath } = useAuth();
  const { openModal } = useModal();
  const navigate = useNavigate();

  const handlePost = () => {
    if (!isAuthenticated) {
      captureIntendedPath('/create-listing');
      openModal(<AuthForms />);
    } else {
      navigate('/create-listing');
    }
  };

  const navItems = [
    { to: '/', icon: <IoHomeOutline size={24} />, label: t('navigation:home','Home') },
    { to: '/listings', icon: <IoGridOutline size={24} />, label: t('navigation:categories','Categories') },
    { action: handlePost, icon: <IoAddCircle size={46} className="mbn-post-icon" />, label: t('navigation:postAdShort','Post') },
    { to: '/messages', icon: <IoChatbubblesOutline size={24} />, label: t('navigation:messages','Messages') },
    { to: '/dashboard', icon: <IoPersonCircleOutline size={24} />, label: t('navigation:account','Account') }
  ];

  return (
    <nav className="mobile-bottom-nav" aria-label={t('navigation:primary','Primary')}>      
      <ul>
        {navItems.map((item, idx) => (
          <li key={idx} className={item.action ? 'post-slot' : ''}>
            {item.action ? (
              <button type="button" onClick={item.action} className="mbn-btn post-btn" aria-label={item.label}>
                {item.icon}
                <span className="mbn-label">{item.label}</span>
              </button>
            ) : (
              <NavLink to={item.to} end className={({isActive})=> 'mbn-btn' + (isActive ? ' active':'')} aria-label={item.label}>
                {item.icon}
                <span className="mbn-label">{item.label}</span>
              </NavLink>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default MobileBottomNav;
