import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import FilterSidebar from '../components/FilterSidebar';
import ListingCard from '../components/ListingCard';
import SortBar from '../components/SortBar';
import { fetchListingsPage } from '../services/api';
import '../components/dashboard/dashboard.css';
import './ListingsPage.css';

// Debounce helper (simple)
const useDebouncedValue = (value, delay) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
};

export default function ListingsPage() {
  const { t } = useTranslation(['listing']);
  const [searchParams, setSearchParams] = useSearchParams();
  const qp = Object.fromEntries([...searchParams]);
  const initialQuery = qp.q || '';
  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebouncedValue(query, 400);
  const [filters, setFilters] = useState(()=>{
    const { q: _q, ordering: _ord, view: _view, ...rest } = qp; return rest;
  });
  const [ordering, setOrdering] = useState(qp.ordering || '-created_at');
  const [view, setView] = useState(qp.view === 'compact' ? 'compact' : 'grid');
  const initialPage = parseInt(qp.page || '1', 10) || 1;
  const [page, setPage] = useState(initialPage);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showTopBtn, setShowTopBtn] = useState(false);
  const [pageSize, setPageSize] = useState(null); // determined after first load
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(null);

  const baseParams = useMemo(() => ({
    ...filters,
    search: debouncedQuery || undefined,
    ordering,
  }), [filters, debouncedQuery, ordering]);

  // Sync URL when core state changes (including page)
  useEffect(()=>{
    const next = { ...filters };
    if (query) next.q = query; else delete next.q;
    if (ordering && ordering !== '-created_at') next.ordering = ordering; else delete next.ordering;
    if (view === 'compact') next.view = 'compact'; else delete next.view;
    if (page > 1) next.page = String(page); else delete next.page;
    setSearchParams(next);
  }, [filters, query, ordering, view, page, setSearchParams]);

  const loadPage = useCallback(async (targetPage) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchListingsPage(targetPage, baseParams);
      const results = data.results || data;
      setListings(Array.isArray(results) ? results : []);
      if (targetPage === 1 && Array.isArray(results)) {
        setPageSize(results.length || null);
      }
      if (typeof data.count === 'number') {
        setTotalCount(data.count);
        const size = (pageSize || (Array.isArray(results) ? results.length : 0)) || 1;
        setTotalPages(Math.max(1, Math.ceil(data.count / size)));
      }
    } catch (e) {
      console.error(e);
      setError(t('listingsPage.error', 'Failed to load listings'));
    } finally {
      setLoading(false);
    }
  }, [baseParams, t, pageSize]);

  // When filters/query/ordering change, reset to page 1 (load triggered by separate effect)
  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, filters, ordering]);

  // Load whenever page changes OR base params change but page stays 1
  useEffect(()=>{
    loadPage(page);
  }, [page, loadPage]);

  // Scroll listener for back-to-top button
  useEffect(()=>{
    const onScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop;
      setShowTopBtn(y > 800); // show after some scroll depth
    };
    window.addEventListener('scroll', onScroll, { passive:true });
    return ()=> window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top:0, behavior:'smooth' });
  };

  const gotoPage = (p) => {
    const target = Math.max(1, Math.min(p, totalPages));
    setPage(target);
  };

  const onFilterChange = (f) => { setFilters(f); };

  const toggleView = () => setView(v => v === 'compact' ? 'grid' : 'compact');

  const displayCount = totalCount != null ? totalCount : listings.length;
  const resultsCountLabel = t('listingsPage.resultsCount', { count: displayCount, defaultValue: '{{count}} results' })
    .replace('{{count}}', displayCount);

  return (
    <div className="lp-shell">
      <div className={`lp-loading-bar${loading ? ' active' : ''}`} aria-hidden={!loading} />
      <header className="lp-header" role="banner">
        <div className="lp-header-row">
          <h1 className="lp-title">{t('listingsPage.title','Browse Listings')}</h1>
          <div className="lp-search-group" role="search">
            <label htmlFor="listing-search" className="visually-hidden">{t('listingsPage.searchLabel','Search listings')}</label>
            <input
              id="listing-search"
              type="search"
              value={query}
              onChange={(e)=>setQuery(e.target.value)}
              placeholder={t('listingsPage.searchPlaceholder','Search products, brands...')}
              className="lp-search"
            />
            <button type="button" className="lp-filters-toggle" onClick={()=>setShowFilters(s=>!s)} aria-expanded={showFilters}>
              {showFilters ? t('listingsPage.hideFilters','Hide Filters') : t('listingsPage.showFilters','Filters')}
            </button>
          </div>
        </div>
        <div className="lp-meta-row" aria-live="polite">{resultsCountLabel}</div>
      </header>
      <div className="lp-body">
        <aside className={`lp-filters${showFilters ? ' open' : ''}`} aria-label={t('listingsPage.filtersAria','Filters')}>
          <FilterSidebar onFilterChange={onFilterChange} />
        </aside>
        <section className="lp-results" role="region" aria-label={t('listingsPage.resultsAria','Results')}>
          <div className="lp-sort-row" style={{display:'flex', gap:'.75rem', justifyContent:'flex-end', alignItems:'center'}}>
            <button type="button" onClick={toggleView} className={`lp-view-toggle ${view}`} aria-pressed={view==='compact'} title={view==='compact'?t('listingsPage.viewCompact','Compact view'):t('listingsPage.viewGrid','Grid view')}>
              {view==='compact'?t('listingsPage.viewGrid','Grid'):t('listingsPage.viewCompact','Compact')}
            </button>
            <SortBar onChange={setOrdering} />
          </div>
          {error && (
            <div className="lp-error" role="alert">
              <p>{error}</p>
              <button className="btn" onClick={()=>loadPage(1)}>{t('listingsPage.retry','Retry')}</button>
            </div>
          )}
          {!error && listings.length === 0 && !loading && (
            <p className="lp-empty">{t('listingsPage.empty','No listings found')}</p>
          )}
          <div className={`listings-grid ${view==='compact' ? 'listings-grid-compact' : ''}`} role="list" aria-busy={loading}>
            {listings.map(l => (
              <ListingCard key={l.id} listing={l} compact={view==='compact'} role="listitem" />
            ))}
          </div>
          {loading && <p className="lp-loading-text">{t('listingsPage.loading','Loading…')}</p>}
          {!loading && listings.length === 0 && !error && (
            <p className="lp-empty">{t('listingsPage.empty','No listings found')}</p>
          )}
          <nav className="lp-pagination" aria-label="Pagination">
            <button type="button" className="pg-btn" onClick={()=>gotoPage(page-1)} disabled={page<=1}>{t('pagination.prev','Previous')}</button>
            <span className="pg-status">{t('pagination.pageOf', { page, total: totalPages, defaultValue: `Page ${page} of ${totalPages}` })}</span>
            <button type="button" className="pg-btn" onClick={()=>gotoPage(page+1)} disabled={page>=totalPages}>{t('pagination.next','Next')}</button>
          </nav>
        </section>
      </div>
      {showTopBtn && (
        <button type="button" className="lp-back-top" onClick={scrollToTop} aria-label={t('listingsPage.backToTop','Back to top')}>↑</button>
      )}
    </div>
  );
}
