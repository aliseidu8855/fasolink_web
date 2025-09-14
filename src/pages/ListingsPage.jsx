import React from 'react';
import { useSearchParams } from 'react-router-dom';
import FilterSidebar from '../components/FilterSidebar';
import InfiniteListingsGrid from '../components/InfiniteListingsGrid';
import SortBar from '../components/SortBar';
import { useInfiniteListings } from '../hooks/useInfiniteListings';
import './ListingsPage.css';

const ListingsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentFilters = Object.fromEntries([...searchParams]);

  // Build base params from URL filters + ordering
  const { listings, loading, hasMore, loadMore } = useInfiniteListings({ baseParams: currentFilters });

  const handleFilterChange = (newFilters) => {
    const cleanedFilters = Object.entries(newFilters).reduce((acc, [k, v]) => {
      if (v !== '' && v != null) acc[k] = v;
      return acc;
    }, {});
    setSearchParams(cleanedFilters);
  };

  const handleOrderingChange = (ordering) => {
    setSearchParams(prev => {
      const obj = Object.fromEntries([...prev]);
      if (ordering) obj.ordering = ordering; else delete obj.ordering;
      return obj;
    });
  };

  return (
    <div className="container listings-page-container">
      <aside className="filters-sidebar">
        <FilterSidebar onFilterChange={handleFilterChange} />
      </aside>
      <main className="listings-grid-area">
        <SortBar onChange={handleOrderingChange} initialOrdering={currentFilters.ordering || '-created_at'} />
        <InfiniteListingsGrid listings={listings} loading={loading} hasMore={hasMore} onLoadMore={loadMore} />
      </main>
    </div>
  );
};

export default ListingsPage;