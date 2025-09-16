import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ListingsPage from './pages/ListingsPage';
import ListingDetailPage from './pages/ListingDetailPage';
import CreateListingPage from './pages/CreateListingPage';
import BrowsePage from './pages/BrowsePage';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardPage from './pages/DashboardPage';
import MessagesPage from './pages/MessagesPage';
import { MessagingProvider } from './context/MessagingContext';
import HelpPage from './pages/HelpPage';
import SettingsPage from './pages/SettingsPage';
import AuthPage from './pages/AuthPage';

function App() {
  return (
    <Router>
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
    </Router>
  );
}

export default App;