import React, { useState, useEffect } from 'react';
import './Hero.css';
import { useTranslation } from 'react-i18next';
import { fetchListings } from '../services/api';
import { Link } from 'react-router-dom';

// The hero now focuses on quick discovery: prominent search, quick category pills, and trust stats.
const Hero = () => {
  const { t } = useTranslation(['home','categories']);
  const [featured, setFeatured] = useState([]);
  // Simple runtime flag: set to false to completely disable fetching & rendering featured cards
  const SHOW_FEATURED = false; // flip to true when ready for paid placement rollout

  useEffect(() => {
    // (categories for hero pills removed along with hero search)

    if (SHOW_FEATURED) {
      // Load a pool of latest listings and pick 2 random for hero feature (lightweight)
      const loadFeatured = async () => {
        try {
          const res = await fetchListings({ page_size: 12 });
          const items = Array.isArray(res.data?.results) ? res.data.results : (Array.isArray(res.data) ? res.data : []);
          if (items.length) {
            const shuffled = [...items].sort(() => Math.random() - 0.5).slice(0, 2);
            setFeatured(shuffled);
          }
        } catch { /* ignore listing load errors */ }
      };
      loadFeatured();
    }

  }, [SHOW_FEATURED]);

  // helper removed with hero categories

  return (
    <section className="hero-section" aria-labelledby="home-hero-heading">
      <div className="hero-bg-layer" />
      <div className="container hero-inner">
        <div className="hero-content">
          <h1 id="home-hero-heading" className="hero-title">
            {t('home:hero.title')}
          </h1>
          <p className="hero-subtitle">{t('home:hero.subtitle')}</p>

          {/* <div className="hero-cta-line">
            <a className="hero-cta-btn primary" href="/listings/new">{t('home:hero.postAd')}</a>
            <a className="hero-cta-btn secondary" href="/browse">{t('home:hero.browse')} →</a>
          </div> */}
          {/* Search removed from hero; keep discovery light here */}

          {/* {topCategories.length > 0 && (
            <div className="quick-categories" aria-label={t('home:hero.quickBrowse')}>
              <span className="qc-label">{t('home:hero.quickBrowse')}:</span>
              <ul>
                {topCategories.map(cat => (
                  <li key={cat.id}>
                    <Link to={`/listings?category=${cat.id}`}>{translateCategoryName(cat)}</Link>
                  </li>
                ))}
              </ul>
            </div>
          )} */}

          {SHOW_FEATURED && featured.length > 0 && (
            <div className="hero-featured" aria-label={t('home:hero.featured')}>
              {featured.map(item => (
                <Link key={item.id} to={`/listings/${item.id}`} className="hf-card">
                  <div className="hf-thumb">
                    {item.images?.length ? (
                      <img src={item.images[0].image || item.images[0].url} alt={item.title} loading="lazy" />
                    ) : (
                      <div className="hf-thumb-fallback" />
                    )}
                  </div>
                  <div className="hf-body">
                    <h3 className="hf-title">{item.title?.slice(0,48) || t('home:hero.listingFallback')}</h3>
                    {item.price && <div className="hf-price">{item.price} {item.currency || 'XOF'}</div>}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Hero;
