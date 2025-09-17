import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchCategories } from '../../services/api';
import { useNavigate } from 'react-router-dom';

// Simple accessible dropdown skeleton for categories
const CategoryMenu = () => {
  const { t } = useTranslation(['navigation', 'categories']);
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');
  const ref = useRef(null);
  const anchorRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open || categories.length > 0 || loading) return;
    setLoading(true);
    fetchCategories()
      .then(res => setCategories(res.data))
      .catch(() => {/* swallow for now */})
      .finally(() => setLoading(false));
  }, [open, categories.length, loading]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (
        ref.current &&
        !ref.current.contains(e.target) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keyup', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keyup', onKey); };
  }, [open]);

  // Prepare translated labels and sort by listings_count desc
  const items = useMemo(() => {
    const iconToKey = {
      'cars': 'vehicles',
      'real-estate': 'property',
      'electronics': 'electronics',
      'fashion': 'fashion',
      'mobile': 'mobile',
      'home': 'home',
      'beauty': 'beauty',
      'jobs': 'jobs',
      'services': 'services',
      'sports': 'sports',
      'babies': 'babies',
      'animals': 'animals',
    };
    const mapped = categories.map(cat => {
      const key = iconToKey[(cat.icon_name || '').toLowerCase()] || null;
      const label = key ? t(`categories:${key}`) : (cat.name || '');
      const count = cat.listings_count || 0;
      return { ...cat, label, count };
    });
    const filtered = filter.trim()
      ? mapped.filter(c => c.label.toLowerCase().includes(filter.trim().toLowerCase()) || (c.name || '').toLowerCase().includes(filter.trim().toLowerCase()))
      : mapped;
    filtered.sort((a, b) => (b.count - a.count) || a.label.localeCompare(b.label));
    return filtered;
  }, [categories, t, filter]);

  // Panel positioning handled by CSS (.cat-dropdown is absolute under .cat-menu)

  return (
    <div className="cat-menu" ref={ref} style={{ position: 'relative' }}>
      <button
        className="cat-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
        ref={anchorRef}
      >
  <span>{t('categories')}</span>
  <span className={`chevron ${open ? 'rot' : ''}`} aria-hidden>▾</span>
      </button>
      {open && (
        <div className="cat-dropdown" role="menu" aria-label={t('navigation:categories','Categories')}>
          <div className="cat-more" style={{ padding: '0.25rem 0.35rem' }}>
            <input
              type="text"
              placeholder={t('navigation:search','Filter...')}
              value={filter}
              onChange={e=> setFilter(e.target.value)}
              style={{width:'100%', fontSize:12, padding:'6px 8px', border:'1px solid rgba(0,0,0,0.25)', borderRadius:6}}
              autoFocus
            />
          </div>
          {loading && <div className="cat-loading">...</div>}
          {!loading && items.length === 0 && (
            <div className="cat-empty">{t('navigation:noResults','No results')}</div>
          )}
          {!loading && items.map(cat => (
            <button
              key={cat.id}
              type="button"
              className="cat-item"
              onClick={() => { setOpen(false); navigate({ pathname: '/listings', search: `?category=${cat.id}` }); }}
              title={`${cat.label} (${cat.count} ${t('categories:ads')})`}
            >
              <span>{cat.label}</span>
              <span className="cat-count" aria-hidden="true">{cat.count.toLocaleString()}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryMenu;