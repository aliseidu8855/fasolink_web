import React, { useEffect } from 'react';
import { injectCategoryTranslations, ensureCategoriesNamespace } from '../../i18n';
import { fetchCategories } from '../../services/api';
import { useTranslation } from 'react-i18next';

/*
  CategoryTranslationProvider
  - Fetches categories once on mount
  - Builds a translation map keyed by slug (or normalized name)
  - Injects into i18n 'categories' namespace for current language
  - Supports dynamic language switch by re-injecting (optional future enhancement)
*/
export const CategoryTranslationProvider = ({ children }) => {
  const { i18n } = useTranslation();

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        await ensureCategoriesNamespace(i18n.language);
        const res = await fetchCategories();
        const list = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.results) ? res.data.results : []);
        const map = {};
        for (const cat of list) {
          const key = cat.slug || (cat.name ? cat.name.toLowerCase().replace(/[^a-z0-9]+/g,'-') : null);
            if (!key) continue;
          // For now use backend name as translation value (could be localized from server later)
          map[key] = cat.name || key;
        }
        if (!cancelled) injectCategoryTranslations(i18n.language, map);
      } catch (e) {
        if (import.meta?.env?.DEV) console.warn('[CategoryTranslationProvider] Failed to load categories', e);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [i18n.language]);

  return <>{children}</>;
};

export default CategoryTranslationProvider;
