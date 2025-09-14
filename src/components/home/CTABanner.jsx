import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import './CTABanner.css';

const CTABanner = () => {
  const { t } = useTranslation(['home','navigation']);
  return (
    <section className="cta-banner" aria-labelledby="cta-banner-title">
      <div className="container cta-inner">
        <div className="cta-copy">
          <h2 id="cta-banner-title">{t('home:cta.title')}</h2>
          <p>{t('home:cta.subtitle')}</p>
        </div>
        <div className="cta-action">
          <Link className="cta-btn" to="/listings/create">{t('home:cta.action')}</Link>
        </div>
      </div>
    </section>
  );
};

export default CTABanner;
