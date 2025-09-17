import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import './ListingCard.css';

// Helper to format the CFA currency
const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-FR').format(price);
};

// Relative time helper (client-side approximation)
const timeAgo = (isoString) => {
  if (!isoString) return '';
  const then = new Date(isoString).getTime();
  const now = Date.now();
  const diffSec = Math.floor((now - then)/1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec/60);
  if (diffMin < 60) return diffMin + 'm';
  const diffHr = Math.floor(diffMin/60);
  if (diffHr < 24) return diffHr + 'h';
  const diffDay = Math.floor(diffHr/24);
  if (diffDay < 7) return diffDay + 'd';
  const diffW = Math.floor(diffDay/7);
  return diffW + 'w';
};

// Accept optional compact flag and minimal flag to reduce details in dense grids
const ListingCard = ({ listing, compact = false, minimal = false }) => {
  const { t } = useTranslation(['listing','common']);
  const imageUrl = (listing.images && listing.images.length > 0)
    ? listing.images[0].image
    : 'https://via.placeholder.com/400x400.png?text=' + encodeURIComponent(t('listing:noImages'));

  const badges = [];
  if (listing.is_featured) badges.push({ key:'featured', label: t('listing:badgeFeatured','Featured'), type:'featured' });
  // NEW badge: only if created < 10 hours ago
  if (listing.created_at) {
    const created = new Date(listing.created_at).getTime();
    const TEN_HOURS_MS = 10 * 60 * 60 * 1000;
    if (Date.now() - created < TEN_HOURS_MS) {
      badges.push({ key:'new', label: t('listing:badgeNew','New'), type:'new' });
    }
  }
  if (listing.negotiable) badges.push({ key:'negotiable', label: t('listing:badgeNegotiable','Negotiable'), type:'negotiable' });

  const relative = listing.created_at ? timeAgo(listing.created_at) : '';
  const sellerRating = listing.seller_rating;

  const cardClass = `listing-card${compact ? ' compact' : ''}${minimal ? ' minimal' : ''}`;
  return (
    <Link to={`/listings/${listing.id}`} className={cardClass} aria-label={listing.title}>
      {badges.length > 0 && (
        <div className="lc-badges" aria-label="badges">
          {badges.map(b => (
            <span key={b.key} className={`lc-badge badge-${b.type}`}>{b.label}</span>
          ))}
        </div>
      )}
      <div className="lc-media">
        <img loading="lazy" src={imageUrl} alt={listing.title} />
      </div>
      <div className="lc-body">
        <h3 className="lc-title" title={listing.title}>{listing.title}</h3>
        <div className="lc-price-row">
          <span className="lc-price">{formatPrice(listing.price)}</span>
          <span className="lc-currency">{t('listing:priceCurrency')}</span>
        </div>
        {!minimal && listing.location && <div className="lc-location" title={listing.location}>{listing.location}</div>}
        {!minimal && (
          <div className="lc-meta">
            {relative && <span className="lc-time" aria-label="time">{relative}</span>}
            {relative && sellerRating && <span className="lc-dot" />}
            {sellerRating && <span className="lc-rating" aria-label={t('listing:sellerRating','Seller rating')}>{Number(sellerRating).toFixed(1)}</span>}
          </div>
        )}
      </div>
    </Link>
  );
};

export default ListingCard;