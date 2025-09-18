import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { MessagingProvider } from './context/MessagingContext';
import ScrollToTop from './components/ScrollToTop';
import GlobalLoader from './components/loading/GlobalLoader.jsx';
import UpdateBadge from './components/UpdateBadge.jsx';

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

function RoutesWithFade() {
  const location = useLocation();
  return (
    <TransitionGroup>
      <CSSTransition key={location.key} classNames="page" timeout={160}>
        <Routes location={location}>
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
      </CSSTransition>
    </TransitionGroup>
  );
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <UpdateBadge />
      <Suspense fallback={<GlobalLoader />}>      
        <RoutesWithFade />
      </Suspense>
    </Router>
  );
}

export default App;