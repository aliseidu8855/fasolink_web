import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import './HowItWorks.css';

const HowItWorks = () => {
  const { t } = useTranslation(['home']);
  const steps = [
    { key: 'browse', icon: '🧭' },
    { key: 'contact', icon: '💬' },
    { key: 'deal', icon: '🤝' }
  ];
  const sectionRef = useRef(null);
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const cards = Array.from(el.querySelectorAll('.hiw-card'));
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.35 });
    cards.forEach(c => obs.observe(c));
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="hiw-section" aria-labelledby="how-it-works">
      <div className="container">
        <h2 id="how-it-works" className="hiw-title">{t('home:howItWorks.title')}</h2>
        <div className="hiw-grid">
          {steps.map((s,i) => (
            <div key={s.key} className="hiw-card" style={{ transitionDelay: `${i*70}ms` }}>
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
