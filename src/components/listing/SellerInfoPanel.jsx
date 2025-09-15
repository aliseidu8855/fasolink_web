import React from 'react';
import { useTranslation } from 'react-i18next';

export default function SellerInfoPanel({ listing }) {
  const { t } = useTranslation(['listing']);
  if (!listing) return null;
  return (
    <section className="ld-seller" aria-labelledby="ld-seller-h">
      <h2 id="ld-seller-h" className="ld-section-h">{t('listing:sellerInfo','Seller information')}</h2>
      <div className="ld-seller-card">
        <div className="ld-seller-name">{listing.user}</div>
        {listing.seller_rating ? (
          <div className="ld-seller-rating" aria-label={t('listing:sellerRatingAria', { rating: listing.seller_rating })}>
            <span className="val">{Number(listing.seller_rating).toFixed(1)}</span>
            <span className="stars">
              {Array.from({length:5}).map((_,i)=>{
                const val = Number(listing.seller_rating);
                const full = i+1 <= Math.floor(val);
                const half = !full && (val - i) >= 0.5;
                return <span key={i} className={`star ${full?'full':half?'half':''}`}>★</span>;
              })}
            </span>
            {listing.seller_rating_count ? <span className="count">({listing.seller_rating_count})</span> : null}
          </div>
        ) : <div className="ld-seller-norating">{t('listing:noRatings','No ratings yet')}</div>}
        <div className="ld-seller-meta-row">
          <span>{t('listing:specLocation','Location')}: {listing.location}</span>
        </div>
      </div>
    </section>
  );
}
