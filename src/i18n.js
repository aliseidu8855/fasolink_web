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
import enDashboardExtended from './locales/en/dashboard/extended.json';
import enErrors from './locales/en/errors.json';
import enHome from './locales/en/home.json';
import enCreateListing from './locales/en/createListing.json';
import enCategories from './locales/en/categories.json';

import frCommon from './locales/fr/common.json';
import frNavigation from './locales/fr/navigation.json';
import frAuth from './locales/fr/auth.json';
import frListing from './locales/fr/listing.json';
import frMessaging from './locales/fr/messaging.json';
import frDashboard from './locales/fr/dashboard.json';
import frDashboardExtended from './locales/fr/dashboard/extended.json';
import frErrors from './locales/fr/errors.json';
import frHome from './locales/fr/home.json';
import frCreateListing from './locales/fr/createListing.json';
import frCategories from './locales/fr/categories.json';

// Force French default: ignore any previously saved language for now
try { localStorage.setItem('appLanguage','fr'); } catch { /* ignore */ }

// Static resources bundled at build time
const resources = {
  en: {
    common: enCommon,
    navigation: enNavigation,
    auth: enAuth,
    listing: enListing,
    messaging: enMessaging,
  dashboard: { ...enDashboard, ...enDashboardExtended },
    errors: enErrors,
    home: enHome,
    createListing: enCreateListing,
    categories: enCategories,
  },
  fr: {
    common: frCommon,
    navigation: frNavigation,
    auth: frAuth,
    listing: frListing,
    messaging: frMessaging,
  dashboard: { ...frDashboard, ...frDashboardExtended },
    errors: frErrors,
    home: frHome,
    createListing: frCreateListing,
    categories: frCategories,
  }
};

// Core namespaces critical for first contentful paint
const CORE_NAMESPACES = ['common','navigation','home','listing'];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
  ns: ['common', 'navigation', 'auth', 'listing', 'messaging', 'dashboard', 'errors', 'home', 'createListing', 'categories'],
    defaultNS: 'common',
    preload: CORE_NAMESPACES, // hint initial preload
    fallbackLng: 'fr',
    lng: 'fr', // always initialize French
    debug: true, // disable in production
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
      caches: ['localStorage'],
    },
    saveMissing: false,
    missingKeyHandler: function(lng, ns, key) {
      if (import.meta?.env?.DEV) {
        console.warn(`[i18n] Missing key: ${ns}:${key}`);
      }
    }
  });

// Dynamic category translation injection helper
export const injectCategoryTranslations = (lng, map) => {
  if (!map || typeof map !== 'object') return;
  const ns = 'categories';
  const existing = i18n.getResourceBundle(lng, ns) || {};
  const merged = { ...existing };
  for (const [k, v] of Object.entries(map)) {
    // Do not overwrite existing localized strings; only fill gaps
    if (merged[k] == null || merged[k] === '') {
      merged[k] = v;
    }
  }
  // Deep merge, do not overwrite existing values
  i18n.addResourceBundle(lng, ns, merged, true, true);
};

// Preload categories namespace lazily when needed
export const ensureCategoriesNamespace = async (lng = i18n.language) => {
  const hasNs = i18n.hasResourceBundle(lng, 'categories');
  if (!hasNs) {
    i18n.addResourceBundle(lng, 'categories', {}, true, true);
  }
};

// Persist language on change
const setHtmlLang = (lng) => {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lng;
  }
};

i18n.on('languageChanged', (lng) => {
  try { localStorage.setItem('appLanguage', lng); } catch { /* ignore */ }
  setHtmlLang(lng);
});

// Set immediately after init
setHtmlLang('fr');

export default i18n;