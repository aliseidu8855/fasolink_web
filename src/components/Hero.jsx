import React, { useState, useEffect } from 'react';
import './Hero.css';
import { IoSearch } from 'react-icons/io5';
import { useTranslation } from 'react-i18next';
import { fetchCategories, fetchListings, fetchStats } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';

// The hero now focuses on quick discovery: prominent search, quick category pills, and trust stats.
const Hero = () => {
  const { t } = useTranslation(['home']);
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [topCategories, setTopCategories] = useState([]);
  const [stats, setStats] = useState({ listings: null, users: null, categories: null });

  useEffect(() => {
    // Load a few categories for hero pills
    const loadCats = async () => {
      try {
        const res = await fetchCategories();
        setTopCategories(res.data.slice(0, 6));
      } catch {
        // ignore category load error; UI degrades gracefully
      }
    };
    loadCats();

    // Fetch aggregated stats if endpoint exists; fallback to previous method if needed
    const loadStats = async () => {
      try {
        const res = await fetchStats();
        if (res.data) {
          setStats({
            listings: res.data.listings ?? null,
            users: res.data.users ?? null,
            categories: res.data.categories ?? null
          });
          return;
        }
      } catch {
        // fallback to approximate listings count
      }
      try {
        const res = await fetchListings({ 'page-size': 1 });
        const total = res.data.count || res.data.results?.length || null;
        if (total) setStats(s => ({ ...s, listings: total }));
      } catch {/* ignore */}
    };
    loadStats();
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    navigate(`/listings?search=${encodeURIComponent(trimmed)}`);
  };

  return (
    <section className="hero-section" aria-labelledby="home-hero-heading">
      <div className="hero-bg-layer" />
      <div className="container hero-inner">
        <div className="hero-content">
          <h1 id="home-hero-heading" className="hero-title">
            {t('home:hero.title')}
          </h1>
          <p className="hero-subtitle">{t('home:hero.subtitle')}</p>

          <form className="hero-search" role="search" aria-label="Site" onSubmit={onSubmit}>
            <IoSearch className="search-icon" aria-hidden="true" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              type="text"
              placeholder={t('home:hero.searchPlaceholder')}
              aria-label={t('home:hero.searchPlaceholder')}
            />
            <button type="submit">{t('navigation:search', 'Search')}</button>
          </form>

          {topCategories.length > 0 && (
            <div className="quick-categories" aria-label={t('home:hero.quickBrowse')}>
              <span className="qc-label">{t('home:hero.quickBrowse')}:</span>
              <ul>
                {topCategories.map(cat => (
                  <li key={cat.id}>
                    <Link to={`/listings?category=${cat.id}`}>{cat.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="hero-stats" aria-label="platform stats">
            <div className="stat-item">
              <strong>{stats.listings ? (stats.listings > 999 ? (stats.listings/1000).toFixed(1).replace(/\.0$/,'') + 'k+' : stats.listings) : t('home:stats.listings')}</strong>
              <span>{t('home:hero.stats.listings')}</span>
            </div>
            <div className="stat-item">
              <strong>{stats.users ? (stats.users > 999 ? (stats.users/1000).toFixed(1).replace(/\.0$/,'') + 'k+' : stats.users) : t('home:stats.users')}</strong>
              <span>{t('home:hero.stats.users')}</span>
            </div>
            <div className="stat-item">
              <strong>{stats.categories ?? t('home:stats.secure')}</strong>
              <span>{t('home:hero.stats.categories')}</span>
            </div>
          </div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <svg className="hero-illustration" width="420" height="360" viewBox="0 0 420 360" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="heroGrad1" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#DE0000" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#009A00" stopOpacity="0.85" />
              </linearGradient>
              <filter id="heroShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="8" stdDeviation="14" floodOpacity="0.18" />
              </filter>
            </defs>
            <rect x="46" y="42" width="250" height="290" rx="26" fill="#fff" stroke="#E1E3E6" filter="url(#heroShadow)" />
            <rect x="70" y="82" width="200" height="90" rx="14" fill="#F4F6F8" />
            <rect x="70" y="186" width="160" height="14" rx="7" fill="#EAEDEF" />
            <rect x="70" y="206" width="120" height="14" rx="7" fill="#EAEDEF" />
            <rect x="70" y="232" width="200" height="70" rx="14" fill="#F7F9FA" />
            <circle cx="340" cy="118" r="66" fill="url(#heroGrad1)" opacity="0.20" />
            <circle cx="362" cy="248" r="40" fill="url(#heroGrad1)" opacity="0.28" />
            <path d="M340 88c8 0 14 6 14 14s-6 14-14 14-14-6-14-14 6-14 14-14zm0 6a8 8 0 100 16 8 8 0 000-16z" fill="#fff" opacity="0.95" />
            <path d="M362 226c6 0 10 4 10 10 0 7-10 16-10 16s-10-9-10-16c0-6 4-10 10-10z" fill="#fff" opacity="0.95" />
          </svg>
        </div>
      </div>
    </section>
  );
};

export default Hero;
