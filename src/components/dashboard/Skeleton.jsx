import React from 'react';
import { Skeleton } from '../ui/Skeleton';
import './skeleton.css';

export const StatSkeleton = () => (
  <div className="dash-stat-card skeleton-card" aria-hidden="true">
    <Skeleton variant="text" lines={1} width="40%" />
    <Skeleton variant="rect" height={28} radius={6} />
    <Skeleton variant="rect" height={10} width="30%" radius={6} />
  </div>
);

export const ListingCardSkeleton = () => (
  <div className="listing-card listing-card-skel" aria-hidden="true">
    <Skeleton variant="rect" height={140} radius={10} />
    <div style={{ padding: '.5rem .4rem .7rem', display:'flex', flexDirection:'column', gap:'.45rem' }}>
      <Skeleton variant="text" lines={3} />
    </div>
  </div>
);

export default function DashboardSkeleton({ stats = 4, listings = 6 }) {
  return (
    <div className="dash-panel" aria-busy="true">
      <div className="dash-stats-grid">
        {Array.from({ length: stats }).map((_, i) => <StatSkeleton key={i} />)}
      </div>
      <div className="dash-listings-grid" style={{ marginTop: '1rem' }}>
        {Array.from({ length: listings }).map((_, i) => <ListingCardSkeleton key={i} />)}
      </div>
    </div>
  );
}
