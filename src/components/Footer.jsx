import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Footer.css';
import { FacebookIcon, TwitterIcon, InstagramIcon } from './icons/SocialIcons.jsx';

const Footer = () => {
  const { t, i18n } = useTranslation(['common','listing']);
  const currentYear = new Date().getFullYear();
  const changeLang = (lng) => { i18n.changeLanguage(lng); };

  // Collapsible sections: default collapsed on mobile, expanded on desktop
  const [isMobile, setIsMobile] = useState(false);
  const [open, setOpen] = useState({ quick: true, categories: true, contact: true });

  useEffect(() => {
    const init = () => {
      const mobile = window.innerWidth <= 720;
      setIsMobile(mobile);
      if (mobile) {
        setOpen({ quick: false, categories: false, contact: false });
      } else {
        setOpen({ quick: true, categories: true, contact: true });
      }
    };
    init();
    const onResize = () => {
      const mobile = window.innerWidth <= 720;
      setIsMobile(mobile);
      // When switching to desktop, force all open; keep user toggles on mobile
      if (!mobile) {
        setOpen({ quick: true, categories: true, contact: true });
      }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const toggle = (key) => {
    if (!isMobile) return; // disable toggling on desktop
    setOpen(o => ({ ...o, [key]: !o[key] }));
  };

  return (
    <footer className="main-footer" role="contentinfo">
      <div className="container footer-grid">
        {isMobile && (
          <div className="ft-all-toggle" style={{gridColumn:'1 / -1', marginTop:'-0.5rem', marginBottom:'.25rem'}}>
            <button
              type="button"
              className="btn btn-link"
              onClick={() => {
                const anyClosed = !open.quick || !open.categories || !open.contact;
                setOpen({ quick: true, categories: true, contact: true });
                if (!anyClosed) {
                  // If all were open, collapse all
                  setOpen({ quick: false, categories: false, contact: false });
                }
              }}
            >
              {(!open.quick || !open.categories || !open.contact) ? t('common:footer.showAll') : t('common:footer.hideAll')}
            </button>
          </div>
        )}
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
        <nav className="footer-links ft-section" aria-label={t('common:footer.quickLinks')}>
          <button
            type="button"
            className="footer-heading ft-toggle"
            aria-expanded={open.quick}
            aria-controls="ft-sec-quick"
            aria-disabled={!isMobile}
            onClick={() => toggle('quick')}
          >
            {t('common:footer.quickLinks')}
          </button>
          <div id="ft-sec-quick" className={`ft-content${open.quick ? ' open' : ''}`}>
            <ul>
              <li><Link to="/categories">{t('common:footer.browseCategories')}</Link></li>
              <li><Link to="/post-ad">{t('common:footer.postAd')}</Link></li>
              <li><Link to="/safety">{t('common:footer.safetyTips')}</Link></li>
              <li><Link to="/help">{t('common:footer.helpCenter')}</Link></li>
            </ul>
          </div>
        </nav>
        {/* Category Navigation */}
        <nav className="footer-links ft-section" aria-label={t('common:footer.categories')}>
          <button
            type="button"
            className="footer-heading ft-toggle"
            aria-expanded={open.categories}
            aria-controls="ft-sec-categories"
            aria-disabled={!isMobile}
            onClick={() => toggle('categories')}
          >
            {t('common:footer.categories')}
          </button>
          <div id="ft-sec-categories" className={`ft-content${open.categories ? ' open' : ''}`}>
            <ul>
              <li><Link to="/listings?category=electronics">{t('listing:categoryElectronics')}</Link></li>
              <li><Link to="/listings?category=cars">{t('listing:categoryCars')}</Link></li>
              <li><Link to="/listings?category=real-estate">{t('listing:categoryRealEstate')}</Link></li>
              <li><Link to="/listings?category=fashion">{t('listing:categoryFashion')}</Link></li>
            </ul>
          </div>
        </nav>
        <div className="footer-contact ft-section">
          <button
            type="button"
            className="footer-heading ft-toggle"
            aria-expanded={open.contact}
            aria-controls="ft-sec-contact"
            aria-disabled={!isMobile}
            onClick={() => toggle('contact')}
          >
            {t('common:footer.contact')}
          </button>
          <div id="ft-sec-contact" className={`ft-content${open.contact ? ' open' : ''}`}>
            <p>{t('common:footer.phone')}</p>
            <p>{t('common:footer.email')}</p>
            <p>{t('common:footer.address')}</p>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© {currentYear} FasoLink. {t('common:footer.rights')} {t('common:footer.madeWith')}</p>
      </div>
    </footer>
  );
};

export default Footer;