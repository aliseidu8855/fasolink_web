import React, { useState, useEffect } from 'react';
import { fetchCategories } from '../services/api';
import CategoryCard from './CategoryCard';
import './CategoryList.css';

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getCategories = async () => {
      try {
        const response = await fetchCategories();
        setCategories(response.data);
      } catch (err) {
        setError('Failed to load categories.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    getCategories();
  }, []);

  if (loading) return <p>Loading categories...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <section className="category-section container">
      <h2 className="section-title">Browse Categories</h2>
      <div className="category-grid">
        {categories.map(category => (
          <CategoryCard 
            key={category.id} 
            name={category.name} 
            // The adCount is hardcoded for now as the API doesn't provide it yet
            adCount={Math.floor(Math.random() * 1000) + 100} 
          />
        ))}
      </div>
    </section>
  );
};

export default CategoryList;