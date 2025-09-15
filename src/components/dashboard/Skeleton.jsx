import React from 'react';
import './skeleton.css';

export const SkeletonBlock = ({ height = 16, width = '100%', radius = 6, style }) => {
  return <span className="skeleton-block" style={{ '--s-h': height + 'px', '--s-w': width, '--s-r': radius + 'px', ...style }} />;
};

export const StatSkeleton = () => (
  <div className="dash-stat-card skeleton-card">
    <SkeletonBlock width="40%" height={10} />
    <SkeletonBlock width="60%" height={28} />
    <SkeletonBlock width="30%" height={10} />
  </div>
);

export const ListingCardSkeleton = () => (
  <div className="listing-card skeleton">
    <SkeletonBlock height={140} radius={10} />
    <div style={{ padding: '.5rem .4rem .7rem', display:'flex', flexDirection:'column', gap:'.45rem' }}>
      <SkeletonBlock width="80%" height={16} />
      <SkeletonBlock width="50%" height={14} />
      <SkeletonBlock width="30%" height={12} />
    </div>
  </div>
);

export default function DashboardSkeleton({ stats = 4, listings = 6 }) {
  return (
    <div className="dash-panel">
      <div className="dash-stats-grid">
        {Array.from({ length: stats }).map((_, i) => <StatSkeleton key={i} />)}
      </div>
      <div className="dash-listings-grid" style={{ marginTop: '1rem' }}>
        {Array.from({ length: listings }).map((_, i) => <ListingCardSkeleton key={i} />)}
      </div>
    </div>
  );
}
