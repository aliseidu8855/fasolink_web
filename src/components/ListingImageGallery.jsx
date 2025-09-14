import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './ListingImageGallery.css';

const ListingImageGallery = ({ images }) => {
  const { t } = useTranslation(['listing']);
  const [mainImage, setMainImage] = useState(images[0]?.image || `https://via.placeholder.com/600x400.png?text=${encodeURIComponent(t('listing:noImages'))}`);

  if (!images || images.length === 0) {
    return (
      <div className="gallery-container">
        <img loading="lazy" src={mainImage} alt={t('listing:mainImage','Main listing image')} className="main-image" />
      </div>
    );
  }

  return (
    <div className="gallery-container">
      <div className="main-image-wrapper">
        <img loading="lazy" src={mainImage} alt={t('listing:mainImage','Main listing image')} className="main-image" />
      </div>
      <div className="thumbnail-wrapper">
        {images.map((img) => (
          <img
            loading="lazy"
            key={img.id}
            src={img.image}
            alt={t('listing:thumbnailImage','Listing thumbnail')}
            className={`thumbnail-image ${mainImage === img.image ? 'active' : ''}`}
            onClick={() => setMainImage(img.image)}
          />
        ))}
      </div>
    </div>
  );
};

export default ListingImageGallery;