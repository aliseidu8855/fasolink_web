import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useModal } from '../context/ModalContext';
import AuthForms from '../pages/AuthForms';
import Button from './Button';
import LanguageSwitcher from './LanguageSwitcher';
import logo from '../assets/logo.svg';
import './Header.css'; // We will share some base styles

const GuestHeader = ({ isScrolled }) => {
  const { t } = useTranslation(['navigation']);
  const { openModal } = useModal();

  const handleAuthClick = () => {
    openModal(<AuthForms />);
  };

  return (
    <header className={`main-header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container header-container">
        <Link to="/" className="logo">
          <img src={logo} alt={t('navigation:brand')} />
          <span>{t('navigation:brand')}</span>
        </Link>
        <nav className="guest-nav" aria-label="Main">
          <Link to="/listings" className="nav-link">{t('navigation:browse','Browse')}</Link>
          <Link to="/help" className="nav-link">{t('navigation:help')}</Link>
        </nav>
        <div className="header-actions">
          <LanguageSwitcher />
          <Button onClick={handleAuthClick} variant="primary">
            {t('navigation:postAd')}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default GuestHeader;