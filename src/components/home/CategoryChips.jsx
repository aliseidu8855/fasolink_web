import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchCategories } from '../../services/api';
import { Skeleton } from '../ui/Skeleton';
import './CategoryChips.css';

// Mobile-first horizontal category chips for quick entry into the marketplace.
const CategoryChips = () => {
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetchCategories();
        const data = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.results) ? res.data.results : []);
        if (!cancelled) setCats(data);
      } catch {
        if (!cancelled) setCats([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  if (!loading && cats.length === 0) return null;

  return (
    <div className="cat-chips" aria-label="Categories">
      <div className="cat-chips-scroller">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="cat-chip skel" aria-hidden="true">
              <Skeleton variant="text" lines={1} />
            </div>
          ))
        ) : (
          cats.slice(0, 20).map((c) => (
            <Link
              key={c.id}
              to={`/listings?category=${encodeURIComponent(c.id)}`}
              className="cat-chip"
            >
              <span className="cat-chip-label">{c.name}</span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default CategoryChips;
