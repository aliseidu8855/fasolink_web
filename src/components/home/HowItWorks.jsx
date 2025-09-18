import React from 'react';
import { useTranslation } from 'react-i18next';
import './HowItWorks.css';
import { CompassIcon, MessageBubbleIcon, HandshakeIcon } from '../../components/icons/Icons';

const HowItWorks = () => {
  const { t } = useTranslation(['home']);
  const steps = [
    { key: 'browse', icon: <CompassIcon size={22} /> },
    { key: 'contact', icon: <MessageBubbleIcon size={22} /> },
    { key: 'deal', icon: <HandshakeIcon size={22} /> }
  ];
  // Motion/scroll reveal removed for a calmer professional presentation.

  return (
  <section className="hiw-section" aria-labelledby="how-it-works">
      <div className="container">
        <h2 id="how-it-works" className="hiw-title">{t('home:howItWorks.title')}</h2>
        <p className="hiw-caption">{t('home:listings.recentSubtitle')}</p>
        <div className="hiw-grid">
          {steps.map((s) => (
            <div key={s.key} className="hiw-card">
              <div className="hiw-icon" aria-hidden="true">{s.icon}</div>
              <h3>{t(`home:howItWorks.steps.${s.key}.title`)}</h3>
              <p>{t(`home:howItWorks.steps.${s.key}.desc`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
