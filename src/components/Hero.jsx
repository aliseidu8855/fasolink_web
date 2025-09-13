import React from 'react';
import './Hero.css';
import { IoSearch, IoLocationSharp } from 'react-icons/io5';
import { useTranslation } from 'react-i18next';


const Hero = () => {
  const { t } = useTranslation();

  return (
    <section className="hero-section">
      <div className="container">
        <h1 className="hero-title">
          {t('hero.title')} <span>{t('hero.country')}</span>
        </h1>
        <p className="hero-subtitle">
          {t('hero.subtitle')}
        </p>
        <form className="search-form">
          <input
            type="text"
            placeholder={t('hero.searchPlaceholder')}
            className="search-input"
          />
<button type="submit" className="search-button">
  <IoSearch size={20} />
</button>
        </form>
        <div className="location-selector">
          <IoLocationSharp style={{ color: 'var(--vert-foret)' }} />
          Ouagadougou...
        </div>
      </div>
    </section>
  );
};

export default Hero;
