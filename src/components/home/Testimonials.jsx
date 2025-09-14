import React from 'react';
import './Testimonials.css';
import { useTranslation } from 'react-i18next';

const testimonialsData = [
  { id:1, name:'Awa K.', role:'Seller', text:'“I sold my phone in less than 24 hours. Smooth experience!”' },
  { id:2, name:'Moussa D.', role:'Buyer', text:'“Trusted sellers and fast responses. My go-to marketplace.”' },
  { id:3, name:'Fatou S.', role:'Entrepreneur', text:'“Great for reaching local customers without extra fees.”' }
];

const Testimonials = () => {
  const { t } = useTranslation(['home']);
  return (
    <section className="testimonials-section" aria-labelledby="home-testimonials">
      <div className="container">
        <h2 id="home-testimonials" className="testimonials-title">{t('home:testimonials.title','What People Say')}</h2>
        <div className="testimonials-grid">
          {testimonialsData.map((tst,i) => (
            <div key={tst.id} className="t-card" style={{transitionDelay:`${i*80}ms`}}>
              <p className="t-text">{tst.text}</p>
              <div className="t-meta">
                <span className="t-avatar" aria-hidden="true">{tst.name.charAt(0)}</span>
                <div>
                  <strong className="t-name">{tst.name}</strong>
                  <div className="t-role">{tst.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
