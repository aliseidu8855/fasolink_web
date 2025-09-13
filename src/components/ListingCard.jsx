import React from 'react';
import { Link } from 'react-router-dom';
import './ListingCard.css';

// Helper to format the CFA currency
const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-FR').format(price);
};

const ListingCard = ({ listing }) => {
  // Use a placeholder if no images are available
  const imageUrl = listing.images && listing.images.length > 0 
    ? listing.images[0].image 
    : 'https://via.placeholder.com/300x200.png?text=No+Image';

  return (
    <Link to={`/listings/${listing.id}`} className="listing-card">
    <div className="listing-card">
      {listing.isFeatured && <div className="featured-badge">Featured</div>}
      <div className="listing-image-container">
        <img src={imageUrl} alt={listing.title} className="listing-image" />
      </div>
      <div className="listing-details">
        <h3 className="listing-title">{listing.title}</h3>
        <p className="listing-price">
          {formatPrice(listing.price)} <span className="currency">CFA</span>
        </p>
        <p className="listing-location">{listing.location}</p>
        <div className="listing-footer">
          <span className="listing-time">3 hours ago</span>
          <span className="listing-rating">&#9733; 4.8</span>
        </div>
      </div>
    </div>
    </Link>
  );
};

export default ListingCard;