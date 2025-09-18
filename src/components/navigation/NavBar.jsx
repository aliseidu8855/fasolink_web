import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import NavBrand from './NavBrand';
import NavActions from './NavActions';
import CategorySearchBar from './CategorySearchBar';
import './NavBar.css';

// High-level orchestration component (static header; no scroll compaction)
const NavBar = () => {
  const { isAuthenticated } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  // Add subtle elevation when page is scrolled
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 2);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <header className={`nav-root ${scrolled ? 'is-scrolled' : ''}`} role="banner">      
      <div className="nav-inner container">
        <div className="nav-left">
          <NavBrand />
          <CategorySearchBar />
        </div>
        <NavActions isAuthenticated={isAuthenticated} />
      </div>
      {/* MobileDrawer removed to simplify mobile UI (hamburger hidden) */}
    </header>
  );
};

export default NavBar;