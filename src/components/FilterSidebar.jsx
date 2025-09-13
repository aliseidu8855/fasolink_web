import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchCategories } from '../services/api';
import Button from './Button';
import './FilterSidebar.css';

const FilterSidebar = ({ onFilterChange }) => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    min_price: '',
    max_price: '',
  });

  useEffect(() => {
    // Fetch categories for the dropdown
    const getCategories = async () => {
      try {
        const response = await fetchCategories();
        setCategories(response.data);
      } catch (error) {
        console.error("Failed to fetch categories for filters", error);
      }
    };
    getCategories();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilterChange(filters);
  };

  return (
    <form className="filter-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="search">Keyword</label>
        <input
          type="text"
          id="search"
          name="search"
          value={filters.search}
          onChange={handleInputChange}
          placeholder="e.g., iPhone 13"
        />
      </div>
      <div className="form-group">
        <label htmlFor="category">Category</label>
        <select
          id="category"
          name="category"
          value={filters.category}
          onChange={handleInputChange}
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>Price Range (CFA)</label>
        <div className="price-inputs">
          <input
            type="number"
            name="min_price"
            value={filters.min_price}
            onChange={handleInputChange}
            placeholder="Min"
          />
          <input
            type="number"
            name="max_price"
            value={filters.max_price}
            onChange={handleInputChange}
            placeholder="Max"
          />
        </div>
      </div>
      <Button type="submit" variant="primary">Apply Filters</Button>
    </form>
  );
};

export default FilterSidebar;