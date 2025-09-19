import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { MessagingProvider } from './context/MessagingContext';
import ScrollToTop from './components/ScrollToTop';
import GlobalLoader from './components/loading/GlobalLoader.jsx';
import UpdateBadge from './components/UpdateBadge.jsx';
import { useEffect } from 'react';
import { ensurePushSubscription } from './utils/push';

// Lazy-loaded pages
const HomePage = lazy(()=>import('./pages/HomePage'));
const ListingsPage = lazy(()=>import('./pages/ListingsPage'));
const ListingDetailPage = lazy(()=>import('./pages/ListingDetailPage'));
const CreateListingPage = lazy(()=>import('./pages/CreateListingPage'));
const BrowsePage = lazy(()=>import('./pages/BrowsePage'));
const DashboardPage = lazy(()=>import('./pages/DashboardPage'));
const MessagesPage = lazy(()=>import('./pages/MessagesPage'));
const HelpPage = lazy(()=>import('./pages/HelpPage'));
const SettingsPage = lazy(()=>import('./pages/SettingsPage'));
const AuthPage = lazy(()=>import('./pages/AuthPage'));

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>            
        <Route index element={<HomePage />} />
        <Route path="/listings" element={<ListingsPage />} />
        <Route path="/listings/:listingId" element={<ListingDetailPage />} />
        <Route
          path="/create-listing"
          element={
            <ProtectedRoute>
              <CreateListingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages/:conversationId?"
          element={
            <ProtectedRoute>
              <MessagingProvider>
                <MessagesPage />
              </MessagingProvider>
            </ProtectedRoute>
          }
        />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/browse" element={<BrowsePage />} />
      </Route>
    </Routes>
  );
}

function App() {
  useEffect(() => {
    // Attempt to subscribe when app mounts if user is logged in and notifications are allowed
    const token = localStorage.getItem('authToken');
    const vapid = import.meta.env.VITE_VAPID_PUBLIC_KEY;
    if (token && vapid && 'serviceWorker' in navigator) {
      ensurePushSubscription({ vapidPublicKey: vapid }).catch(() => {})
    }
  }, []);
  return (
    <Router>
      <ScrollToTop />
      <UpdateBadge />
      <Suspense fallback={<GlobalLoader />}>      
        <AppRoutes />
      </Suspense>
    </Router>
  );
}

export default App;