import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchCategories } from '../../services/api';
import { Link } from 'react-router-dom';
import './CategoryStrip.css';

const CategoryStrip = () => {
  const { t } = useTranslation(['home','categories']);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const normalize = useMemo(() => (name) => (name || '').toLowerCase().replace(/[^a-z0-9]+/g,'-'), []);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchCategories();
        const data = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.results) ? res.data.results : []);
        setCategories(data.slice(0, 10));
      } catch { /* ignore */ }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const skeletonCount = 8;
  if (!loading && !categories.length) return null;

  return (
    <section className="cat-strip" aria-label={t('home:categoryStrip.title')}>
      <div className="container cat-strip-inner">
        <h2 className="cat-strip-title">{t('home:categoryStrip.title')}</h2>
        <div className="cat-pill-row">
          {loading && Array.from({ length: skeletonCount }).map((_,i)=>(
            <span className="cat-pill skeleton" key={i} aria-hidden="true" />
          ))}
          {!loading && categories.map(c => (
            <Link key={c.id} to={`/listings?category=${c.id}`} className="cat-pill">{t(`categories:${c.icon_name || normalize(c.name)}`, { defaultValue: c.name })}</Link>
          ))}
          {!loading && (
            <Link to="/categories" className="cat-pill cat-more" aria-label={t('home:categoryStrip.viewAll','View all categories')}>
              {t('home:categoryStrip.viewAll','View All')}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
};

export default CategoryStrip;
