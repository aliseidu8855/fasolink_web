import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { fetchUserListings } from '../services/api';
import ListingCard from '../components/ListingCard'; // We can reuse our existing card!
import './DashboardPage.css';

const DashboardPage = () => {
  const { user } = useAuth();
  const { t } = useTranslation(['dashboard','common']);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Wait until we actually have a user before fetching
    if (!user) return;

    let isCancelled = false;
    const getListings = async () => {
      try {
        setLoading(true);
        const response = await fetchUserListings();
        if (!isCancelled) {
          setListings(response.data.results || response.data);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(t('dashboard:loadError'));
        }
        console.error(err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    getListings();
    return () => { isCancelled = true; };
  }, [user, t]);

  if (!user) {
    return <p className="container">{t('dashboard:loadingUser')}</p>;
  }
  if (loading) return <p className="container">{t('dashboard:loadingDashboard')}</p>;
  if (error) return <p className="container error-message">{error}</p>;

  return (
    <div className="container dashboard-page">
  <h1 className="dashboard-title">{t('dashboard:welcome', { username: user?.username || 'User' })}</h1>
    <p className="dashboard-subtitle">{t('dashboard:subtitle')}</p>
      
      <div className="user-listings-grid">
        {listings.length > 0 ? (
          listings.map(listing => (
            // We can enhance ListingCard later to include edit/delete buttons
            <ListingCard key={listing.id} listing={listing} />
          ))
        ) : (
          <p>{t('dashboard:noListings')}</p>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;