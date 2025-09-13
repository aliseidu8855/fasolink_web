import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchListingById } from '../services/api';
import ListingImageGallery from '../components/ListingImageGallery';
import Button from '../components/Button';
import './ListingDetailPage.css';

// Helper to format the CFA currency
const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-FR').format(price);
};

const ListingDetailPage = () => {
  const { listingId } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getListing = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchListingById(listingId);
        console.log('Full listing data from API:', response.data); 

        setListing(response.data);
      } catch {
        setError('Failed to load listing details. The item may not exist.');
      } finally {
        setLoading(false);
      }
    };

    if (listingId) {
      getListing();
    } else {
      // LOG 6: This will tell us if the effect ran before the ID was ready.
      console.log('Waiting for a valid listingId...');
    }
  }, [listingId]);

  // LOG 7: See what the component is trying to render.
  console.log('--- Component rendering ---');
  console.log('Current state:', { loading, error, listing });

  if (loading) return <p className="container">Loading...</p>;
  if (error) return <p className="container error-message">{error}</p>;
  if (!listing) return null;

  return (
    <div className="container listing-detail-page">
      <div className="listing-detail-layout">
        <div className="gallery-column">
          <ListingImageGallery images={listing.images} />
        </div>
        <div className="details-column">
          <h1 className="detail-title">{listing.title}</h1>
          <p className="detail-price">{formatPrice(listing.price)} CFA</p>
          <div className="seller-info">
            <p className="seller-name">Sold by: <strong>{listing.user}</strong></p>
            <p className="listing-location">Location: <strong>{listing.location}</strong></p>
          </div>
          <Button variant="primary">Message Seller</Button>
          <hr className="divider" />
          <div className="description-section">
            <h2 className="section-heading">Description</h2>
            <p className="detail-description">{listing.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetailPage;