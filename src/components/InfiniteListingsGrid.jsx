import { useEffect, useRef } from 'react';
import ListingCard from './ListingCard';
import '../components/ListingsGrid.css';
import './ListingCard.css';

const SkeletonCard = ({ compact }) => (
  <div className={`listing-card skeleton${compact ? ' compact' : ''}`} aria-hidden="true">
    <div className="lc-media shimmer" />
    <div className="lc-body">
      <div className="sk-line sk-title shimmer" />
      <div className="sk-line sk-price shimmer" />
      <div className="sk-line sk-loc shimmer" />
    </div>
  </div>
);

// Renders a responsive grid with infinite scroll sentinel
export default function InfiniteListingsGrid({ listings, loading, hasMore, onLoadMore, compact=false }) {
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (!hasMore || !sentinelRef.current) return;
    const el = sentinelRef.current;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        onLoadMore();
      }
    }, { rootMargin: '400px 0px' });
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, onLoadMore]);

  const skeletonCount = listings.length === 0 ? (compact ? 8 : 6) : (loading ? (compact ? 4 : 3) : 0);

  return (
    <div className={`listings-grid ${compact ? 'listings-grid-compact' : ''}`} role="list" aria-busy={loading}>
      {listings.map(listing => (
        <ListingCard key={listing.id} listing={listing} compact={compact} role="listitem" />
      ))}
      {skeletonCount > 0 && Array.from({ length: skeletonCount }).map((_,i)=>(
        <SkeletonCard key={`sk-${i}`} compact={compact} />
      ))}
      {hasMore && (
        <div ref={sentinelRef} className="infinite-sentinel" aria-hidden="true" />
      )}
    </div>
  );
}
