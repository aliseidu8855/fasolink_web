import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { IoSearchOutline, IoCloseOutline } from 'react-icons/io5';
import { fetchListings } from '../../services/api';

// Clean, debounced search with suggestions + mobile overlay.
const SearchBar = () => {
  const { t } = useTranslation('navigation');
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const initialQ = params.get('q') || '';
  const [query, setQuery] = useState(initialQ);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggest, setShowSuggest] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const [recent, setRecent] = useState(() => {
    try {
      const raw = localStorage.getItem('recentSearches');
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });
  const abortRef = useRef(null);
  const mobileInputRef = useRef(null);
  const formRef = useRef(null);

  const submit = (e) => {
    e?.preventDefault();
    const trimmed = query.trim();
    navigate({ pathname: '/', search: trimmed ? `?q=${encodeURIComponent(trimmed)}` : '' });
    if (trimmed) {
      setRecent(prev => {
        const next = [trimmed, ...prev.filter(p => p !== trimmed)].slice(0,6);
        localStorage.setItem('recentSearches', JSON.stringify(next));
        return next;
      });
    }
    setShowSuggest(false);
    setMobileOpen(false);
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

  // Mobile overlay focus & scroll lock
  useEffect(() => {
    if (mobileOpen) {
      setTimeout(() => mobileInputRef.current?.focus(), 30);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [mobileOpen]);

  // Global Escape when overlay open
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') setMobileOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [mobileOpen]);

  const onKeyDown = (e) => {
    if (!showSuggest || suggestions.length === 0) return;
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

  const selectSuggestion = (s) => {
    if (s && s.id) {
      navigate(`/listings/${s.id}`);
      setShowSuggest(false);
    }
  };

  const selectRecent = (term) => {
    setQuery(term);
    navigate({ pathname: '/', search: `?q=${encodeURIComponent(term)}` });
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

  return (
    <div className="nav-search-wrapper">
      <form
        ref={formRef}
        className="nav-search-form"
        onSubmit={submit}
        role="search"
        aria-label={t('searchMobileLabel')}
        onKeyDown={onKeyDown}
      >
        <IoSearchOutline size={18} aria-hidden />
        <input
          className="nav-search-input"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setShowSuggest(true); setHighlight(-1); }}
          onFocus={() => { if (suggestions.length > 0) setShowSuggest(true); }}
          placeholder={t('searchPlaceholder')}
          aria-label={t('searchPlaceholder')}
          autoComplete="off"
        />
        <button type="submit" className="nav-search-submit">{t('searchMobileLabel')}</button>
        {showSuggest && (
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
      <button className="nav-search-icon-btn" aria-label={t('searchMobileLabel')} onClick={() => setMobileOpen(true)}>
        <IoSearchOutline size={22} />
      </button>
      {mobileOpen && (
        <div className="search-overlay" role="dialog" aria-modal="true">
          <button className="search-close-btn" aria-label="Close" onClick={() => setMobileOpen(false)}>
            <IoCloseOutline size={26} />
          </button>
          <form onSubmit={submit} role="search" aria-label={t('searchMobileLabel')} style={{ flex: 1 }}>
            <input
              ref={mobileInputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              aria-label={t('searchPlaceholder')}
              autoComplete="off"
            />
          </form>
          <button onClick={submit} className="nav-search-submit">{t('searchMobileLabel')}</button>
        </div>
      )}
    </div>
  );
};

export default SearchBar;