import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { fetchCategories, fetchListings } from '../../services/api';
import { SearchIcon, CloseIcon, ChevronDownIcon } from '../icons/Icons';

// Senior UX: a unified bar that lets users pick a category chip and type a query.
// Keyboard-friendly, accessible, debounced suggestions, and recent searches.
export default function CategorySearchBar() {
  const { t } = useTranslation(['navigation','categories']);
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const initialQ = params.get('q') || '';
  const initialCat = params.get('category');

  const [query, setQuery] = useState(initialQ);
  const [selectedCat, setSelectedCat] = useState(initialCat || '');
  const [cats, setCats] = useState([]);
  const [catOpen, setCatOpen] = useState(false);
  const [catFilter, setCatFilter] = useState('');
  const [loadingCats, setLoadingCats] = useState(false);

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggest, setShowSuggest] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const abortRef = useRef(null);

  const recent = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('recentSearches') || '[]'); } catch { return []; }
  }, []);

  // Load categories on first open or if none
  useEffect(() => {
    if (!catOpen || cats.length || loadingCats) return;
    setLoadingCats(true);
    fetchCategories()
      .then(res => setCats(res.data || []))
  .catch(() => { /* ignore category load errors */ })
      .finally(() => setLoadingCats(false));
  }, [catOpen, cats.length, loadingCats]);

  // Suggestions
  const loadSuggestions = useCallback(async (q) => {
    if (abortRef.current) abortRef.current.abort();
    if (!q || q.length < 2) { setSuggestions([]); return; }
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const res = await fetchListings({ search: q, category: selectedCat || undefined, page: 1 });
      const data = Array.isArray(res.data?.results) ? res.data.results : (Array.isArray(res.data) ? res.data : []);
      setSuggestions(data.slice(0, 6));
  } catch { /* ignore suggestion errors */ }
  }, [selectedCat]);

  useEffect(() => {
    const h = setTimeout(() => loadSuggestions(query), 250);
    return () => clearTimeout(h);
  }, [query, loadSuggestions]);

  const submit = (e) => {
    e?.preventDefault();
    const trimmed = query.trim();
    const sp = new URLSearchParams();
    if (trimmed) sp.set('q', trimmed);
    if (selectedCat) sp.set('category', selectedCat);
    if (trimmed) {
      try {
        const existing = JSON.parse(localStorage.getItem('recentSearches') || '[]');
        const next = [trimmed, ...existing.filter(x => x !== trimmed)].slice(0,6);
        localStorage.setItem('recentSearches', JSON.stringify(next));
  } catch { /* ignore localStorage errors */ }
    }
    setShowSuggest(false);
    navigate({ pathname: '/listings', search: sp.toString() ? `?${sp.toString()}` : '' });
  };

  const onKeyDown = (e) => {
    if (!showSuggest) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlight(h => (h + 1) % Math.max(1, suggestions.length)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlight(h => (h - 1 + Math.max(1, suggestions.length)) % Math.max(1, suggestions.length)); }
    else if (e.key === 'Enter') {
      if (highlight >= 0 && suggestions[highlight]) {
        navigate(`/listings/${suggestions[highlight].id}`);
        e.preventDefault();
      }
    } else if (e.key === 'Escape') { setShowSuggest(false); }
  };

  const filteredCats = useMemo(() => {
    if (!catFilter.trim()) return cats;
    const q = catFilter.trim().toLowerCase();
    return cats.filter(c => (c.name || '').toLowerCase().includes(q));
  }, [cats, catFilter]);

  const selectedCatLabel = useMemo(() => {
    const found = cats.find(c => String(c.id) === String(selectedCat));
    return found ? (found.name || '') : t('categories');
  }, [cats, selectedCat, t]);

  return (
    <div className="cat-search-root">
      {/* Category chip + input */}
      <form className="cat-search-form" role="search" aria-label={t('searchMobileLabel')} onSubmit={submit} onKeyDown={onKeyDown}>
        <button
          type="button"
          className={`cat-chip ${selectedCat ? 'active' : ''}`}
          aria-haspopup="menu"
          aria-expanded={catOpen}
          onClick={() => setCatOpen(o => !o)}
        >
          <span className="cat-chip-label">{selectedCat ? selectedCatLabel : t('categories')}</span>
          <span aria-hidden className="cat-chip-chevron"><ChevronDownIcon size={14} /></span>
        </button>
        <input
          className="cat-search-input"
          placeholder={t('searchPlaceholder')}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setShowSuggest(true); setHighlight(-1); }}
          onFocus={() => setShowSuggest(true)}
        />
        {query && (
          <button type="button" className="cat-search-clear" aria-label={t('clear','Clear')} onClick={() => { setQuery(''); setShowSuggest(false); }}>
            <CloseIcon size={16} />
          </button>
        )}
        <button type="submit" className="cat-search-submit">
          <span className="cssb-icn" aria-hidden><SearchIcon size={16} strokeWidth={2} /></span>
          <span className="cssb-lbl">{t('search')}</span>
        </button>
      </form>

      {/* Category popover */}
      {catOpen && (
        <div className="cat-popover" role="menu" aria-label={t('categories')}>
          <div className="cat-popover-search">
            <input
              value={catFilter}
              onChange={(e)=>setCatFilter(e.target.value)}
              placeholder={t('filterPlaceholder','Filter...')}
              autoFocus
            />
          </div>
          <div className="cat-popover-list" role="listbox">
            {loadingCats && <div className="cat-popover-empty">...</div>}
            {!loadingCats && filteredCats.length === 0 && (
              <div className="cat-popover-empty">{t('noResults')}</div>
            )}
            {!loadingCats && filteredCats.map(c => (
              <button
                key={c.id}
                type="button"
                className={`cat-popover-item ${String(selectedCat)===String(c.id) ? 'selected' : ''}`}
                onClick={() => { setSelectedCat(String(c.id)); setCatOpen(false); }}
              >
                <span>{c.name}</span>
                {typeof c.listings_count === 'number' && (
                  <span className="cat-popover-count" aria-hidden>{c.listings_count.toLocaleString()}</span>
                )}
              </button>
            ))}
            {selectedCat && (
              <button type="button" className="cat-popover-item clear" onClick={() => { setSelectedCat(''); setCatOpen(false); }}>
                {t('clear')}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Suggestions popover */}
      {showSuggest && (
        <div className="cat-suggest" role="listbox">
          {query.length < 2 && recent.length > 0 && (
            <div className="cat-suggest-block">
              <div className="cat-suggest-header">
                <span>{t('recent','Recent')}</span>
              </div>
              {recent.slice(0,6).map(r => (
                <button key={r} type="button" className="cat-suggest-item" onClick={() => navigate({ pathname: '/listings', search: `?q=${encodeURIComponent(r)}${selectedCat?`&category=${selectedCat}`:''}` })}>
                  {r}
                </button>
              ))}
            </div>
          )}
          {query.length >= 2 && suggestions.length === 0 && (
            <div className="cat-suggest-empty">{t('noResults')}</div>
          )}
          {suggestions.map((s, i) => (
            <button key={s.id} type="button" role="option" aria-selected={highlight===i} className={`cat-suggest-item ${highlight===i?'active':''}`} onMouseEnter={()=>setHighlight(i)} onClick={()=>navigate(`/listings/${s.id}`)}>
              <span className="cat-suggest-title">{s.title || s.name || `#${s.id}`}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
