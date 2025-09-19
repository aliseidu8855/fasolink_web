import React from 'react';
import './Testimonials.css';
import { useTranslation } from 'react-i18next';

const Testimonials = () => {
  const { t } = useTranslation(['home']);
  const items = [1,2,3];
  return (
    <section className="testimonials-section" aria-labelledby="home-testimonials">
      <div className="container">
        <h2 id="home-testimonials" className="testimonials-title">{t('home:testimonials.title','What People Say')}</h2>
        <div className="testimonials-grid">
          {items.map((i,idx) => {
            const name = t(`home:testimonials.items.${i}.name`, { defaultValue: i===1? 'Awa K.' : i===2? 'Moussa D.' : 'Fatou S.' });
            const role = t(`home:testimonials.items.${i}.role`, { defaultValue: i===1? 'Seller' : i===2? 'Buyer' : 'Entrepreneur' });
            const text = t(`home:testimonials.items.${i}.text`, { defaultValue: i===1? '“I sold my phone in less than 24 hours. Smooth experience!”' : i===2? '“Trusted sellers and fast responses. My go-to marketplace.”' : '“Great for reaching local customers without extra fees.”' });
            return (
              <div key={i} className="t-card" style={{transitionDelay:`${idx*80}ms`}}>
                <p className="t-text">{text}</p>
                <div className="t-meta">
                  <span className="t-avatar" aria-hidden="true">{name.charAt(0)}</span>
                  <div>
                    <strong className="t-name">{name}</strong>
                    <div className="t-role">{role}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
