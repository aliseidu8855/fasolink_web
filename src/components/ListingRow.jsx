import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { fetchListings } from '../services/api';
import ListingCard from './ListingCard';
import './ListingRow.css';
import { Skeleton } from './ui/Skeleton';
import { ArrowRightIcon } from './icons/Icons';

const ListingRow = ({ title, subtitle, apiParams, compact = false, browseLink, browseLabel = 'Browse categories', lazySecondHalf = false, pageSize = 12 }) => {
  const [listings, setListings] = useState([]);
  const { t } = useTranslation(['common','listing']);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [revealed, setRevealed] = useState(!lazySecondHalf); // whether to show all fetched items
  const sentinelRef = useRef(null);

  useEffect(() => {
    const getListings = async () => {
      try {
        // Fetch a larger batch so home shows more than 4 (default 12)
        const size = pageSize;
        const response = await fetchListings({ ...apiParams, page: 1, page_size: size });
        const payload = response.data;
        const data = payload.results || payload;
        setListings(data);
        // If paginated, detect more pages
        if (payload && typeof payload === 'object' && 'next' in payload) {
          setHasMore(Boolean(payload.next));
        } else {
          setHasMore(false);
        }
        setPage(1);
      } catch (err) {
        console.error(`Failed to load ${title} listings:`, err);
      } finally {
        setLoading(false);
      }
    };

    getListings();
  }, [title, apiParams, lazySecondHalf, pageSize]);

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

  const targetCount = pageSize;
  const skeletonCards = Array.from({ length: targetCount }).map((_, i) => (
    <div className="listing-card listing-card-skel" key={i} aria-hidden="true">
      <Skeleton variant="rect" height={compact ? 120 : 160} radius={8} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '.45rem' }}>
        <Skeleton variant="text" lines={3} />
      </div>
    </div>
  ));
  // If lazySecondHalf, reveal half now and the rest when sentinel intersects
  const half = Math.ceil(listings.length / 2) || 0;
  const firstSlice = lazySecondHalf && !revealed ? listings.slice(0, Math.max(half, 0)) : listings;
  const secondSlice = lazySecondHalf && !revealed ? [] : listings.slice(Math.max(half, 0));

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
  <Link to="/listings" className="view-all-link">{t('listing:viewAll', 'View All')} <span className="val-icn" aria-hidden><ArrowRightIcon size={16} /></span></Link>
      </div>
      <div className={`listing-grid${compact ? ' compact' : ''}`}>
        {loading ? skeletonCards : firstSlice.map(listing => (
          <ListingCard key={listing.id} listing={listing} compact={compact} />
        ))}
        {!loading && secondSlice.map(listing => (
          <ListingCard key={listing.id} listing={listing} compact={compact} />
        ))}
        {lazySecondHalf && !revealed && !loading && listings.length > half && (
          <div ref={sentinelRef} className="lazy-sentinel" aria-hidden="true" />
        )}
      </div>
      {!loading && hasMore && (
        <div className="lr-more-wrap">
          <button
            type="button"
            className="lr-more-btn"
            disabled={loadingMore}
            onClick={async () => {
              try {
                setLoadingMore(true);
                const nextPage = page + 1;
                const res = await fetchListings({ ...apiParams, page: nextPage, page_size: pageSize });
                const payload = res.data;
                const newItems = payload.results || payload || [];
                setListings(prev => [...prev, ...newItems]);
                if (payload && typeof payload === 'object' && 'next' in payload) {
                  setHasMore(Boolean(payload.next));
                } else {
                  setHasMore(false);
                }
                setPage(nextPage);
              } catch (e) {
                console.error('Load more failed', e);
              } finally {
                setLoadingMore(false);
              }
            }}
          >
            {loadingMore ? t('common:loading','Loading…') : t('listing:showMore','Show more')}
          </button>
        </div>
      )}
    </section>
  );
};

export default ListingRow;