import { useState, useEffect } from 'react';
import { buildOrdering } from '../services/api';
import './SortBar.css';

export default function SortBar({ onChange, initialOrdering='-created_at' }) {
  const [ordering, setOrdering] = useState(initialOrdering);

  useEffect(() => {
    onChange(ordering);
  }, [ordering, onChange]);

  return (
    <div className="sort-bar">
      <label>Sort:</label>
      <select value={ordering} onChange={e => setOrdering(e.target.value)}>
        <option value="-created_at">Newest</option>
        <option value="created_at">Oldest</option>
        <option value="price">Price: Low to High</option>
        <option value="-price">Price: High to Low</option>
        <option value="-rating">Rating: High to Low</option>
      </select>
    </div>
  );
}
