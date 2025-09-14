import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import namespace resource bundles (explicit imports enable tree-shaking & clarity)
import enCommon from './locales/en/common.json';
import enNavigation from './locales/en/navigation.json';
import enAuth from './locales/en/auth.json';
import enListing from './locales/en/listing.json';
import enMessaging from './locales/en/messaging.json';
import enDashboard from './locales/en/dashboard.json';
import enErrors from './locales/en/errors.json';
import enHome from './locales/en/home.json';

import frCommon from './locales/fr/common.json';
import frNavigation from './locales/fr/navigation.json';
import frAuth from './locales/fr/auth.json';
import frListing from './locales/fr/listing.json';
import frMessaging from './locales/fr/messaging.json';
import frDashboard from './locales/fr/dashboard.json';
import frErrors from './locales/fr/errors.json';
import frHome from './locales/fr/home.json';

// Attempt to restore saved language first (undefined lets detector decide)
let savedLang;
try { savedLang = localStorage.getItem('appLanguage') || undefined; } catch { /* ignore */ }

const resources = {
  en: {
    common: enCommon,
    navigation: enNavigation,
    auth: enAuth,
    listing: enListing,
    messaging: enMessaging,
    dashboard: enDashboard,
    errors: enErrors,
    home: enHome,
  },
  fr: {
    common: frCommon,
    navigation: frNavigation,
    auth: frAuth,
    listing: frListing,
    messaging: frMessaging,
    dashboard: frDashboard,
    errors: frErrors,
    home: frHome,
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
  ns: ['common', 'navigation', 'auth', 'listing', 'messaging', 'dashboard', 'errors', 'home'],
    defaultNS: 'common',
    fallbackLng: 'en',
    lng: savedLang, // if defined will override detection
    debug: true, // disable in production
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
      caches: ['localStorage'],
    },
    // Return key if missing so it's visible during dev
    saveMissing: false,
    missingKeyHandler: function(lng, ns, key) {
      // Surface missing keys in dev tools without relying on process env (Vite provides import.meta.env)
      if (import.meta && import.meta.env && import.meta.env.DEV) {
        console.warn(`[i18n] Missing key: ${ns}:${key}`);
      }
    }
  });

// Persist language on change
i18n.on('languageChanged', (lng) => {
  try { localStorage.setItem('appLanguage', lng); } catch { /* ignore */ }
});

export default i18n;