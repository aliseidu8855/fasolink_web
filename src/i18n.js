import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import enTranslation from './locales/en/translation.json';
import frTranslation from './locales/fr/translation.json';

i18n
  .use(LanguageDetector) // Detect user language
  .use(initReactI18next) // Pass i18n down to react-i18next
  .init({
    debug: true, // Set to false in production
    fallbackLng: 'en', // Use 'en' if detected language is not available
    interpolation: {
      escapeValue: false, // React already safes from xss
    },
    resources: {
      en: {
        translation: enTranslation,
      },
      fr: {
        translation: frTranslation,
      },
    },
  });

export default i18n;