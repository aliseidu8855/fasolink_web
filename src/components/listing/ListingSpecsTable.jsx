import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function ListingSpecsTable({ listing }) {
  const { t } = useTranslation(['listing']);
  const [showMore, setShowMore] = useState(false);
  const { deduped } = useMemo(() => {
    if (!listing) return { baseSpecs: [], deduped: [] };
    const bs = [
      { key:'brand', label: t('listing:specBrand','Brand'), value: listing.brand },
      { key:'category', label: t('listing:specCategory','Category'), value: listing.category },
      { key:'room', label: t('listing:specRoom','Room'), value: listing.room },
      { key:'condition', label: t('listing:specCondition','Condition'), value: listing.condition },
      { key:'color', label: t('listing:specColor','Color'), value: listing.color },
      { key:'material', label: t('listing:specMaterial','Material'), value: listing.material },
      { key:'posted', label: t('listing:specPosted','Posted'), value: listing.created_at ? new Date(listing.created_at).toLocaleDateString() : null },
      { key:'seller', label: t('listing:specSeller','Seller'), value: listing.user },
      { key:'id', label: t('listing:specId','Listing ID'), value: listing.id }
    ].filter(s => s.value);
    const attrLabel = (k) => {
      const map = {
        brand: t('listing:specBrand','Brand'),
        condition: t('listing:specCondition','Condition'),
        color: t('listing:specColor','Color'),
        material: t('listing:specMaterial','Material'),
        size: t('listing:specSize','Size'),
        gender: t('listing:specGender','Gender'),
        property_type: t('listing:specPropertyType','Property type'),
        bedrooms: t('listing:specBedrooms','Bedrooms'),
        bathrooms: t('listing:specBathrooms','Bathrooms'),
        size_sqm: t('listing:specSizeSqm','Size (sqm)'),
        furnished: t('listing:specFurnished','Furnished'),
        year_built: t('listing:specYearBuilt','Year built'),
        device_type: t('listing:specDeviceType','Device type'),
        model: t('listing:specModel','Model'),
        internal_storage: t('listing:specStorage','Storage'),
        ram: t('listing:specRam','RAM'),
        screen_size: t('listing:specScreenSize','Screen size'),
        battery: t('listing:specBattery','Battery (mAh)'),
        os: t('listing:specOs','Operating system'),
        sim: t('listing:specSim','SIM'),
        network: t('listing:specNetwork','Network'),
        exchange_possible: t('listing:specExchangePossible','Exchange possible'),
        type: t('listing:specType','Type'),
        power_w: t('listing:specPower','Power (W)'),
      };
      return map[k] || k;
    };
    const attrs = Array.isArray(listing.attributes_out)
      ? listing.attributes_out.map(a => ({ key: String(a.name), label: attrLabel(String(a.name)), value: a.value })).filter(s=> s.value)
      : [];
    const m = new Map();
    for (const s of bs) m.set(s.key, s);
    for (const s of attrs) m.set(s.key, s);
    return { deduped: Array.from(m.values()) };
  }, [listing, t]);
  const initialCount = 6;
  const visibleSpecs = showMore ? deduped : deduped.slice(0, initialCount);
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
      {deduped.length > initialCount && (
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
