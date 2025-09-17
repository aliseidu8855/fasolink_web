import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchCategories } from '../../services/api';
import { useNavigate } from 'react-router-dom';

// Simple accessible dropdown skeleton for categories
const CategoryMenu = () => {
  const { t } = useTranslation('navigation');
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);
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
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keyup', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keyup', onKey); };
  }, [open]);

  return (
    <div className="cat-menu" ref={ref}>
      <button
        className="cat-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
      >
  <span>{t('categories')}</span>
  <span className={`chevron ${open ? 'rot' : ''}`} aria-hidden>▾</span>
      </button>
      {open && (
        <div className="cat-dropdown" role="menu">
          {loading && <div className="cat-loading">...</div>}
          {!loading && categories.length === 0 && (
            <div className="cat-empty">(none)</div>
          )}
          {!loading && categories.slice(0, 12).map(cat => (
            <button
              key={cat.id}
              className="cat-item"
              role="menuitem"
              onClick={() => { setOpen(false); navigate({ pathname: '/listings', search: `?category=${cat.id}` }); }}
              title={`${cat.name} (${cat.listings_count || 0})`}
            >
              <span className="cat-name">{cat.name}</span>
              <span className="cat-count">{(cat.listings_count || 0).toLocaleString()}</span>
            </button>
          ))}
          {categories.length > 12 && <div className="cat-more">+ {categories.length - 12} more</div>}
        </div>
      )}
    </div>
  );
};

export default CategoryMenu;