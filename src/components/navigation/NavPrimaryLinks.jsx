import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const NavPrimaryLinks = ({ isAuthenticated }) => {
  const { t } = useTranslation('navigation');

  return (
    <nav className="nav-primary" aria-label="Primary">
      <NavLink to="/help">{t('help')}</NavLink>
      {isAuthenticated && (
        <>
          <NavLink to="/dashboard">{t('dashboard')}</NavLink>
          <NavLink to="/messages">{t('messages')}</NavLink>
        </>
      )}
    </nav>
  );
};

export default NavPrimaryLinks;