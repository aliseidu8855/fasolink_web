import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { fetchListings } from '../services/api';
import ListingCard from './ListingCard';
import './ListingRow.css';

const ListingRow = ({ title, subtitle, apiParams, compact = false }) => {
  const [listings, setListings] = useState([]);
  const { t } = useTranslation(['common','listing']);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getListings = async () => {
      try {
        // Add a limit to only fetch 4 items for the homepage
  const response = await fetchListings({ ...apiParams, page_size: 4 });
        setListings(response.data.results || response.data); // Handle pagination if present
      } catch (err) {
        console.error(`Failed to load ${title} listings:`, err);
      } finally {
        setLoading(false);
      }
    };

    getListings();
  }, [title, apiParams]);

  const skeletonCards = Array.from({ length: 4 }).map((_,i)=>(
    <div className="listing-card skeleton" key={i} aria-hidden="true">
      <div className="lc-media sk-media" />
      <div className="sk-lines">
        <div className="sk-line" />
        <div className="sk-line short" />
        <div className="sk-line tiny" />
      </div>
    </div>
  ));

  return (
    <section className="listing-row-section container" aria-labelledby={`lr-${title.replace(/\s+/g,'-').toLowerCase()}`}>
      <div className="section-header">
        <div>
          <h2 id={`lr-${title.replace(/\s+/g,'-').toLowerCase()}`} className="section-title">{title}</h2>
          {subtitle && <p className="section-subtitle">{subtitle}</p>}
        </div>
        <Link to="/listings" className="view-all-link">{t('listing:viewAll', 'View All')}</Link>
      </div>
      <div className={`listing-grid${compact ? ' compact' : ''}`}>
        {loading ? skeletonCards : listings.map(listing => (
          <ListingCard key={listing.id} listing={listing} compact={compact} />
        ))}
      </div>
    </section>
  );
};

export default ListingRow;