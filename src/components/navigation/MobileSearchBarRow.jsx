import React from 'react';
import SearchBar from './SearchBar';

// Renders a full-width search bar row for mobile screens
const MobileSearchBarRow = () => {
  return (
    <div className="mobile-search-row" role="search" aria-label="Global search">
      <SearchBar variant="mobile" />
    </div>
  );
};

export default MobileSearchBarRow;
