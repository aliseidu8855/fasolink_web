import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NavBrand from './NavBrand';
import NavActions from './NavActions';
import CategorySearchBar from './CategorySearchBar';
import SearchBar from './SearchBar';
import './NavBar.css';

// High-level orchestration component (static header; no scroll compaction)
const NavBar = () => {
  const { isAuthenticated } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  // Add subtle elevation when page is scrolled
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 2);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <header className={`nav-root ${scrolled ? 'is-scrolled' : ''} ${isHome ? 'is-home' : 'is-inner'}`} role="banner">      
      <div className="nav-inner container">
        <div className="nav-left">
          <div className="nav-brand-wrap">
            <NavBrand />
          </div>
          {/* Desktop: rich category+search; Mobile: compact global search */}
          <div className="desktop-only" style={{ flex: 1 }}>
            <CategorySearchBar />
          </div>
          <div className="mobile-only" style={{ flex: 1 }}>
            <SearchBar variant="mobile" />
          </div>
        </div>
        <NavActions isAuthenticated={isAuthenticated} />
      </div>
      {/* MobileDrawer removed to simplify mobile UI (hamburger hidden) */}
    </header>
  );
};

export default NavBar;