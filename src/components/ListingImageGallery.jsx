import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import './ListingImageGallery.css';

const ListingImageGallery = ({ images }) => {
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
      <div className="main-image-wrapper" tabIndex={0} onKeyDown={onKeyDownMain} aria-roledescription="carousel" aria-live="polite">
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