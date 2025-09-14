import React from 'react';
import { useAuth } from '../../context/AuthContext';
import NavBrand from './NavBrand';
import NavActions from './NavActions';
import SearchBar from './SearchBar';
import CategoryMenu from './CategoryMenu';
import './NavBar.css';

// High-level orchestration component
const NavBar = ({ isScrolled }) => {
  const { isAuthenticated } = useAuth();
  return (
    <header className={`nav-root ${isScrolled ? 'scrolled' : ''}`}>      
      <div className="nav-inner container">
        <div className="nav-left">
          <NavBrand />
          <CategoryMenu />
          <SearchBar />
        </div>
        <NavActions isAuthenticated={isAuthenticated} />
      </div>
      {/* MobileDrawer removed to simplify mobile UI (hamburger hidden) */}
    </header>
  );
};

export default NavBar;