import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Footer.css';

const Footer = () => {
  const { t } = useTranslation(['common']);
  return (
    <footer className="main-footer">
      <div className="container footer-grid">
        <div className="footer-about">
          <h3 className="footer-logo">FasoLink</h3>
          <p>{t('common:footer.tagline')}</p>
          {/* Add social icons here later */}
        </div>
        <div className="footer-links">
          <h4 className="footer-heading">{t('common:footer.quickLinks')}</h4>
          <ul>
            <li><Link to="/categories">{t('common:footer.browseCategories')}</Link></li>
            <li><Link to="/post-ad">{t('common:footer.postAd')}</Link></li>
            <li><Link to="/safety">{t('common:footer.safetyTips')}</Link></li>
            <li><Link to="/help">{t('common:footer.helpCenter')}</Link></li>
          </ul>
        </div>
        <div className="footer-links">
          <h4 className="footer-heading">{t('common:footer.categories')}</h4>
          <ul>
            <li><Link to="/listings?category=electronics">{t('listing:categoryElectronics', 'Electronics')}</Link></li>
            <li><Link to="/listings?category=cars">{t('listing:categoryCars', 'Cars')}</Link></li>
            <li><Link to="/listings?category=real-estate">{t('listing:categoryRealEstate', 'Real Estate')}</Link></li>
            <li><Link to="/listings?category=fashion">{t('listing:categoryFashion', 'Fashion')}</Link></li>
          </ul>
        </div>
        <div className="footer-contact">
          <h4 className="footer-heading">{t('common:footer.contact')}</h4>
          <p>{t('common:footer.phone')}</p>
          <p>{t('common:footer.email')}</p>
          <p>{t('common:footer.address')}</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} FasoLink. {t('common:footer.rights')} {t('common:footer.madeWith')}</p>
      </div>
    </footer>
  );
};

export default Footer;