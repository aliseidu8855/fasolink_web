import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import AuthForms from '../pages/AuthForms';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, captureIntendedPath } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { openModal } = useModal();

  useEffect(() => {
    if (!isAuthenticated) {
      // Capture the path the user attempted to visit
      captureIntendedPath(location.pathname + location.search + location.hash);
      // If not authenticated, open the login / register modal
      openModal(<AuthForms />);
      // And redirect the user back to the homepage
      navigate('/');
    }
  }, [isAuthenticated, navigate, openModal, captureIntendedPath, location]);

  // If authenticated, render the child component (the protected page)
  return isAuthenticated ? children : null;
};

export default ProtectedRoute;