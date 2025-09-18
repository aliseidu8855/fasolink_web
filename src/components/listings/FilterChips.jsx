import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchCategories } from '../../services/api';
import { CloseIcon, ChevronDownIcon } from '../icons/Icons';
import './FilterChips.css';

// Compact, tappable chips that reflect current filters and allow quick changes/clears.
// Props:
// - filters: { category, town, min_price, max_price, negotiable }
// - ordering: string (e.g., '-created_at', 'price', '-price', '-rating')
// - onChange: (partial) => void
// - onChangeOrdering: (ordering) => void
// - onOpenSheet: () => void
export default function FilterChips({ filters = {}, ordering = '-created_at', onChange, onChangeOrdering, onOpenSheet }) {
  const { t } = useTranslation(['listing','categories']);
  const [cats, setCats] = useState([]);

  // Load categories lazily once to resolve labels for category chip
  useEffect(() => {
    let mounted = true;
    fetchCategories().then(res => {
      if (!mounted) return;
      const list = res.data || [];
      setCats(Array.isArray(list) ? list : []);
    }).catch(() => {});
    return () => { mounted = false; };
  }, []);

  const catLabel = useMemo(() => {
    if (!filters.category) return null;
    const found = cats.find(c => String(c.id) === String(filters.category));
    return found ? (found.name || `#${filters.category}`) : `#${filters.category}`;
  }, [cats, filters.category]);

  const priceLabel = useMemo(() => {
    const min = filters.min_price; const max = filters.max_price;
    if (!min && !max) return null;
    if (min && max) return `${t('listing:price','Price')}: ${min}–${max}`;
    if (min) return `${t('listing:min','Min')} ${min}`;
    if (max) return `${t('listing:max','Max')} ${max}`;
    return null;
  }, [filters.min_price, filters.max_price, t]);

  const negotiableLabel = useMemo(() => {
    if (String(filters.negotiable) === 'true') return t('listing:negotiable','Negotiable');
    if (String(filters.negotiable) === 'false') return t('listing:fixed','Fixed price');
    return null;
  }, [filters.negotiable, t]);

  const sortLabel = useMemo(() => {
    switch (ordering) {
      case 'price': return t('listing:sortPriceAsc','Price ↑');
      case '-price': return t('listing:sortPriceDesc','Price ↓');
      case '-rating': return t('listing:sortRating','Top rated');
      default: return t('listing:sortNewest','Newest');
    }
  }, [ordering, t]);

  const cycleSort = () => {
    const seq = ['-created_at', 'price', '-price', '-rating'];
    const idx = seq.indexOf(ordering);
    const next = seq[(idx + 1) % seq.length];
    onChangeOrdering?.(next);
  };

  return (
    <div className="filter-chips-row" role="toolbar" aria-label={t('listing:filtersTitle','Filters')}>
      {/* Category chip */}
      <button type="button" className={`chip ${filters.category ? 'active' : ''}`} onClick={() => onOpenSheet?.()} aria-label={t('listing:category','Category')}>
        <span className="chip-label">{filters.category ? (catLabel || t('categories','Category')) : t('categories','Category')}</span>
        {filters.category ? (
          <span className="chip-clear" onClick={(e)=>{ e.stopPropagation(); onChange?.({ category: '' }); }} aria-hidden>
            <CloseIcon size={14} />
          </span>
        ) : (
          <span className="chip-caret" aria-hidden><ChevronDownIcon size={12} /></span>
        )}
      </button>

      {/* Location chip */}
      <button type="button" className={`chip ${filters.town ? 'active' : ''}`} onClick={() => onOpenSheet?.()}>
        <span className="chip-label">{filters.town ? String(filters.town) : t('listing:location','Location')}</span>
        {filters.town ? (
          <span className="chip-clear" onClick={(e)=>{ e.stopPropagation(); onChange?.({ town: '' }); }} aria-hidden>
            <CloseIcon size={14} />
          </span>
        ) : (
          <span className="chip-caret" aria-hidden><ChevronDownIcon size={12} /></span>
        )}
      </button>

      {/* Price chip */}
      <button type="button" className={`chip ${priceLabel ? 'active' : ''}`} onClick={() => onOpenSheet?.()}>
        <span className="chip-label">{priceLabel || t('listing:price','Price')}</span>
        {priceLabel ? (
          <span className="chip-clear" onClick={(e)=>{ e.stopPropagation(); onChange?.({ min_price: '', max_price: '' }); }} aria-hidden>
            <CloseIcon size={14} />
          </span>
        ) : (
          <span className="chip-caret" aria-hidden><ChevronDownIcon size={12} /></span>
        )}
      </button>

      {/* Negotiable chip cycles */}
      <button
        type="button"
        className={`chip ${negotiableLabel ? 'active' : ''}`}
        onClick={() => {
          const cur = String(filters.negotiable || '');
          const next = cur === '' ? 'true' : (cur === 'true' ? 'false' : '');
          onChange?.({ negotiable: next });
        }}
        aria-pressed={!!negotiableLabel}
      >
        <span className="chip-label">{negotiableLabel || t('listing:negotiable','Negotiable')}</span>
        {negotiableLabel ? (
          <span className="chip-clear" onClick={(e)=>{ e.stopPropagation(); onChange?.({ negotiable: '' }); }} aria-hidden>
            <CloseIcon size={14} />
          </span>
        ) : (
          <span className="chip-caret" aria-hidden><ChevronDownIcon size={12} /></span>
        )}
      </button>

      {/* Sort chip cycles */}
      <button type="button" className="chip sort" onClick={cycleSort} aria-label={t('listing:sort','Sort')}>
        <span className="chip-label">{sortLabel}</span>
      </button>

      {/* Filters button opens sheet */}
      <button type="button" className="chip filters-btn" onClick={() => onOpenSheet?.()}>
        {t('listing:filtersTitle','Filters')}
      </button>
    </div>
  );
}
