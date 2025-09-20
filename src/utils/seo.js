// Lightweight SEO head manager for Vite SPA
// Usage: import { useSEO } from '../utils/seo'; useSEO({ title: '...', description: '...', canonical: '...' })

import { useEffect } from 'react';

const setMeta = (name, content) => {
  if (!content) return;
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
};

const setProperty = (property, content) => {
  if (!content) return;
  let el = document.querySelector(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('property', property);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
};

const setLink = (rel, href) => {
  if (!href) return;
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
};

export function useSEO({ title, description, canonical, image, locale = 'fr_FR', hreflangs } = {}) {
  const hreflangKey = Array.isArray(hreflangs) ? JSON.stringify(hreflangs) : '';
  useEffect(() => {
    if (title) document.title = title;
    if (description) setMeta('description', description);
    if (canonical) setLink('canonical', canonical);
    // hreflang alternates: expects array of { href, hrefLang }
    if (Array.isArray(hreflangs)) {
      // Remove existing alternates we previously added
      document.querySelectorAll('link[rel="alternate"][data-seo="1"]').forEach(n => n.remove());
      hreflangs.forEach(({ href, hrefLang }) => {
        if (!href || !hrefLang) return;
        const el = document.createElement('link');
        el.setAttribute('rel', 'alternate');
        el.setAttribute('hreflang', hrefLang);
        el.setAttribute('href', href);
        el.setAttribute('data-seo', '1');
        document.head.appendChild(el);
      });
    }

    // Open Graph defaults
    const url = canonical || (typeof window !== 'undefined' ? window.location.href : undefined);
    if (url) setProperty('og:url', url);
    if (title) setProperty('og:title', title);
    if (description) setProperty('og:description', description);
    setProperty('og:type', 'website');
    if (image) setProperty('og:image', image);
    setProperty('og:locale', locale);

    // Twitter Card
    if (title) setMeta('twitter:title', title);
    if (description) setMeta('twitter:description', description);
    if (image) setMeta('twitter:image', image);
    setMeta('twitter:card', image ? 'summary_large_image' : 'summary');
  }, [title, description, canonical, image, locale, hreflangKey, hreflangs]);
}

export function canonicalForPath(path) {
  try {
    const base = window.location.origin;
    return base + path;
  } catch {
    return undefined;
  }
}
