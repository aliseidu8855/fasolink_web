import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchCategories, fetchListingsFacets } from '../services/api';
import Button from './Button';
import './FilterSidebar.css';

// Extended to support negotiable, is_featured, min_rating and immediate change notifications
const FilterSidebar = ({ onFilterChange, autoApply=true, initialFilters }) => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    min_price: '',
    max_price: '',
    negotiable: '',
    is_featured: '',
    min_rating: '',
    town: ''
  });
  const [facets, setFacets] = useState({ total: null, categories: [], negotiable: null, featured: null, price_ranges: [] });
  const [loadingFacets, setLoadingFacets] = useState(false);

  useEffect(() => {
    const getCategories = async () => {
      try {
        const response = await fetchCategories();
        setCategories(response.data);
      } catch (error) {
        console.error('Failed to fetch categories for filters', error);
      }
    };
    getCategories();
  }, []);

  // Prime from initialFilters
  useEffect(() => {
    if (!initialFilters) return;
    setFilters(prev => ({ ...prev, ...initialFilters }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(initialFilters)]);

  // Fetch facets when filters change; lightweight debounce via timeout
  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(async () => {
      setLoadingFacets(true);
      try {
        // Send current filters as params; backend will ignore specific facet's param when building that facet
        const res = await fetchListingsFacets(filters);
        if (cancelled) return;
        setFacets(res.data);
      } catch {
        if (!cancelled) {
          // Non-fatal; keep previous facets
        }
      } finally {
        if (!cancelled) setLoadingFacets(false);
      }
    }, 300);
    return () => { cancelled = true; clearTimeout(t); };
  }, [filters]);

  const update = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (autoApply) onFilterChange(filters);
  }, [filters, autoApply, onFilterChange]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!autoApply) onFilterChange(filters);
  };

  const reset = () => {
    setFilters({ search:'', category:'', min_price:'', max_price:'', negotiable:'', is_featured:'', min_rating:'', town:'' });
  };

  return (
    <form className="filter-form" onSubmit={handleSubmit}>
      <div className="filter-form-header">
        <h4>{t('listing:filtersTitle', 'Filters')}</h4>
        <button type="button" onClick={reset} className="link-btn">{t('listing:reset', 'Reset')}</button>
      </div>
      <div className="form-group">
        <label htmlFor="search">{t('listing:keyword', 'Keyword')}</label>
        <input
          type="text"
          id="search"
          name="search"
          value={filters.search}
          onChange={(e)=>update('search', e.target.value)}
          placeholder={t('listing:keywordPlaceholder', 'e.g., iPhone 13')}
        />
      </div>
      <div className="form-group">
        <label htmlFor="town">{t('listing:location', 'Location')}</label>
        <input
          type="text"
          id="town"
          name="town"
          value={filters.town}
          onChange={(e)=>update('town', e.target.value)}
          placeholder={t('listing:locationPlaceholder', 'e.g., Dakar, Pikine')}
        />
      </div>
      <div className="form-group">
        <label htmlFor="category">{t('listing:category', 'Category')}</label>
        {loadingFacets && <span className="facets-loading" aria-live="polite">{t('common:loading','Loading…')}</span>}
        <select
          id="category"
          name="category"
          value={filters.category}
          onChange={(e)=>update('category', e.target.value)}
        >
          <option value="">{t('listing:allCategories', 'All Categories')}</option>
          {categories.map(cat => {
            const f = facets.categories?.find(c => String(c.id) === String(cat.id));
            const label = f ? `${cat.name} (${f.count})` : cat.name;
            return <option key={cat.id} value={cat.id}>{label}</option>;
          })}
        </select>
      </div>
      <div className="form-group">
        <label>{t('listing:priceRange', 'Price Range (CFA)')}</label>
        <div className="price-inputs">
          <input
            type="number"
            name="min_price"
            value={filters.min_price}
            onChange={(e)=>update('min_price', e.target.value)}
            placeholder={t('listing:min', 'Min')}
          />
          <input
            type="number"
            name="max_price"
            value={filters.max_price}
            onChange={(e)=>update('max_price', e.target.value)}
            placeholder={t('listing:max', 'Max')}
          />
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="negotiable">{t('listing:negotiable', 'Negotiable')}</label>
        <select id="negotiable" name="negotiable" value={filters.negotiable} onChange={(e)=>update('negotiable', e.target.value)}>
          <option value="">{t('listing:any', 'Any')}{facets.total != null ? ` (${facets.total})` : ''}</option>
          <option value="true">{t('listing:yes', 'Yes')}{facets.negotiable ? ` (${facets.negotiable.true||0})` : ''}</option>
          <option value="false">{t('listing:no', 'No')}{facets.negotiable ? ` (${facets.negotiable.false||0})` : ''}</option>
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="is_featured">{t('listing:featured', 'Featured')}</label>
        <select id="is_featured" name="is_featured" value={filters.is_featured} onChange={(e)=>update('is_featured', e.target.value)}>
          <option value="">{t('listing:any', 'Any')}{facets.total != null ? ` (${facets.total})` : ''}</option>
          <option value="true">{t('listing:yes', 'Yes')}{facets.featured ? ` (${facets.featured.true||0})` : ''}</option>
          <option value="false">{t('listing:no', 'No')}{facets.featured ? ` (${facets.featured.false||0})` : ''}</option>
        </select>
      </div>
      {facets.price_ranges && facets.price_ranges.length > 0 && (
        <div className="form-group">
          <label>{t('listing:priceDistribution','Price distribution')}</label>
          <div className="price-facets" aria-live="polite">
            {facets.price_ranges.map((b, idx) => (
              <div key={idx} className="price-facet-row">
                <span className="price-facet-label">{b.label}</span>
                <span className="price-facet-count">{b.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="form-group">
        <label htmlFor="min_rating">{t('listing:minRating', 'Min Rating')}</label>
        <input type="number" step="0.1" id="min_rating" name="min_rating" value={filters.min_rating} onChange={(e)=>update('min_rating', e.target.value)} />
      </div>
      {!autoApply && <Button type="submit" variant="primary">{t('listing:applyFilters', 'Apply Filters')}</Button>}
    </form>
  );
};

export default FilterSidebar;