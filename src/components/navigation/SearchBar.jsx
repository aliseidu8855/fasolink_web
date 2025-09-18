import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SearchIcon, CloseIcon } from '../icons/Icons.jsx';
// Location removed for now; keep core query search only
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { fetchListings } from '../../services/api';

// Clean, debounced search with suggestions + mobile overlay.
const SearchBar = ({ variant = 'desktop' }) => {
  const { t } = useTranslation('navigation');
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const initialQ = params.get('q') || '';
  const [query, setQuery] = useState(initialQ);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggest, setShowSuggest] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  // Location disabled (future): no location state
  const [recent, setRecent] = useState(() => {
    try {
      const raw = localStorage.getItem('recentSearches');
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });
  const abortRef = useRef(null);
  const formRef = useRef(null);
  // location anchor removed

  // slugify no longer needed (location removed)

  // Location disabled: skip persisted load

  // Location disabled: skip URL loc parsing

  const submit = (e) => {
    e?.preventDefault();
    const trimmed = query.trim();
  // Build search params (location removed)
    const sp = new URLSearchParams();
    if (trimmed) sp.set('q', trimmed);
    if (trimmed) {
      setRecent(prev => {
        const next = [trimmed, ...prev.filter(p => p !== trimmed)].slice(0,6);
        localStorage.setItem('recentSearches', JSON.stringify(next));
        return next;
      });
    }
    setShowSuggest(false);
    setQuery('');
  navigate({ pathname: '/listings', search: sp.toString() ? `?${sp.toString()}` : '' });
  };

  const loadSuggestions = useCallback(async (q) => {
    if (abortRef.current) abortRef.current.abort();
    if (!q || q.length < 2) { setSuggestions([]); return; }
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const res = await fetchListings({ search: q, page: 1 });
      const data = Array.isArray(res.data?.results) ? res.data.results : (Array.isArray(res.data) ? res.data : []);
      setSuggestions(data.slice(0, 6));
    } catch {
      // ignore
    }
  }, []);

  // Debounce query changes
  useEffect(() => {
    const handle = setTimeout(() => loadSuggestions(query), 250);
    return () => clearTimeout(handle);
  }, [query, loadSuggestions]);
  // Mobile overlay removed; inline search only
  // When overlay opens, focus input next tick
  useEffect(() => {
    if (overlayOpen) {
      const t = setTimeout(() => {
        const el = document.getElementById('mobile-search-input');
        if (el) el.focus();
      }, 0);
      return () => clearTimeout(t);
    }
  }, [overlayOpen]);

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight(h => (h + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight(h => (h - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter') {
      if (highlight >= 0 && suggestions[highlight]) {
        const sel = suggestions[highlight];
        navigate(`/listings/${sel.id}`);
        setShowSuggest(false);
        e.preventDefault();
      }
    } else if (e.key === 'Escape') {
      setShowSuggest(false);
    }
  };

  // Remove inline panel keyboard state resets since modal handles isolation

  // Location disabled: no toggle

  // Location disabled: no clear


  // Location disabled: no label

  const selectSuggestion = (s) => {
    if (s && s.id) {
      navigate(`/listings/${s.id}`);
      setShowSuggest(false);
    }
  };

  const selectRecent = (term) => {
    setQuery('');
    navigate({ pathname: '/listings', search: `?q=${encodeURIComponent(term)}` });
    setShowSuggest(false);
  };

  const clearRecent = () => {
    localStorage.removeItem('recentSearches');
    setRecent([]);
  };

  const highlightMatch = (text) => {
    if (!query) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    const before = text.slice(0, idx);
    const match = text.slice(idx, idx + query.length);
    const after = text.slice(idx + query.length);
    return <span>{before}<mark>{match}</mark>{after}</span>;
  };

  const rootClass = variant === 'mobile' ? 'nav-search-wrapper amazon-style mobile' : 'nav-search-wrapper amazon-style';
  const isMobile = variant === 'mobile';
  return (
    <div className={rootClass}>
      <form
        ref={formRef}
  className={`nav-search-form amazon-search ${variant === 'mobile' ? 'mobile' : ''}`}
        onSubmit={(e)=>{ submit(e); setOverlayOpen(false); }}
        role="search"
        aria-label={t('searchMobileLabel')}
        onKeyDown={onKeyDown}
      >
        {/* For mobile, make input readOnly and open overlay on focus/tap */}
        <input
          id={isMobile ? 'mobile-search-trigger' : undefined}
          className="nav-search-input"
          value={query}
          readOnly={isMobile}
          onClick={isMobile ? () => setOverlayOpen(true) : undefined}
          onChange={!isMobile ? (e) => { setQuery(e.target.value); setShowSuggest(true); setHighlight(-1); } : undefined}
          onFocus={!isMobile ? () => { if (suggestions.length > 0) setShowSuggest(true); } : undefined}
          placeholder={t('searchPlaceholder')}
          aria-label={t('searchPlaceholder')}
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            className="nav-search-clear"
            aria-label={t('common:clear','Clear search')}
            onClick={() => { setQuery(''); setShowSuggest(false); setHighlight(-1); }}
          >
            <CloseIcon size={16} />
          </button>
        )}
        <button type="submit" className="nav-search-submit peach" aria-label={t('searchMobileLabel')}>
          <SearchIcon size={18} strokeWidth={1.8} />
        </button>
  {/* Suggestions list */}
    {!isMobile && showSuggest && (
          <div className="search-suggestions" role="listbox">
            {query.length >=2 && suggestions.length === 0 && (
              <div className="suggestion-empty">{t('navigation:noResults')}</div>
            )}
            {query.length < 2 && recent.length > 0 && (
              <div className="recent-block">
                <div className="recent-header">
                  <span style={{ fontSize:'var(--font-size-xs)', opacity:.75 }}>Recent</span>
                  <button type="button" className="recent-clear" onClick={clearRecent}>Clear</button>
                </div>
                {recent.map(r => (
                  <button key={r} type="button" className="suggestion-item" onClick={() => selectRecent(r)}>
                    <span className="suggestion-title">{r}</span>
                  </button>
                ))}
              </div>
            )}
            {suggestions.map((s, i) => {
              const label = s.title || s.name || `#${s.id}`;
              return (
                <button
                  key={s.id}
                  type="button"
                  role="option"
                  aria-selected={highlight === i}
                  className={`suggestion-item ${highlight === i ? 'active' : ''}`}
                  onMouseEnter={() => setHighlight(i)}
                  onClick={() => selectSuggestion(s)}
                >
                  <span className="suggestion-title">{highlightMatch(label)}</span>
                </button>
              );
            })}
          </div>
        )}
      </form>
      {/* Mobile search overlay removed */}
      {/* Location dropdown removed */}
      {/* Mobile search overlay */}
      {isMobile && overlayOpen && (
        <div className="search-overlay" role="dialog" aria-modal="true" aria-label={t('searchMobileLabel')}>
          <button type="button" className="search-close-btn" aria-label={t('common:close','Close')}
            onClick={() => { setOverlayOpen(false); setShowSuggest(false); }}>
            <CloseIcon size={18} />
          </button>
          <form onSubmit={(e)=>{ submit(e); setOverlayOpen(false); }} style={{ flex: 1 }}>
            <input
              id="mobile-search-input"
              value={query}
              onChange={(e)=>{ setQuery(e.target.value); setShowSuggest(true); setHighlight(-1); }}
              placeholder={t('searchPlaceholder')}
              aria-label={t('searchPlaceholder')}
              autoComplete="off"
            />
            <button type="submit">
              <SearchIcon size={18} strokeWidth={1.8} />
            </button>
          </form>
          {showSuggest && (
            <div className="search-suggestions" role="listbox" style={{ top: 'var(--nav-height)' }}>
              {query.length >=2 && suggestions.length === 0 && (
                <div className="suggestion-empty">{t('navigation:noResults')}</div>
              )}
              {query.length < 2 && recent.length > 0 && (
                <div className="recent-block">
                  <div className="recent-header">
                    <span style={{ fontSize:'var(--fs-xs)', opacity:.75 }}>Recent</span>
                    <button type="button" className="recent-clear" onClick={clearRecent}>Clear</button>
                  </div>
                  {recent.map(r => (
                    <button key={r} type="button" className="suggestion-item" onClick={() => selectRecent(r)}>
                      <span className="suggestion-title">{r}</span>
                    </button>
                  ))}
                </div>
              )}
              {suggestions.map((s, i) => {
                const label = s.title || s.name || `#${s.id}`;
                return (
                  <button
                    key={s.id}
                    type="button"
                    role="option"
                    aria-selected={highlight === i}
                    className={`suggestion-item ${highlight === i ? 'active' : ''}`}
                    onMouseEnter={() => setHighlight(i)}
                    onClick={() => selectSuggestion(s)}
                  >
                    <span className="suggestion-title">{highlightMatch(label)}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;