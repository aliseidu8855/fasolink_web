import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useScroll } from '../hooks/useScroll';
import GuestHeader from './GuestHeader';
import LoggedInHeader from './LoggedInHeader';

const Header = () => {
  const { isAuthenticated } = useAuth();
  const { isScrolled } = useScroll();

  return isAuthenticated 
    ? <LoggedInHeader isScrolled={isScrolled} /> 
    : <GuestHeader isScrolled={isScrolled} />;
};

export default Header;