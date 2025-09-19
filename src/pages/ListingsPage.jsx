import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ListingCard from '../components/ListingCard';
import { fetchListingsPage } from '../services/api';
import '../components/dashboard/dashboard.css';
import './ListingsPage.css';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/Button';
import CategorySearchBar from '../components/navigation/CategorySearchBar';
import FilterChips from '../components/listings/FilterChips';
import FilterBottomSheet from '../components/listings/FilterBottomSheet';

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
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const qp = Object.fromEntries([...searchParams]);
  const initialQuery = qp.q || '';
  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebouncedValue(query, 400);
  const [filters, setFilters] = useState(()=>{
    const { q: _q, ordering: _ord, view: _view, ...rest } = qp; return rest;
  });
  const [ordering, setOrdering] = useState(qp.ordering || '-created_at');
  const [view, setView] = useState(qp.view === 'grid' ? 'grid' : 'compact');
  const initialPage = parseInt(qp.page || '1', 10) || 1;
  const [page, setPage] = useState(initialPage);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [showTopBtn, setShowTopBtn] = useState(false);
  const [pageSize, setPageSize] = useState(null); // determined after first load
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(null);
  const resultsRef = useRef(null);

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

  const abortRef = React.useRef();
  const loadPage = useCallback(async (targetPage) => {
    // cancel previous
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchListingsPage(targetPage, baseParams, { signal: controller.signal });
      const results = data.results || data;
      setListings(prev => {
        const next = Array.isArray(results) ? (targetPage === 1 ? results : [...prev, ...results]) : (targetPage === 1 ? [] : prev);
        // de-dupe by id in case of overlapping pages
        const seen = new Set();
        return next.filter(item => {
          const id = item && item.id != null ? item.id : Symbol('x');
          if (seen.has(id)) return false;
          seen.add(id);
          return true;
        });
      });
      if (targetPage === 1 && Array.isArray(results)) {
        setPageSize(results.length || null);
      }
      if (typeof data.count === 'number') {
        setTotalCount(data.count);
        const size = (pageSize || (Array.isArray(results) ? results.length : 0)) || 1;
        setTotalPages(Math.max(1, Math.ceil(data.count / size)));
      }
    } catch (e) {
      if (e?.name !== 'CanceledError' && e?.code !== 'ERR_CANCELED') {
        console.error(e);
  setError(t('listing:listingsPage.error', 'Failed to load listings'));
      }
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

  // Persist and restore scroll per filter set
  useEffect(() => {
    const key = `scroll:listings:${location.search}`;
    // restore on mount (debounced to allow content mount)
    const saved = Number(sessionStorage.getItem(key) || 0);
    if (!Number.isNaN(saved) && saved > 0) {
      setTimeout(() => window.scrollTo(0, saved), 0);
    }
    const onScroll = () => {
      sessionStorage.setItem(key, String(window.scrollY || document.documentElement.scrollTop || 0));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [location.search]);

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

  const onChipChange = (partial) => {
    setFilters(prev => ({ ...prev, ...partial }));
  };

  const openSheet = () => setSheetOpen(true);
  const closeSheet = () => setSheetOpen(false);
  const applySheet = (nextFilters) => {
    const nf = { ...(nextFilters || {}) };
    if (Object.prototype.hasOwnProperty.call(nf, 'search')) {
      setQuery(nf.search || '');
      delete nf.search;
    }
    setFilters(nf);
    // Anchor to results top
    const el = resultsRef.current;
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Sync from URL if user navigates with CategorySearchBar or external links
  useEffect(() => {
    const qpObj = Object.fromEntries([...searchParams]);
    const nextQuery = qpObj.q || '';
    if (nextQuery !== query) setQuery(nextQuery);
    const nextOrdering = qpObj.ordering || '-created_at';
    if (nextOrdering !== ordering) setOrdering(nextOrdering);
    const nextView = qpObj.view === 'grid' ? 'grid' : 'compact';
    if (nextView !== view) setView(nextView);
    const nextPage = parseInt(qpObj.page || '1', 10) || 1;
    if (nextPage !== page) setPage(nextPage);
    const { q: _q, ordering: _o, view: _v, page: _p, ...rest } = qpObj;
    // Only update filters if different
    if (JSON.stringify(rest) !== JSON.stringify(filters)) {
      setFilters(rest);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  const toggleView = () => setView(v => v === 'compact' ? 'grid' : 'compact');

  const displayCount = totalCount != null ? totalCount : listings.length;
  const resultsCountLabel = t('listing:listingsPage.resultsCount', { count: displayCount, defaultValue: '{{count}} results' })
    .replace('{{count}}', displayCount);

  return (
    <div className="lp-shell">
      <div className={`lp-loading-bar${loading ? ' active' : ''}`} aria-hidden={!loading} />
      <header className="lp-header" role="banner">
        <div className="lp-header-row" style={{gap:'.6rem', alignItems:'stretch'}}>
          <h1 className="lp-title" style={{marginBottom:'.25rem'}}>{t('listing:listingsPage.title','Browse Listings')}</h1>
          <div className="lp-embedded-search" style={{flex:1, minWidth:0}}>
            <CategorySearchBar />
          </div>
        </div>
        <FilterChips
          filters={filters}
          ordering={ordering}
          onChange={onChipChange}
          onChangeOrdering={setOrdering}
          onOpenSheet={openSheet}
        />
        <div className="lp-meta-row" aria-live="polite">{resultsCountLabel}</div>
      </header>
      <div className="lp-body">
  <section ref={resultsRef} className="lp-results" role="region" aria-label={t('listing:listingsPage.resultsAria','Results')}>
          <div className="lp-sort-row" style={{display:'flex', gap:'.75rem', justifyContent:'flex-end', alignItems:'center'}}>
            <button type="button" onClick={toggleView} className={`lp-view-toggle ${view}`} aria-pressed={view==='compact'} title={view==='compact'?t('listing:listingsPage.viewCompact','Compact view'):t('listing:listingsPage.viewGrid','Grid view')}>
              {view==='compact'?t('listing:listingsPage.viewGrid','Grid'):t('listing:listingsPage.viewCompact','Compact')}
            </button>
          </div>
          {error && (
            <div className="lp-error" role="alert">
              <p>{error}</p>
              <Button variant="primary" onClick={()=>loadPage(1)} size="sm">{t('listing:listingsPage.retry','Retry')}</Button>
            </div>
          )}
          {!error && listings.length === 0 && !loading && (
            <EmptyState
              title={t('listing:listingsPage.emptyTitle','No listings found')}
              description={t('listing:listingsPage.emptyDesc','Try adjusting filters or searching for a different term.')}
              primaryAction={{ label: t('listing:listingsPage.clearFilters','Clear filters'), onClick: ()=>{ setFilters({}); setQuery(''); setOrdering('-created_at'); } }}
              secondaryAction={{ label: t('listing:listingsPage.reload','Reload'), onClick: ()=>loadPage(1) }}
            />
          )}
          <div className={`listings-grid ${view==='compact' ? 'listings-grid-compact' : ''}`} role="list" aria-busy={loading}>
            {listings.map(l => (
              <ListingCard key={l.id} listing={l} compact={view==='compact'} minimal={view==='compact'} role="listitem" />
            ))}
            {loading && (
              Array.from({ length: listings.length ? Math.min(6, pageSize || 6) : 8 }).map((_, i) => (
                <div key={`sk-${i}`} className="listing-skel" aria-hidden="true">
                  <div className="skel-img" />
                  <div className="skel-line skel-line-1" />
                  <div className="skel-line skel-line-2" />
                </div>
              ))
            )}
          </div>
          {loading && listings.length > 0 && <p className="lp-loading-text">{t('listing:listingsPage.loading','Loading…')}</p>}
          {!loading && listings.length === 0 && !error && (
            <EmptyState
              title={t('listing:listingsPage.emptyTitle','No listings found')}
              description={t('listing:listingsPage.emptyDesc','Try adjusting filters or searching for a different term.')}
              primaryAction={{ label: t('listing:listingsPage.clearFilters','Clear filters'), onClick: ()=>{ setFilters({}); setQuery(''); setOrdering('-created_at'); } }}
              secondaryAction={{ label: t('listing:listingsPage.reload','Reload'), onClick: ()=>loadPage(1) }}
            />
          )}
          <nav className="lp-pagination" aria-label="Pagination" style={{display:'flex', justifyContent:'center', padding:'.5rem 0'}}>
            {page < totalPages && (
              <button type="button" className="pg-btn" onClick={()=>gotoPage(page+1)} disabled={loading}>
                {loading ? t('listing:listingsPage.loading','Loading…') : t('listing:pagination.loadMore','Load more')}
              </button>
            )}
          </nav>
        </section>
      </div>
      <FilterBottomSheet open={sheetOpen} initialFilters={{ ...filters, search: debouncedQuery }} onClose={closeSheet} onApply={applySheet} />
      {showTopBtn && (
        <button type="button" className="lp-back-top" onClick={scrollToTop} aria-label={t('listing:listingsPage.backToTop','Back to top')}>↑</button>
      )}
    </div>
  );
}
