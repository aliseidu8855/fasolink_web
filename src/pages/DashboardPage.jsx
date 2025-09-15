import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchUserListings, fetchDashboardStats, deleteListing } from '../services/api';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import DashboardOverview from '../components/dashboard/DashboardOverview';
import DashboardListingsPanel from '../components/dashboard/DashboardListingsPanel';
import DashboardProfilePanel from '../components/dashboard/DashboardProfilePanel';
import DashboardSettingsPanel from '../components/dashboard/DashboardSettingsPanel';
import DashboardSkeleton from '../components/dashboard/Skeleton';
import ListingModal from '../components/dashboard/ListingModal';
import '../components/dashboard/dashboard.css';
import { useTranslation } from 'react-i18next';

// New dashboard page leveraging modular layout & panels
const DashboardPage = () => {
  const { user, logout } = useAuth();
  const { t } = useTranslation('dashboard');
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dashStats, setDashStats] = useState(null);
  const [error, setError] = useState(null);
  const [active, setActive] = useState('overview');
  const [showListingModal, setShowListingModal] = useState(false);
  const [editingListing, setEditingListing] = useState(null);

  // Fetch user listings when authenticated
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const run = async () => {
      try {
        setLoading(true);
        const [listingsResp, statsResp] = await Promise.all([
          fetchUserListings(),
          fetchDashboardStats()
        ]);
        if (!cancelled) {
          setListings(listingsResp.data.results || listingsResp.data || []);
          setDashStats(statsResp.data);
        }
      } catch (e) {
  if (!cancelled) setError(t('listings.loadError','Load error'));
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [user, t]);

  const stats = useMemo(() => {
    const total = listings.length;
    const activeCount = listings.filter(l => l.is_active !== false).length;
    return {
      total,
      active: activeCount,
      views: dashStats?.views ?? 0,
      messages: dashStats?.messages ?? 0
    };
  }, [listings, dashStats]);

  if (!user) return <p className="container">{t('authRequired','Connexion requise…')}</p>;
  if (loading && listings.length === 0) {
    return (
      <DashboardLayout active={active} onNavigate={setActive} onLogout={logout}>
        <DashboardSkeleton />
      </DashboardLayout>
    );
  }
  if (error) return <p className="container error-message">{error}</p>;

  let panel = null;
  const handleNew = () => { setEditingListing(null); setShowListingModal(true); };
  const handleCreated = (created) => { setListings(ls => [created, ...ls]); };
  const handleUpdated = (updated) => { setListings(ls => ls.map(l => l.id === updated.id ? updated : l)); };
  const handleEdit = (l) => { setEditingListing(l); setShowListingModal(true); };
  const handleDelete = async (l) => {
    if (!window.confirm(t('listings.deleteConfirm',{ title: l.title }))) return;
    try {
      await deleteListing(l.id);
      setListings(ls => ls.filter(x => x.id !== l.id));
    } catch (e) {
      console.error(e);
      alert(t('listings.deleteError'));
    }
  };

  if (active === 'overview') panel = <DashboardOverview stats={stats} user={user} />;
  else if (active === 'listings') panel = <DashboardListingsPanel listings={listings} loading={loading} onNew={handleNew} onEdit={handleEdit} onDelete={handleDelete} />;
  else if (active === 'profile') panel = <DashboardProfilePanel user={user} onUpdate={()=>{ /* optimistic local update of auth user */ }} />;
  else if (active === 'settings') panel = <DashboardSettingsPanel />;

  return (
    <DashboardLayout active={active} onNavigate={setActive} onLogout={logout}>
      {panel}
      <ListingModal
        open={showListingModal}
        existing={editingListing}
        onClose={() => setShowListingModal(false)}
        onCreated={handleCreated}
        onUpdated={handleUpdated}
      />
    </DashboardLayout>
  );
};

export default DashboardPage;