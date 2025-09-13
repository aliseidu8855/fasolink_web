import React, { useState } from 'react';
import './ListingImageGallery.css';

const ListingImageGallery = ({ images }) => {
  console.log('Images prop received by gallery:', images);
  const [mainImage, setMainImage] = useState(images[0]?.image || 'https://via.placeholder.com/600x400.png?text=No+Image');

  if (!images || images.length === 0) {
    return (
      <div className="gallery-container">
        <img src={mainImage} alt="Main listing" className="main-image" />
      </div>
    );
  }

  return (
    <div className="gallery-container">
      <div className="main-image-wrapper">
        <img src={mainImage} alt="Main listing" className="main-image" />
      </div>
      <div className="thumbnail-wrapper">
        {images.map((img) => (
          <img
            key={img.id}
            src={img.image}
            alt="Listing thumbnail"
            className={`thumbnail-image ${mainImage === img.image ? 'active' : ''}`}
            onClick={() => setMainImage(img.image)}
          />
        ))}
      </div>
    </div>
  );
};

export default ListingImageGallery;