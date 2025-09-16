import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Footer.css';
import { FacebookIcon, TwitterIcon, InstagramIcon } from './icons/SocialIcons.jsx';

const Footer = () => {
  const { t, i18n } = useTranslation(['common','listing']);
  const currentYear = new Date().getFullYear();
  const changeLang = (lng) => { i18n.changeLanguage(lng); };

  return (
    <footer className="main-footer" role="contentinfo">
      <div className="container footer-grid">
        <div className="footer-about">
          <h3 className="footer-logo">FasoLink</h3>
          <p>{t('common:footer.tagline')}</p>
          <div className="footer-social" aria-labelledby="footer-social-label">
            <span id="footer-social-label" className="visually-hidden">{t('common:footer.socialLabel')}</span>
            <ul className="social-list">
              <li>
                <a href="#" aria-label={t('common:footer.socialFacebook')} className="social-btn disabled" role="button" tabIndex={0}>
                  <FacebookIcon size={18} />
                </a>
              </li>
              <li>
                <a href="#" aria-label={t('common:footer.socialTwitter')} className="social-btn disabled" role="button" tabIndex={0}>
                  <TwitterIcon size={18} />
                </a>
              </li>
              <li>
                <a href="#" aria-label={t('common:footer.socialInstagram')} className="social-btn disabled" role="button" tabIndex={0}>
                  <InstagramIcon size={18} />
                </a>
              </li>
            </ul>
          </div>
          <div className="footer-lang-switch" aria-label={t('common:footer.languageSwitch')}>
            <button type="button" onClick={() => changeLang('en')} className={i18n.language.startsWith('en') ? 'active' : ''}>EN</button>
            <button type="button" onClick={() => changeLang('fr')} className={i18n.language.startsWith('fr') ? 'active' : ''}>FR</button>
          </div>
        </div>
        {/* Quick Links Navigation */}
        <nav className="footer-links" aria-label={t('common:footer.quickLinks')}>
          <h4 className="footer-heading">{t('common:footer.quickLinks')}</h4>
          <ul>
            <li><Link to="/categories">{t('common:footer.browseCategories')}</Link></li>
            <li><Link to="/post-ad">{t('common:footer.postAd')}</Link></li>
            <li><Link to="/safety">{t('common:footer.safetyTips')}</Link></li>
            <li><Link to="/help">{t('common:footer.helpCenter')}</Link></li>
          </ul>
        </nav>
        {/* Category Navigation */}
        <nav className="footer-links" aria-label={t('common:footer.categories')}>
          <h4 className="footer-heading">{t('common:footer.categories')}</h4>
          <ul>
            <li><Link to="/listings?category=electronics">{t('listing:categoryElectronics')}</Link></li>
            <li><Link to="/listings?category=cars">{t('listing:categoryCars')}</Link></li>
            <li><Link to="/listings?category=real-estate">{t('listing:categoryRealEstate')}</Link></li>
            <li><Link to="/listings?category=fashion">{t('listing:categoryFashion')}</Link></li>
          </ul>
        </nav>
        <div className="footer-contact">
          <h4 className="footer-heading">{t('common:footer.contact')}</h4>
          <p>{t('common:footer.phone')}</p>
          <p>{t('common:footer.email')}</p>
          <p>{t('common:footer.address')}</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© {currentYear} FasoLink. {t('common:footer.rights')} {t('common:footer.madeWith')}</p>
      </div>
    </footer>
  );
};

export default Footer;