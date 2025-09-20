import React from 'react';
import { useTranslation } from 'react-i18next';
import Hero from '../components/Hero';
import ListingRow from '../components/ListingRow';
import HowItWorks from '../components/home/HowItWorks';
import CategoryChips from '../components/home/CategoryChips';
import './HomePage.css';
import { useSEO, canonicalForPath } from '../utils/seo';

const HomePage = () => {
  const { t } = useTranslation(['home']);
  const canonical = canonicalForPath('/');
  const hreflangs = [
    { href: canonical, hrefLang: 'fr' },
    { href: canonical, hrefLang: 'x-default' },
  ];
  useSEO({
    title: 'FasoLink – Achetez et vendez facilement',
    description: 'FasoLink: Plateforme pour vendre et acheter rapidement des produits en toute confiance.',
    canonical,
    hreflangs,
  });
  const websiteJsonLd = (typeof window !== 'undefined') ? {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "FasoLink",
    "url": window.location.origin + "/",
    "potentialAction": {
      "@type": "SearchAction",
      "target": window.location.origin + "/listings?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  } : null;
  return (
    <>
      {websiteJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
      )}
      <Hero />
      <main className="home-main" id="main-content">
        <div className="home-section">
          <CategoryChips />
        </div>
        <div className="home-section">
          <ListingRow
            title={t('home:listings.recentTitle','Recent Listings')}
            apiParams={{ ordering: '-created_at' }}
            compact
            pageSize={12}
          />
        </div>
        <div className="home-section">
          <HowItWorks />
        </div>
        {/** CTA banner intentionally removed. Re-enable by importing CTABanner and adding here. */}
      </main>
    </>
  );
};

export default HomePage;