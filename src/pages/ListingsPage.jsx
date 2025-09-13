import React from 'react';
import { useSearchParams } from 'react-router-dom';
import FilterSidebar from '../components/FilterSidebar';
import ListingsGrid from '../components/ListingsGrid';
import './ListingsPage.css';

const ListingsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Convert searchParams to a plain object for the components
  const currentFilters = Object.fromEntries([...searchParams]);

  const handleFilterChange = (newFilters) => {
    // Clean up filters before setting them to avoid empty params in URL
    const cleanedFilters = Object.fromEntries(
      Object.entries(newFilters).filter(([, v]) => v !== '')
    );
    setSearchParams(cleanedFilters);
  };

  return (
    <div className="container listings-page-container">
      <aside className="filters-sidebar">
        <FilterSidebar onFilterChange={handleFilterChange} />
      </aside>
      <main className="listings-grid-area">
        <ListingsGrid filters={currentFilters} />
      </main>
    </div>
  );
};

export default ListingsPage;