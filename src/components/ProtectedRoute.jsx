import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import AuthForms from '../pages/AuthForms';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { openModal } = useModal();

  useEffect(() => {
    if (!isAuthenticated) {
      // If not authenticated, open the login modal
      openModal(<AuthForms />);
      // And redirect the user back to the homepage
      navigate('/');
    }
  }, [isAuthenticated, navigate, openModal]);

  // If authenticated, render the child component (the protected page)
  return isAuthenticated ? children : null;
};

export default ProtectedRoute;