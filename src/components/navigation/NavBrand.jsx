import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Logo from '../../assets/logo.svg';

const NavBrand = () => {
  const { t } = useTranslation('navigation');
  return (
    <Link to="/" className="nav-brand" aria-label={t('brand')}>
      <img src={Logo} alt={t('brand')} className="nav-logo" />
      <span className="nav-brand-text">{t('brand')}</span>
    </Link>
  );
};

export default NavBrand;