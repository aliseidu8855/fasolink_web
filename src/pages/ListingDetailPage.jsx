import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchListingById, startConversation, fetchRelatedListings, sendMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
// Removed modal-based auth import; use route navigation instead
import ListingImageGallery from '../components/ListingImageGallery';
import Button from '../components/Button';
import { PhoneIcon, MessageBubbleIcon } from '../components/icons/Icons';
import ListingBuyBox from '../components/listing/ListingBuyBox';
import ListingCoreInfo from '../components/listing/ListingCoreInfo';
import ListingSpecsTable from '../components/listing/ListingSpecsTable';
import SellerInfoPanel from '../components/listing/SellerInfoPanel';
import RelatedListingsCarousel from '../components/listing/RelatedListingsCarousel';
import './ListingDetailPage.css';
import ListingDetailSkeleton from '../components/listing/ListingDetailSkeleton';
import ListingGalleryOverlay from '../components/listing/ListingGalleryOverlay';
import { useSEO, canonicalForPath } from '../utils/seo';

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
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

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
      // Redirect to auth page with next pointing back here plus action anchor
      const next = encodeURIComponent(window.location.pathname + window.location.search + '#message-seller');
      navigate(`/auth?mode=login&next=${next}`);
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

  // SEO for detail page (call hook unconditionally)
  const firstImg = (Array.isArray(listing?.images) && listing.images.length) ? listing.images[0].image : undefined;
  const seoTitle = listing ? `${listing.title} | FasoLink` : 'FasoLink – Détail de l\'annonce';
  const seoDesc = listing?.description?.slice(0, 160) || 'Consultez les détails de cette annonce sur FasoLink.';
  const seoCanonical = listing ? canonicalForPath(`/listings/${listing.id}`) : undefined;
  const hreflangs = [
    ...(seoCanonical ? [{ href: seoCanonical, hrefLang: 'fr' }] : []),
    ...(seoCanonical ? [{ href: seoCanonical, hrefLang: 'x-default' }] : []),
  ];
  useSEO({ title: seoTitle, description: seoDesc, canonical: seoCanonical, image: firstImg, hreflangs });

  if (loading) return <ListingDetailSkeleton />;
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
          <ListingImageGallery images={listing.images} onOpenFullscreen={(i)=>{ setGalleryIndex(i||0); setGalleryOpen(true); }} />
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
            <div className="ld-presets" id="quick-messages">
              <button 
                type="button" 
                className="ld-presets-toggle" 
                onClick={()=>setShowPresets(s=>!s)} 
                aria-expanded={showPresets}
                aria-controls="ld-presets-panel"
              >
                {t('listing:quickMessages','Quick messages')}
              </button>
              {showPresets && (
                <div id="ld-presets-panel" className="ld-presets-chips" role="group" aria-label={t('listing:quickMessages','Quick messages')}>
                  {messagePresets.map((p,i)=>(
                    <button 
                      key={i} 
                      type="button" 
                      className="ld-chip" 
                      onClick={()=>handleMessageSeller(p)}
                    >{p}</button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="detail-lower">
        {relatedLoading && (
          <div className="ld-related-loading" role="status" aria-live="polite">
            <div style={{ display:'flex', gap:12, overflow:'hidden' }}>
              {Array.from({ length: 4 }).map((_,i)=> (
                <div key={`rl-sk-${i}`} style={{ flex:'0 0 220px' }}>
                  <div className="skel skel-rect" style={{ '--sk-h':'140px', '--sk-r':'10px' }} />
                  <div style={{ marginTop:8 }}>
                    <div className="skel skel-line" style={{ '--sk-h':'10px', width:'85%' }} />
                    <div className="skel skel-line" style={{ '--sk-h':'10px', width:'60%', marginTop:6 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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
      {/* Fullscreen gallery overlay */}
      <ListingGalleryOverlay images={Array.isArray(listing.images)?listing.images:[]} startIndex={galleryIndex} open={galleryOpen} onClose={()=>setGalleryOpen(false)} />

      {/* Mobile sticky CTA bar */}
      <div className="mobile-sticky-cta" role="complementary">
        <div className="msc-price">{formatPrice(listing.price)} CFA {listing.negotiable && <span className="msc-neg">{t('listing:priceNegotiable','Negotiable')}</span>}</div>
        {!isOwnListing ? (
          <div style={{display:'flex', gap:'.5rem'}}>
            {listing.contact_phone ? (
              <a href={`tel:${listing.contact_phone}`} className="btn btn-secondary" style={{display:'inline-flex',alignItems:'center',justifyContent:'center',padding:'.6rem .9rem',borderRadius:'8px',border:'1px solid #d0d5da',fontWeight:600, gap:'.4rem'}}>
                <PhoneIcon size={16} />
                {t('listing:callSeller','Call')}
              </a>
            ) : null}
            <Button variant="primary" onClick={handleMessageSeller} style={{ display:'inline-flex', alignItems:'center', gap:'.4rem' }}>
              <MessageBubbleIcon size={16} />
              {t('listing:messageSeller')}
            </Button>
          </div>
        ) : (
          <span className="msc-owner">{t('listing:yourListing','Your listing')}</span>
        )}
      </div>
    </div>
  );
};

export default ListingDetailPage;