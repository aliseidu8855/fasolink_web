import React from 'react';
import { useTranslation } from 'react-i18next';
import './LanguageSwitcher.css';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="language-switcher" aria-label="Sélecteur de langue">
      <button
        onClick={() => changeLanguage('fr')}
        className={i18n.language === 'fr' ? 'active primary' : 'primary'}
        aria-current={i18n.language === 'fr' ? 'true' : 'false'}
      >🇫🇷 FR</button>
      <button
        onClick={() => changeLanguage('en')}
        className={i18n.language === 'en' ? 'active' : ''}
        aria-current={i18n.language === 'en' ? 'true' : 'false'}
      >🇬🇧 EN</button>
    </div>
  );
};

export default LanguageSwitcher;