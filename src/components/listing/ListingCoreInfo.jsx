import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

function extractBullets(description, max = 5) {
  if (!description) return [];
  // Split by newline or period, filter short fragments
  const parts = description.split(/\n+|\.\s+/).map(p=>p.trim()).filter(p=>p.length > 6);
  return parts.slice(0, max);
}

export default function ListingCoreInfo({ listing }) {
  const { t } = useTranslation(['listing']);
  const bullets = useMemo(()=> extractBullets(listing?.description), [listing]);
  if (!listing) return null;
  const sellerRating = listing.seller_rating;
  return (
    <div className="ld-core" aria-labelledby="ld-title">
      <h1 id="ld-title" className="ld-title">{listing.title}</h1>
      <div className="ld-badges">
        {listing.is_featured && <span className="ld-badge featured">{t('listing:badgeFeatured','Featured')}</span>}
        {listing.negotiable && <span className="ld-badge negotiable">{t('listing:badgeNegotiable','Negotiable')}</span>}
        {listing.created_at && (Date.now() - new Date(listing.created_at).getTime()) < 48*3600*1000 && (
          <span className="ld-badge new">{t('listing:badgeNew','New')}</span>
        )}
      </div>
      <div className="ld-rating-row">
        {sellerRating ? (
          <div className="ld-rating" aria-label={t('listing:sellerRatingAria', { rating: sellerRating })}>
            <span className="ld-rating-val">{Number(sellerRating).toFixed(1)}</span>
            <span className="ld-rating-stars">
              {Array.from({length:5}).map((_,i)=>{
                const val = Number(sellerRating);
                const full = i+1 <= Math.floor(val);
                const half = !full && (val - i) >= 0.5;
                return <span key={i} className={`star ${full?'full':half?'half':''}`}>★</span>;
              })}
            </span>
            {typeof listing.seller_rating_count === 'number' && listing.seller_rating_count > 0 && (
              <span className="ld-rating-count">({listing.seller_rating_count})</span>
            )}
          </div>
        ) : <span className="ld-rating-placeholder">{t('listing:noRatings','No ratings yet')}</span>}
      </div>
      {bullets.length > 0 && (
        <ul className="ld-bullets" aria-label={t('listing:bulletFeatures','Key features')}>
          {bullets.map((b,i)=>(<li key={i}>{b}</li>))}
        </ul>
      )}
      <section className="ld-description" aria-labelledby="ld-desc-h">
        <h2 id="ld-desc-h" className="ld-section-h">{t('listing:description','Description')}</h2>
        <p className="ld-desc-text">{listing.description}</p>
      </section>
    </div>
  );
}
