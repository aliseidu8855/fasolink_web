import React, { useState, useEffect } from 'react';
import { fetchListings } from '../services/api';
import ListingCard from './ListingCard';
import './ListingsGrid.css';

const ListingsGrid = ({ filters }) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getListings = async () => {
      setLoading(true);
      setError(null);
      try {
        // Clean up filters: remove empty values
        const activeFilters = Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v != null && v !== '')
        );
        const response = await fetchListings(activeFilters);
        setListings(response.data.results || response.data);
      } catch (err) {
        setError('Failed to load listings. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    getListings();
  }, [filters]); // Re-fetch whenever filters change

  if (loading) return <p>Loading listings...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div>
      {listings.length > 0 ? (
        <div className="listings-grid">
          {listings.map(listing => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <p>No listings found matching your criteria.</p>
      )}
    </div>
  );
};

export default ListingsGrid;