import React from 'react';
import { Link } from 'react-router-dom';
import Button from './Button';
import './Header.css';
import { IoNotificationsOutline } from 'react-icons/io5';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext'; 
import AuthForms from '../pages/AuthForms';
import logoSvg from '../assets/logo.svg';

    const Header = () => {
      const { t } = useTranslation();
      const { isAuthenticated, user, logout } = useAuth();
      const { openModal } = useModal(); 

      const handleAuthClick = () => {
        openModal(<AuthForms />);
      };

      return (
        <header className="main-header">
          <div className="container header-container">
              <Link to="/" className="logo">
                <img src={logoSvg} alt="FasoLink Logo" />
              </Link>            
              <div className="header-actions">
              <IoNotificationsOutline size={24} className="notification-icon" />
              <LanguageSwitcher />
              {isAuthenticated ? (
                <>
                  <span>Welcome, {user?.username || 'User'}</span>
                      <Link to="/create-listing">
                        <Button variant="primary">Post Ad</Button>
                      </Link>
                  <Button onClick={logout} variant="secondary">Logout</Button>
                </>
              ) : (
                // The "Post Ad" button now also serves as the login/register trigger
                <Button onClick={handleAuthClick} variant="primary">
                  {t('header.postAd')}
                </Button>
              )}
            </div>
          </div>
        </header>
      );
    };

    export default Header;