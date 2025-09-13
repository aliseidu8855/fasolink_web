import React from 'react';
import Hero from '../components/Hero';
import CategoryList from '../components/CategoryList';
import ListingRow from '../components/ListingRow';

const HomePage = () => {
  return (
    <>
      <Hero />
      <CategoryList />
      
      {/* For now, "Featured" will just be the latest listings.
          This can be updated later if the backend adds a 'is_featured' flag. */}
      <ListingRow 
        title="Featured Listings" 
        apiParams={{ ordering: '-created_at' }} 
      />

      <ListingRow 
        title="Recent Listings" 
        apiParams={{ ordering: '-created_at' }} 
      />
    </>
  );
};

export default HomePage;