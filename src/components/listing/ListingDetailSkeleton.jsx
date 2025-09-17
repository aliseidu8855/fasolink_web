import React from 'react';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '../ui/Skeleton';

// Skeleton layout matching ListingDetailPage structure
export default function ListingDetailSkeleton(){
  const { t } = useTranslation(['listing','common']);
  return (
    <div className="container listing-detail-page" role="status" aria-live="polite" aria-label={t('listing:loading','Loading…')}>
      <div className="detail-grid" aria-busy="true">
        {/* Gallery skeleton */}
        <div className="detail-gallery">
          <Skeleton variant="rect" height={300} radius={12} />
          <div style={{ display:'flex', gap:8, marginTop:8 }}>
            {Array.from({ length: 5 }).map((_,i)=> (
              <Skeleton key={i} variant="rect" height={64} style={{ flex:'1 1 0%' }} radius={8} />
            ))}
          </div>
        </div>

        {/* Main content skeleton */}
        <div className="detail-main">
          <Skeleton variant="text" lines={1} width="70%" />
          <Skeleton variant="text" lines={1} width="45%" style={{ marginTop:8 }} />
          <div style={{ display:'flex', gap:8, marginTop:12 }}>
            {Array.from({ length: 3 }).map((_,i)=> (
              <Skeleton key={i} variant="rect" height={20} style={{ width:90 }} radius={12} />
            ))}
          </div>
          <Skeleton variant="rect" height={12} width="140" style={{ marginTop:12 }} radius={6} />
          <div style={{ marginTop:16, display:'grid', gap:10 }}>
            <Skeleton variant="text" lines={3} />
          </div>
          {/* Specs grid preview */}
          <div className="ld-specs" style={{ marginTop:12 }}>
            <div className="ld-specs-grid">
              {Array.from({ length: 6 }).map((_,i)=> (
                <div className="ld-spec-row" key={i}>
                  <Skeleton variant="rect" height={10} width="60%" style={{ marginBottom:8 }} />
                  <Skeleton variant="rect" height={14} width="85%" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions (buy box) skeleton */}
        <div className="detail-actions">
          <div className="ld-buybox-card">
            <Skeleton variant="rect" height={28} width="60%" />
            <div className="ld-action-row">
              <Skeleton variant="rect" height={40} width="100%" radius={6} />
              <div style={{ display:'flex', gap:8, width:'100%' }}>
                <Skeleton variant="rect" height={32} style={{ flex:1 }} radius={6} />
                <Skeleton variant="rect" height={32} style={{ flex:1 }} radius={6} />
              </div>
            </div>
            <div className="ld-buybox-meta">
              <Skeleton variant="rect" height={10} width="70%" />
              <Skeleton variant="rect" height={10} width="50%" />
            </div>
          </div>
          <div className="ld-presets" style={{ marginTop:12 }}>
            <Skeleton variant="rect" height={28} width={140} radius={20} />
            <div className="ld-presets-chips">
              {Array.from({ length: 4 }).map((_,i)=> (
                <Skeleton key={i} variant="rect" height={28} style={{ width:110 }} radius={18} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Lower area placeholder */}
      <div className="detail-lower" style={{ marginTop:20 }}>
        <Skeleton variant="rect" height={18} width="25%" style={{ marginBottom:12 }} />
        <div style={{ display:'flex', gap:12, overflow:'hidden' }}>
          {Array.from({ length: 4 }).map((_,i)=> (
            <div key={i} style={{ flex:'0 0 220px' }}>
              <Skeleton variant="rect" height={140} radius={10} />
              <div style={{ marginTop:8 }}>
                <Skeleton variant="text" lines={2} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile sticky CTA space reservation */}
      <div className="mobile-sticky-cta" aria-hidden="true" />
    </div>
  );
}
