import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchListings } from '../services/api';
import ListingCard from './ListingCard';
import './ListingRow.css';

const ListingRow = ({ title, apiParams }) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getListings = async () => {
      try {
        // Add a limit to only fetch 4 items for the homepage
        const response = await fetchListings({ ...apiParams, 'page-size': 4 });
        setListings(response.data.results || response.data); // Handle pagination if present
      } catch (err) {
        console.error(`Failed to load ${title} listings:`, err);
      } finally {
        setLoading(false);
      }
    };

    getListings();
  }, [title, apiParams]);

  if (loading) return <p>Loading {title}...</p>;

  return (
    <section className="listing-row-section container">
      <div className="section-header">
        <h2 className="section-title">{title}</h2>
        <Link to="/listings" className="view-all-link">View All</Link>
      </div>
      <div className="listing-grid">
        {listings.map(listing => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </section>
  );
};

export default ListingRow;