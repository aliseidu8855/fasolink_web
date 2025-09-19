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

// Small star rating visual (0-5)
const Stars = ({ value = 0 }) => {
  const full = Math.floor(Number(value) || 0);
  const half = (Number(value) - full) >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  const Item = ({ type, idx }) => (
    <svg key={type + idx} width={12} height={12} viewBox="0 0 24 24" fill={type==='empty'?'none':'currentColor'} stroke="currentColor" strokeWidth={type==='half'?1.5:0} aria-hidden>
      <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.402 8.168L12 18.896l-7.336 3.869 1.402-8.168L.132 9.21l8.2-1.192z" />
    </svg>
  );
  return (
    <span className="lc-stars" aria-hidden>
      {Array.from({length: full}).map((_,i)=> <Item type="full" idx={i} />)}
      {Array.from({length: half}).map((_,i)=> <Item type="half" idx={i} />)}
      {Array.from({length: empty}).map((_,i)=> <Item type="empty" idx={i} />)}
    </span>
  );
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
  // Derive 1-2 quick spec chips to make cards more descriptive
  const specChips = [];
  const attrs = Array.isArray(listing.attributes_out) ? listing.attributes_out : [];
  const candidates = ['brand','model','condition','color','property_type','internal_storage','ram','size_sqm','device_type','type'];
  // Include brand + one more meaningful attribute when available
  const map = {};
  attrs.forEach(a => { if (a && a.name && a.value && !map[a.name]) map[a.name] = a.value; });
  if (listing.brand) map['brand'] = listing.brand;
  for (const key of candidates) {
    if (map[key] && !specChips.find(c=>c.key===key)) {
      specChips.push({ key, label: String(map[key]).slice(0,20) });
    }
    if (specChips.length >= 2) break;
  }

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
        {!minimal && specChips.length > 0 && (
          <div className="lc-specs">
            {specChips.map(c => (
              <span key={c.key} className="lc-spec-pill">{c.label}</span>
            ))}
          </div>
        )}
        {!minimal && listing.location && <div className="lc-location" title={listing.location}>{listing.location}</div>}
        {!minimal && (
          <div className="lc-meta">
            {relative && <span className="lc-time" aria-label="time">{relative}</span>}
            {relative && sellerRating && <span className="lc-dot" />}
            {sellerRating && (
              <span className="lc-rating" aria-label={t('listing:sellerRating','Seller rating')}>
                <Stars value={Number(sellerRating)} />
                <span className="lc-rating-num">{Number(sellerRating).toFixed(1)}</span>
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
};

export default ListingCard;