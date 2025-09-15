import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import AuthForms from '../../pages/AuthForms';
import './MobileBottomNav.css';
import { HomeIcon, CategoryIcon, MessageBubbleIcon, UserIcon, PlusCircleIcon } from '../icons/Icons.jsx';

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
    { to: '/', label: t('navigation:home','Accueil'), icon: <HomeIcon size={22} /> },
    { to: '/listings', label: t('navigation:categories','Catégories'), icon: <CategoryIcon size={22} /> },
    { action: handlePost, label: t('navigation:postAdShort','Vendre'), icon: <PlusCircleIcon size={22} />, special:true },
    { to: '/messages', label: t('navigation:messages','Messages'), icon: <MessageBubbleIcon size={22} /> },
    { to: '/dashboard', label: t('navigation:account','Compte'), icon: <UserIcon size={22} /> }
  ];

  return (
    <nav className="mobile-bottom-nav" aria-label={t('navigation:primary','Primary')}>      
      <ul>
        {navItems.map((item, idx) => (
          <li key={idx} className={item.action ? 'post-slot' : ''}>
            {item.action ? (
              <button type="button" onClick={item.action} className="mbn-btn post-btn" aria-label={item.label}>
                <span className="mbn-icon" aria-hidden="true">{item.icon}</span>
                <span className="mbn-label mbn-label-strong">{item.label}</span>
              </button>
            ) : (
              <NavLink to={item.to} end className={({isActive})=> 'mbn-btn' + (isActive ? ' active':'')} aria-label={item.label}>
                <span className="mbn-icon" aria-hidden="true">{item.icon}</span>
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
