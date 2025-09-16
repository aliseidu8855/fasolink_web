import React, { useRef, useState, useEffect } from 'react';
import ListingCard from '../ListingCard';
import { useTranslation } from 'react-i18next';

export default function RelatedListingsCarousel({ listings }) {
  const { t } = useTranslation(['listing']);
  const scrollerRef = useRef(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const updateScrollState = () => {
      setCanScrollPrev(el.scrollLeft > 5);
      setCanScrollNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 5);
    };
    updateScrollState();
    el.addEventListener('scroll', updateScrollState);
    window.addEventListener('resize', updateScrollState);
    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [listings]);
  if (!listings || listings.length === 0) return null;
  const scrollBy = (dir) => {
    const el = scrollerRef.current;
    if (!el) return;
    const amt = Math.min(340, el.clientWidth * 0.9);
    el.scrollBy({ left: dir * amt, behavior: 'smooth' });
  };
  return (
    <section className="ld-related" aria-labelledby="ld-related-h">
      <div className="ld-related-header">
        <h2 id="ld-related-h" className="ld-section-h">{t('listing:relatedItems','Related items')}</h2>
        <div className="ld-related-controls" role="group" aria-label={t('listing:carouselNav','Carousel navigation')}>
          <button
            type="button"
            className="ld-carousel-btn"
            onClick={()=>scrollBy(-1)}
            aria-label={t('listing:carouselPrev','Previous')}
            disabled={!canScrollPrev}
            aria-disabled={!canScrollPrev}
          >‹</button>
          <button
            type="button"
            className="ld-carousel-btn"
            onClick={()=>scrollBy(1)}
            aria-label={t('listing:carouselNext','Next')}
            disabled={!canScrollNext}
            aria-disabled={!canScrollNext}
          >›</button>
        </div>
      </div>
      <div ref={scrollerRef} className="ld-related-scroller" role="list">
        {listings.map(l => (
          <div role="listitem" key={l.id} className="ld-related-item">
            <ListingCard listing={l} compact />
          </div>
        ))}
      </div>
    </section>
  );
}
