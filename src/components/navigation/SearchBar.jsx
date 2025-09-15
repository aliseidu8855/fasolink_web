import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SearchIcon } from '../icons/Icons.jsx';
import { BF_LOCATIONS } from '../../data/locations.js';
// Replaced modal with inline Amazon-style dropdown
import LocationDropdown from './LocationDropdown.jsx';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  // Location selector state (supports ?loc=regionCode or regionCode:Town%20Name)
  const [locationOpen, setLocationOpen] = useState(false); // dropdown open
  const [selectedRegion, setSelectedRegion] = useState(null); // region object
  const [selectedTown, setSelectedTown] = useState(null); // string
  const [recent, setRecent] = useState(() => {
    try {
      const raw = localStorage.getItem('recentSearches');
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });
  const abortRef = useRef(null);
  const mobileInputRef = useRef(null);
  const formRef = useRef(null);
  const locButtonRef = useRef(null);

  const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');

  // Load persisted location (if no loc in URL) once
  useEffect(() => {
    if (params.get('loc')) return; // URL overrides
    try {
      const raw = localStorage.getItem('persistLocation');
      if (raw) {
        const { regionCode, townSlug } = JSON.parse(raw);
        if (regionCode) {
          const region = BF_LOCATIONS.find(r=>r.code===regionCode);
          if (region) {
            setSelectedRegion(region);
            if (townSlug) {
              const match = region.towns.find(t=> slugify(t) === townSlug);
              if (match) setSelectedTown(match);
            }
          }
        }
      }
  } catch { /* ignore persisted load errors */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Parse loc param on mount & when URL changes
  useEffect(() => {
    const p = new URLSearchParams(location.search);
    const locVal = p.get('loc');
    if (!locVal) { setSelectedRegion(null); setSelectedTown(null); return; }
    const [rCode, rawTown] = locVal.split(':');
    const region = BF_LOCATIONS.find(r => r.code === rCode);
    if (!region) { setSelectedRegion(null); setSelectedTown(null); return; }
    if (rawTown) {
      const townSlug = decodeURIComponent(rawTown).toLowerCase();
      const matched = region.towns.find(t => slugify(t) === townSlug) || null;
      if (matched) { setSelectedRegion(region); setSelectedTown(matched); return; }
    }
    setSelectedRegion(region);
    setSelectedTown(null);
  }, [location.search]);

  const submit = (e) => {
    e?.preventDefault();
    const trimmed = query.trim();
  // Build search params including location
    const sp = new URLSearchParams();
    if (trimmed) sp.set('q', trimmed);
    if (selectedRegion) {
      const locValue = selectedTown ? `${selectedRegion.code}:${slugify(selectedTown)}` : selectedRegion.code;
      sp.set('loc', locValue);
    }
    const searchStr = sp.toString();
    navigate({ pathname: '/', search: searchStr ? `?${searchStr}` : '' });
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

  // Remove inline panel keyboard state resets since modal handles isolation

  const toggleLocation = () => {
    setLocationOpen(o => !o);
    setShowSuggest(false);
  };

  const clearLocation = (e) => {
    e?.stopPropagation();
    setSelectedRegion(null);
    setSelectedTown(null);
  };


  const regionLabel = () => {
    if (!selectedRegion) return t('allBurkina','All Burkina Faso');
    if (selectedTown) return `${selectedTown}`; // keep concise
    return selectedRegion.region;
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
    <div className="nav-search-wrapper amazon-style">
      <form
        ref={formRef}
        className="nav-search-form amazon-search"
        onSubmit={submit}
        role="search"
        aria-label={t('searchMobileLabel')}
        onKeyDown={onKeyDown}
      >
        <div
          ref={locButtonRef}
          className={`search-cat-select ${selectedRegion ? 'active' : ''}`}
          role="button"
          tabIndex={0}
          aria-haspopup="listbox"
          aria-expanded={locationOpen}
          onClick={() => toggleLocation()}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleLocation(); } else if (['ArrowDown','ArrowUp'].includes(e.key)) { e.preventDefault(); setLocationOpen(true); } }}
        >
          <span className="sc-label">{regionLabel()}</span>
          {selectedRegion && (
            <span className={`sc-applied ${selectedTown? 'town':''}`}>{selectedTown ? selectedRegion.code+':' + selectedTown.split(' ')[0] : selectedRegion.code}</span>
          )}
          {selectedRegion && <span role="button" tabIndex={-1} className="sc-clear" aria-label={t('clear','Clear')} onClick={(e) => { e.stopPropagation(); clearLocation(); }}>×</span>}
          <span className="sc-caret" aria-hidden="true">▾</span>
        </div>
        <div className="sc-divider" aria-hidden="true" />
        <input
          className="nav-search-input"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setShowSuggest(true); setHighlight(-1); }}
          onFocus={() => { if (suggestions.length > 0) setShowSuggest(true); }}
          placeholder={t('searchPlaceholder')}
          aria-label={t('searchPlaceholder')}
          autoComplete="off"
        />
        <button type="submit" className="nav-search-submit peach" aria-label={t('searchMobileLabel')}>
          <SearchIcon size={18} strokeWidth={1.8} />
        </button>
  {/* Dropdown appears anchored to region trigger */}
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
        <SearchIcon size={18} strokeWidth={1.9} />
      </button>
      {mobileOpen && (
        <div className="search-overlay" role="dialog" aria-modal="true">
          <button className="search-close-btn" aria-label="Close" onClick={() => setMobileOpen(false)}>
            {t('close','Fermer')}
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
          <button onClick={submit} className="nav-search-submit" aria-label={t('searchMobileLabel')}>
            <SearchIcon size={18} strokeWidth={1.9} />
          </button>
        </div>
      )}
      <LocationDropdown
        open={locationOpen}
        onClose={() => setLocationOpen(false)}
        anchorRef={locButtonRef}
        currentValue={{ regionCode: selectedRegion?.code || null, townSlug: selectedTown ? slugify(selectedTown) : null }}
        t={t}
        onApply={(r, town, slug) => {
          setSelectedRegion(r || null);
          setSelectedTown(town || null);
          try { if (r) localStorage.setItem('persistLocation', JSON.stringify({ regionCode: r.code, townSlug: town ? slugify(town): null })); else localStorage.removeItem('persistLocation'); } catch { /* ignore persist errors */ }
          const trimmed = query.trim();
          const sp = new URLSearchParams();
          if (trimmed) sp.set('q', trimmed);
          if (slug) sp.set('loc', slug);
          navigate({ pathname: '/', search: sp.toString() ? `?${sp.toString()}` : '' });
        }}
      />
    </div>
  );
};

export default SearchBar;