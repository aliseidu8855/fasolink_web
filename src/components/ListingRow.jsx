import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { fetchListings } from '../services/api';
import ListingCard from './ListingCard';
import './ListingRow.css';

const ListingRow = ({ title, subtitle, apiParams, compact = false, browseLink, browseLabel = 'Browse categories', lazySecondHalf = false }) => {
  const [listings, setListings] = useState([]);
  const { t } = useTranslation(['common','listing']);
  const [loading, setLoading] = useState(true);
  const [revealed, setRevealed] = useState(!lazySecondHalf); // whether to show all fetched items
  const sentinelRef = useRef(null);

  useEffect(() => {
    const getListings = async () => {
      try {
        // Fetch up to 8 so we can lazy reveal second half if requested
        const size = lazySecondHalf ? 8 : 4;
        const response = await fetchListings({ ...apiParams, page_size: size });
        const data = response.data.results || response.data;
        setListings(data);
      } catch (err) {
        console.error(`Failed to load ${title} listings:`, err);
      } finally {
        setLoading(false);
      }
    };

    getListings();
  }, [title, apiParams, lazySecondHalf]);

  useEffect(() => {
    if (!lazySecondHalf) return; // no observer needed
    if (revealed) return; // already revealed
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setRevealed(true);
          obs.disconnect();
        }
      });
    }, { threshold: 0.25 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [lazySecondHalf, revealed]);

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

  const firstSlice = lazySecondHalf && !revealed ? listings.slice(0, 4) : listings.slice(0, 4);
  const secondSlice = lazySecondHalf && !revealed ? [] : listings.slice(4);

  return (
    <section className="listing-row-section container" aria-labelledby={`lr-${title.replace(/\s+/g,'-').toLowerCase()}`}>
      <div className="section-header">
        <div>
          <h2 id={`lr-${title.replace(/\s+/g,'-').toLowerCase()}`} className="section-title">{title}</h2>
          {subtitle && <p className="section-subtitle">{subtitle}</p>}
          {browseLink && (
            <Link to={browseLink} className="browse-inline-link">{browseLabel}</Link>
          )}
        </div>
        <Link to="/listings" className="view-all-link">{t('listing:viewAll', 'View All')}</Link>
      </div>
      <div className={`listing-grid${compact ? ' compact' : ''}`}>
        {loading ? skeletonCards : firstSlice.map(listing => (
          <ListingCard key={listing.id} listing={listing} compact={compact} />
        ))}
        {!loading && secondSlice.map(listing => (
          <ListingCard key={listing.id} listing={listing} compact={compact} />
        ))}
        {lazySecondHalf && !revealed && !loading && listings.length > 4 && (
          <div ref={sentinelRef} className="lazy-sentinel" aria-hidden="true" />
        )}
      </div>
    </section>
  );
};

export default ListingRow;