import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchCategories } from '../services/api';
import Button from './Button';
import './FilterSidebar.css';

// Extended to support negotiable, is_featured, min_rating and immediate change notifications
const FilterSidebar = ({ onFilterChange, autoApply=true }) => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    min_price: '',
    max_price: '',
    negotiable: '',
    is_featured: '',
    min_rating: ''
  });

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
    setFilters({ search:'', category:'', min_price:'', max_price:'', negotiable:'', is_featured:'', min_rating:'' });
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
        <label htmlFor="category">{t('listing:category', 'Category')}</label>
        <select
          id="category"
          name="category"
          value={filters.category}
          onChange={(e)=>update('category', e.target.value)}
        >
          <option value="">{t('listing:allCategories', 'All Categories')}</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
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
          <option value="">{t('listing:any', 'Any')}</option>
          <option value="true">{t('listing:yes', 'Yes')}</option>
          <option value="false">{t('listing:no', 'No')}</option>
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="is_featured">{t('listing:featured', 'Featured')}</label>
        <select id="is_featured" name="is_featured" value={filters.is_featured} onChange={(e)=>update('is_featured', e.target.value)}>
          <option value="">{t('listing:any', 'Any')}</option>
          <option value="true">{t('listing:yes', 'Yes')}</option>
          <option value="false">{t('listing:no', 'No')}</option>
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="min_rating">{t('listing:minRating', 'Min Rating')}</label>
        <input type="number" step="0.1" id="min_rating" name="min_rating" value={filters.min_rating} onChange={(e)=>update('min_rating', e.target.value)} />
      </div>
      {!autoApply && <Button type="submit" variant="primary">{t('listing:applyFilters', 'Apply Filters')}</Button>}
    </form>
  );
};

export default FilterSidebar;