import React from 'react';
import Hero from '../components/Hero';
import ListingRow from '../components/ListingRow';
import HowItWorks from '../components/home/HowItWorks';
import CategoryChips from '../components/home/CategoryChips';
import './HomePage.css';

const HomePage = () => {
  return (
    <>
      <Hero />
      <main className="home-main" id="main-content">
        <div className="home-section">
          <CategoryChips />
        </div>
        <div className="home-section">
          <ListingRow
            title="Recent Listings"
            apiParams={{ ordering: '-created_at' }}
            compact
            pageSize={12}
          />
        </div>
        <div className="home-section">
          <HowItWorks />
        </div>
        {/** CTA banner intentionally removed. Re-enable by importing CTABanner and adding here. */}
      </main>
    </>
  );
};

export default HomePage;