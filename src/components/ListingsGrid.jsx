import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchListings } from '../services/api';
import ListingCard from './ListingCard';
import './ListingsGrid.css';

const ListingsGrid = ({ filters }) => {
  const { t } = useTranslation(['listing']);
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
          Object.entries(filters).filter(([, v]) => v != null && v !== '')
        );
        const response = await fetchListings(activeFilters);
        setListings(response.data.results || response.data);
      } catch (err) {
        setError(t('listing:listingsPage.error', 'Failed to load listings'));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    getListings();
  }, [filters, t]); // Re-fetch whenever filters or language change

  if (loading) return <p>{t('listing:listingsPage.loading', 'Loading…')}</p>;
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
        <p>{t('listing:listingsPage.emptyTitle', 'No listings found')}</p>
      )}
    </div>
  );
};

export default ListingsGrid;