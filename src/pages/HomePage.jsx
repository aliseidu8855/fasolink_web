import React from 'react';
import Hero from '../components/Hero';
import ListingRow from '../components/ListingRow';
import CategoryStrip from '../components/home/CategoryStrip';
import HowItWorks from '../components/home/HowItWorks';
import CTABanner from '../components/home/CTABanner';

const HomePage = () => {
  return (
    <>
      <Hero />
      <CategoryStrip />
      <ListingRow
        title="Featured Listings"
        subtitle="Curated picks and hot deals"
        apiParams={{ is_featured: true, ordering: '-created_at' }}
      />
      <HowItWorks />
      <ListingRow
        title="Recent Listings"
        subtitle="Freshly added by the community"
        apiParams={{ ordering: '-created_at' }}
        compact
      />
      <CTABanner />
    </>
  );
};

export default HomePage;