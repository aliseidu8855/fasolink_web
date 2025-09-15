import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function ListingSpecsTable({ listing }) {
  const { t } = useTranslation(['listing']);
  const [showMore, setShowMore] = useState(false);
  if (!listing) return null;
  const baseSpecs = [
    { key:'brand', label: t('listing:specBrand','Brand'), value: listing.brand },
    { key:'category', label: t('listing:specCategory','Category'), value: listing.category },
    { key:'type', label: t('listing:specType','Type'), value: listing.category },
    { key:'room', label: t('listing:specRoom','Room'), value: listing.room },
    { key:'condition', label: t('listing:specCondition','Condition'), value: listing.condition },
    { key:'color', label: t('listing:specColor','Color'), value: listing.color },
    { key:'material', label: t('listing:specMaterial','Material'), value: listing.material },
    { key:'posted', label: t('listing:specPosted','Posted'), value: new Date(listing.created_at).toLocaleDateString() },
    { key:'seller', label: t('listing:specSeller','Seller'), value: listing.user },
    { key:'id', label: t('listing:specId','Listing ID'), value: listing.id }
  ].filter(s => s.value);
  const initialCount = 6;
  const visibleSpecs = showMore ? baseSpecs : baseSpecs.slice(0, initialCount);
  return (
    <section className="ld-specs" aria-labelledby="ld-specs-h">
      <h2 id="ld-specs-h" className="ld-section-h">{t('listing:specifications','Specifications')}</h2>
      <dl className="ld-specs-grid">
        {visibleSpecs.map((s)=>(
          <div key={s.key} className="ld-spec-row">
            <dt>{s.label}</dt>
            <dd>{s.value}</dd>
          </div>
        ))}
      </dl>
      {baseSpecs.length > initialCount && (
        <button
          type="button"
          className="ld-showmore-btn"
          onClick={()=>setShowMore(m=>!m)}
          aria-expanded={showMore}
        >
          {showMore ? t('listing:showLess','Show less') : t('listing:showMore','Show more')}
        </button>
      )}
      {(listing.address_line || listing.address_city || listing.address_region) && (
        <div className="ld-store-address" aria-labelledby="ld-store-h">
          <h3 id="ld-store-h" className="ld-store-h">{t('listing:storeAddress','Store address')}</h3>
          <div className="ld-store-lines">
            <div className="ld-store-line region">{[listing.address_city, listing.address_region].filter(Boolean).join(', ')}</div>
            {listing.address_postal_code && <div className="ld-store-line postal">{listing.address_postal_code}</div>}
            {listing.address_line && <div className="ld-store-line line1">{listing.address_line}</div>}
            {listing.opening_hours && (
              <div className="ld-store-hours">
                <span className={`ld-open-dot ${listing.is_open_now ? 'open':'closed'}`}></span>
                <span className="ld-hours-text">{listing.is_open_now ? t('listing:openNow','Open now') : t('listing:closed','Closed')} • {listing.opening_hours}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
