import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import './ListingImageGallery.css';

const ListingImageGallery = ({ images, onOpenFullscreen }) => {
  const { t } = useTranslation(['listing']);
  const safeImages = Array.isArray(images) ? images : [];
  const [index, setIndex] = useState(0);
  const mainImage = safeImages[index]?.image || `https://via.placeholder.com/600x400.png?text=${encodeURIComponent(t('listing:noImages'))}`;
  const thumbsRef = useRef([]);

  const setMainImageByIndex = useCallback((i) => {
    if (i < 0 || i >= safeImages.length) return;
    setIndex(i);
  }, [safeImages.length]);

  const onKeyDownMain = (e) => {
    if (!safeImages.length) return;
    if (e.key === 'ArrowRight') {
      e.preventDefault(); setMainImageByIndex(Math.min(index + 1, safeImages.length - 1));
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault(); setMainImageByIndex(Math.max(index - 1, 0));
    }
  };

  // Simple touch swipe support
  const touchStart = useRef({ x: 0, y: 0, t: 0 });
  const onTouchStart = (e) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY, t: Date.now() };
  };
  const onTouchEnd = (e) => {
    if (!safeImages.length) return;
    const dx = (e.changedTouches[0]?.clientX || 0) - touchStart.current.x;
    const dy = (e.changedTouches[0]?.clientY || 0) - touchStart.current.y;
    const dt = Date.now() - touchStart.current.t;
    const THRESH_X = 40; // px
    if (dt < 700 && Math.abs(dx) > THRESH_X && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) {
        setMainImageByIndex(Math.min(index + 1, safeImages.length - 1));
      } else {
        setMainImageByIndex(Math.max(index - 1, 0));
      }
    }
  };

  useEffect(()=>{
    const currentThumbs = thumbsRef.current;
    if (currentThumbs[index]) currentThumbs[index].setAttribute('data-active','true');
    return () => {
      if (currentThumbs[index]) currentThumbs[index].removeAttribute('data-active');
    };
  }, [index]);

  if (!safeImages.length) {
    return (
      <div className="gallery-container">
        <img loading="lazy" src={mainImage} alt={t('listing:mainImage','Main listing image')} className="main-image" />
      </div>
    );
  }

  return (
    <div className="gallery-container" aria-label={t('listing:imageCount', { current: index+1, total: safeImages.length, defaultValue: `Image ${index+1} of ${safeImages.length}` })}>
      <div
        className="main-image-wrapper"
        tabIndex={0}
        onKeyDown={onKeyDownMain}
        aria-roledescription="carousel"
        aria-live="polite"
        onClick={() => onOpenFullscreen && onOpenFullscreen(index)}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        role={onOpenFullscreen ? 'button' : undefined}
        aria-label={onOpenFullscreen ? t('listing:openFullscreen','Open fullscreen') : undefined}
      >
        <img
          loading="lazy"
            src={mainImage}
            alt={t('listing:mainImage','Main listing image')}
            className="main-image"
        />
        {safeImages.length > 1 && (
          <div className="img-count-badge" aria-hidden="true">{index+1}/{safeImages.length}</div>
        )}
      </div>
      <div className="thumbnail-wrapper" role="list" aria-label={t('listing:thumbnailImage','Listing thumbnail')}>
        {safeImages.map((img, i) => (
          <button
            type="button"
            role="listitem"
            key={img.id || i}
            ref={el => thumbsRef.current[i] = el}
            onClick={()=>setMainImageByIndex(i)}
            className={`thumbnail-image-btn ${i===index ? 'active' : ''}`}
            aria-label={t('listing:imageCount', { current: i+1, total: safeImages.length, defaultValue: `Image ${i+1} of ${safeImages.length}` })}
            aria-current={i===index}
          >
            <img loading="lazy" src={img.image} alt="" className="thumbnail-image" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ListingImageGallery;