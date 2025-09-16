import React, { useState, useEffect } from 'react';
import Button from '../Button';
import { useTranslation } from 'react-i18next';

export default function ListingBuyBox({ listing, onMessageSeller, isOwn, formatPrice }) {
  const { t } = useTranslation(['listing']);
  const [copied, setCopied] = useState(false);
  const [fav, setFav] = useState(false);

  // Initialize favorite state from localStorage
  useEffect(()=>{
    try {
      const raw = localStorage.getItem('faso:favorites');
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr) && arr.includes(listing.id)) setFav(true);
      }
    } catch { /* ignore */ }
  }, [listing.id]);

  const persistFav = (next) => {
    try {
      const raw = localStorage.getItem('faso:favorites');
      let arr = [];
      if (raw) { const parsed = JSON.parse(raw); if (Array.isArray(parsed)) arr = parsed; }
      if (next) {
        if (!arr.includes(listing.id)) arr.push(listing.id);
      } else {
        arr = arr.filter(id => id !== listing.id);
      }
      localStorage.setItem('faso:favorites', JSON.stringify(arr));
    } catch { /* ignore */ }
  };

  const toggleFavorite = () => {
    setFav(prev => {
      const next = !prev;
      persistFav(next);
      return next;
    });
  };
  if (!listing) return null;

  const handleShare = async () => {
    try {
      const url = window.location.href;
      if (navigator.share) {
        try {
          await navigator.share({ title: listing.title, url });
          return; // native share success
  } catch { /* fallback to copy */ }
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(()=>setCopied(false), 2500);
    } catch (e) {
      console.warn('Share failed', e);
    }
  };
  return (
    <aside className="ld-buybox" aria-label={t('listing:buyBoxAria','Listing actions')}>
      <div className="ld-buybox-card">
        <div className="ld-price-row">
          <span
            className="ld-price-main"
            id="ld-price-main"
            aria-describedby={listing.negotiable ? 'ld-price-neg' : undefined}
          >
            {formatPrice(listing.price)} CFA
          </span>
          {listing.negotiable && (
            <span className="ld-price-neg" id="ld-price-neg">
              {t('listing:priceNegotiable','Negotiable')}
            </span>
          )}
        </div>
        <div className="ld-action-row">
          {!isOwn && (
            <Button variant="primary" onClick={onMessageSeller} className="ld-primary-action">
              {t('listing:messageSeller','Message seller')}
            </Button>
          )}
          <button
            type="button"
            className={`ld-fav-btn${fav ? ' active' : ''}`}
            onClick={toggleFavorite}
            aria-pressed={fav}
            aria-label={fav ? t('listing:unfavoriteAria','Remove from saved') : t('listing:favoriteAria','Save this listing')}
            title={fav ? t('listing:favorited','Saved') : t('listing:favorite','Save')}
          >
            {fav ? '♥' : '♡'}
          </button>
          <button
            type="button"
            className="ld-share-btn"
            onClick={handleShare}
            aria-label={t('listing:share','Share')}
          >
            {copied ? t('listing:shareCopied','Link copied!') : t('listing:share','Share')}
          </button>
        </div>
        {isOwn && <div className="ld-owner-note">{t('listing:yourListing','Your listing')}</div>}
        <div className="ld-buybox-meta">
          <div>{t('listing:soldBy',{user: listing.user})}</div>
          <div>{t('listing:location',{location: listing.location})}</div>
        </div>
      </div>
    </aside>
  );
}
