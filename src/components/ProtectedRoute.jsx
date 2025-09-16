import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// Auth now handled via dedicated /auth route instead of modal

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, captureIntendedPath } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      captureIntendedPath(location.pathname + location.search + location.hash);
      navigate('/auth?mode=login');
    }
  }, [isAuthenticated, navigate, captureIntendedPath, location]);

  // If authenticated, render the child component (the protected page)
  return isAuthenticated ? children : null;
};

export default ProtectedRoute;