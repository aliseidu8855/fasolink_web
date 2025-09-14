import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../Button';
import './ListingSnippet.css';

const formatPrice = (price) => new Intl.NumberFormat('fr-FR').format(price);

const ListingSnippet = ({ listing }) => {
  if (!listing) return null;

  const imageUrl = listing.images && listing.images.length > 0
    ? listing.images[0].image
    : 'https://via.placeholder.com/80';

  return (
    <div className="listing-snippet">
      <img src={imageUrl} alt={listing.title} className="snippet-image" />
      <div className="snippet-details">
        <p className="snippet-title">{listing.title}</p>
        <p className="snippet-location">{listing.location}</p>
        <p className="snippet-price">{formatPrice(listing.price)} CFA</p>
      </div>
      <Link to={`/listings/${listing.id}`}>
        <Button variant="success">View Listing</Button>
      </Link>
    </div>
  );
};

export default ListingSnippet;