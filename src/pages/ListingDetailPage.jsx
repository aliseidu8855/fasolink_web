import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchListingById, startConversation } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import AuthForms from './AuthForms';
import ListingImageGallery from '../components/ListingImageGallery';
import Button from '../components/Button';
import './ListingDetailPage.css';

// Helper to format the CFA currency
const formatPrice = (price) => {
  // Ensure price is a number before formatting
  const numericPrice = Number(price);
  if (isNaN(numericPrice)) {
    return price; // Return original string if not a valid number
  }
  return new Intl.NumberFormat('fr-FR').format(numericPrice);
};

const ListingDetailPage = () => {
  const { listingId } = useParams();
  const { t } = useTranslation(['listing','common','errors']);
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { openModal } = useModal();

  useEffect(() => {
    const getListing = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchListingById(listingId);
        setListing(response.data);
      } catch (err) {
        console.error('Error fetching listing details:', err);
        setError(t('errors:listingNotFound'));
      } finally {
        setLoading(false);
      }
    };
    if (listingId) getListing();
  }, [listingId, t]);

  const handleMessageSeller = async () => {
    if (!isAuthenticated) {
      // If user is not logged in, open the login modal and stop.
      openModal(<AuthForms />);
      return;
    }
    try {
      const response = await startConversation(listing.id);
      // Navigate (both for new and existing). Could add toast indicating reused conversation.
      navigate(`/messages/${response.data.id}`);
    } catch (err) {
      console.error('Could not start conversation', err);
      alert(t('errors:unexpectedConversation'));
    }
  };

  // JSON-LD generation
  const buildJsonLd = (l) => {
    if(!l) return null;
    const sellerRating = l.seller_rating ? {
      "@type": "AggregateRating",
      "ratingValue": Number(l.seller_rating).toFixed(1),
      "reviewCount": l.seller_rating_count || 1
    } : undefined;
    return {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": l.title,
      "description": l.description?.slice(0, 500),
      "category": l.category, // backend category id; could be expanded to name
      "image": (l.images && l.images[0]) ? l.images[0].image : undefined,
      "offers": {
        "@type": "Offer",
        "price": l.price,
        "priceCurrency": "XOF",
        "availability": "https://schema.org/InStock"
      },
      "seller": {
        "@type": "Organization",
        "name": l.user
      },
      ...(sellerRating ? { aggregateRating: sellerRating } : {})
    };
  };

  if (loading) return <p className="container">{t('common:loading')}</p>;
  if (error) return <p className="container error-message">{error}</p>;
  if (!listing) return null;

  const jsonLd = buildJsonLd(listing);
  const sellerRating = listing.seller_rating;
  const isOwnListing = user?.username === listing.user;

  return (
    <div className="container listing-detail-page">
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}
      <div className="detail-grid">
        <div className="detail-gallery">
          <ListingImageGallery images={listing.images} />
        </div>
        <div className="detail-main">
          <h1 className="detail-title">{listing.title}</h1>
          <div className="badges-row">
            {listing.is_featured && <span className="badge badge-featured">{t('listing:badgeFeatured','Featured')}</span>}
            {listing.negotiable && <span className="badge badge-negotiable">{t('listing:badgeNegotiable','Negotiable')}</span>}
            {/* New badge within 48h */}
            {listing.created_at && (Date.now() - new Date(listing.created_at).getTime()) < 48*3600*1000 && (
              <span className="badge badge-new">{t('listing:badgeNew','New')}</span>
            )}
          </div>
          <div className="rating-row">
            {sellerRating ? (
              <div className="rating-stars" aria-label={`Seller rating ${sellerRating} out of 5`}>
                <span className="rating-value">{Number(sellerRating).toFixed(1)}</span>
                <span className="stars-bar">
                  {Array.from({length:5}).map((_,i)=>{
                    const val = Number(sellerRating);
                    const full = i+1 <= Math.floor(val);
                    const half = !full && (val - i) >= 0.5;
                    return <span key={i} className={`star ${full?'full':half?'half':''}`}>★</span>;
                  })}
                </span>
                <span className="rating-context">{t('listing:sellerRating','Seller rating')}</span>
                {typeof listing.seller_rating_count === 'number' && listing.seller_rating_count > 0 && (
                  <span className="rating-count">({listing.seller_rating_count})</span>
                )}
              </div>
            ) : <span className="rating-placeholder">{t('listing:noRatings','No ratings yet')}</span>}
          </div>
          <div className="price-block">
            <span className="price-main">{formatPrice(listing.price)} CFA</span>
            {listing.negotiable && <span className="price-note">{t('listing:priceNegotiable','Negotiable')}</span>}
          </div>
          <div className="meta-grid">
            <div>
              <div className="meta-label">{t('listing:seller','Seller')}</div>
              <div className="meta-value">{listing.user}</div>
            </div>
            <div>
              <div className="meta-label">{t('listing:locationLabel','Location')}</div>
              <div className="meta-value">{listing.location}</div>
            </div>
            <div>
              <div className="meta-label">{t('listing:posted','Posted')}</div>
              <div className="meta-value">{new Date(listing.created_at).toLocaleDateString()}</div>
            </div>
            {sellerRating && (
              <div>
                <div className="meta-label">{t('listing:sellerRating','Seller rating')}</div>
                <div className="meta-value">{Number(sellerRating).toFixed(1)}</div>
              </div>
            )}
          </div>
          <div className="description-section">
            <h2 className="section-heading">{t('listing:description')}</h2>
            <p className="detail-description">{listing.description}</p>
          </div>
        </div>
        <div className="detail-actions">
          <div className="action-card">
            <div className="action-price">{formatPrice(listing.price)} CFA</div>
            {listing.negotiable && <div className="action-negotiable">{t('listing:priceNegotiable','Negotiable')}</div>}
            {!isOwnListing && (
              <Button variant="primary" onClick={handleMessageSeller}>{t('listing:messageSeller')}</Button>
            )}
            {isOwnListing && (
              <div className="owner-note">{t('listing:yourListing','Your listing')}</div>
            )}
            <div className="action-meta-small">{t('listing:soldBy',{user: listing.user})}</div>
            <div className="action-meta-small">{t('listing:location',{location: listing.location})}</div>
          </div>
        </div>
      </div>
      {/* Mobile sticky CTA bar */}
      <div className="mobile-sticky-cta" role="complementary">
        <div className="msc-price">{formatPrice(listing.price)} CFA {listing.negotiable && <span className="msc-neg">{t('listing:priceNegotiable','Negotiable')}</span>}</div>
        {!isOwnListing ? (
          <Button variant="primary" onClick={handleMessageSeller}>{t('listing:messageSeller')}</Button>
        ) : (
          <span className="msc-owner">{t('listing:yourListing','Your listing')}</span>
        )}
      </div>
    </div>
  );
};

export default ListingDetailPage;