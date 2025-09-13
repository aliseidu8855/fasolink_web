import React from 'react';
import { useTranslation } from 'react-i18next';
import './LanguageSwitcher.css';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="language-switcher">
      <button 
        onClick={() => changeLanguage('en')} 
        className={i18n.language === 'en' ? 'active' : ''}
      >
        EN
      </button>
      <button 
        onClick={() => changeLanguage('fr')} 
        className={i18n.language === 'fr' ? 'active' : ''}
      >
        FR
      </button>
    </div>
  );
};

export default LanguageSwitcher;