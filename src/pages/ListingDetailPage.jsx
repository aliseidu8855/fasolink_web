import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchListingById, startConversation, fetchRelatedListings, sendMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import AuthForms from './AuthForms';
import ListingImageGallery from '../components/ListingImageGallery';
import Button from '../components/Button';
import ListingBuyBox from '../components/listing/ListingBuyBox';
import ListingCoreInfo from '../components/listing/ListingCoreInfo';
import ListingSpecsTable from '../components/listing/ListingSpecsTable';
import SellerInfoPanel from '../components/listing/SellerInfoPanel';
import RelatedListingsCarousel from '../components/listing/RelatedListingsCarousel';
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
  const [related, setRelated] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [relatedError, setRelatedError] = useState(null);
  const [showPresets, setShowPresets] = useState(false);
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

  // Lazy-load related listings via IntersectionObserver
  useEffect(()=>{
    let observer; let cancelled=false;
    const anchor = document.getElementById('ld-related-anchor');
    if (anchor && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(async entries => {
        for (const entry of entries) {
          if (entry.isIntersecting && listing && listing.category && !cancelled && !relatedLoading && related.length===0) {
            setRelatedLoading(true); setRelatedError(null);
            try {
              const rel = await fetchRelatedListings(listing.category, listing.id, 12);
              setRelated(rel);
              if (!rel.length) setRelatedError('empty');
            } catch { setRelatedError('error'); }
            finally { setRelatedLoading(false); }
          }
        }
      }, { rootMargin: '200px 0px' });
      observer.observe(anchor);
    }
    return ()=>{ cancelled=true; if (observer) observer.disconnect(); };
  }, [listing, related.length, relatedLoading]);

  const handleMessageSeller = async (preset=null) => {
    if (!isAuthenticated) {
      openModal(<AuthForms />);
      return;
    }
    try {
      const response = await startConversation(listing.id);
      const convoId = response.data.id;
      if (preset) {
        try { await sendMessage(convoId, preset); } catch(e){ console.warn('Preset send failed', e); }
      }
      navigate(`/messages/${convoId}`);
    } catch (err) {
      console.error('Could not start conversation', err);
      alert(t('errors:unexpectedConversation'));
    }
  };

  const messagePresets = useMemo(()=>[
    t('listing:presetAvailable','Is this still available?'),
    t('listing:presetLastPrice','What is your last price?'),
    t('listing:presetNegotiate','Can we negotiate?')
  ], [t]);

  // JSON-LD generation
  const buildJsonLd = (l) => {
    if(!l) return null;
    const sellerRating = l.seller_rating ? {
      "@type": "AggregateRating",
      "ratingValue": Number(l.seller_rating).toFixed(1),
      "reviewCount": l.seller_rating_count || 1
    } : undefined;
    const images = (l.images || []).map(img => img.image).filter(Boolean);
    const breadcrumb = {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Home", "item": window.location.origin + "/"},
        {"@type": "ListItem", "position": 2, "name": "Listings", "item": window.location.origin + "/listings"},
        {"@type": "ListItem", "position": 3, "name": l.title, "item": window.location.href}
      ]
    };
    // Contact action for messaging seller
    const contactAction = {
      "@type": "ContactAction",
      "name": "Message Seller",
      "description": "Contact the seller about this item",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": window.location.href + "#message-seller",
        "actionApplication": {
          "@type": "WebApplication",
          "name": "FasoLink"
        }
      }
    };
    const product = {
      "@context": "https://schema.org",
      "@type": "Product",
      "sku": String(l.id),
      "productID": String(l.id),
      "name": l.title,
      "description": l.description?.slice(0, 500),
      "category": l.category,
      ...(images.length ? { image: images } : {}),
      "offers": {
        "@type": "Offer",
        "price": l.price,
        "priceCurrency": "XOF",
        "availability": "https://schema.org/InStock",
        "url": window.location.href,
        ...(l.negotiable ? { priceSpecification: { "@type": "PriceSpecification", "valueAddedTaxIncluded": false } } : {})
      },
      "seller": {"@type": "Organization", "name": l.user},
      "potentialAction": [contactAction],
      ...(sellerRating ? { aggregateRating: sellerRating } : {})
    };
    return { "@graph": [ product, breadcrumb ] };
  };

  if (loading) return <p className="container">{t('common:loading')}</p>;
  if (error) return <p className="container error-message">{error}</p>;
  if (!listing) return null;

  const jsonLd = buildJsonLd(listing);
  const isOwnListing = user?.username === listing.user;

  return (
    <div className="container listing-detail-page" role="main">
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}
      <div className="detail-grid">
        <div className="detail-gallery">
          <ListingImageGallery images={listing.images} />
        </div>
        <div className="detail-main">
          <ListingCoreInfo listing={listing} />
          <ListingSpecsTable listing={listing} />
          <SellerInfoPanel listing={listing} />
        </div>
        <div className="detail-actions">
          <ListingBuyBox
            listing={listing}
            onMessageSeller={handleMessageSeller}
            isOwn={isOwnListing}
            formatPrice={formatPrice}
          />
          {!isOwnListing && (
            <div className="ld-presets">
              <button type="button" className="ld-presets-toggle" onClick={()=>setShowPresets(s=>!s)} aria-expanded={showPresets}>
                {t('listing:quickMessages','Quick messages')}
              </button>
              {showPresets && (
                <ul className="ld-presets-list" role="list">
                  {messagePresets.map((p,i)=>(
                    <li key={i}><button type="button" className="ld-preset-btn" onClick={()=>handleMessageSeller(p)}>{p}</button></li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="detail-lower">
        {relatedLoading && <p className="ld-related-loading" aria-live="polite">{t('common:loading')}</p>}
        <div id="ld-related-anchor" style={{height:1}} />
        {!relatedLoading && related.length > 0 && <RelatedListingsCarousel listings={related} />}
        {!relatedLoading && related.length === 0 && relatedError === 'empty' && (
          <p className="ld-related-empty">{t('listing:relatedEmpty','No related items found')}</p>
        )}
        {!relatedLoading && relatedError === 'error' && (
          <p className="ld-related-error">{t('listing:relatedError','Couldn\'t load related items')}</p>
        )}
        {/* Reviews placeholder */}
        <section className="ld-reviews" aria-labelledby="ld-reviews-h">
          <h2 id="ld-reviews-h" className="ld-section-h">{t('listing:reviews','Reviews')}</h2>
          <p className="ld-reviews-empty">{t('listing:noReviewsYet','No reviews yet')}</p>
        </section>
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