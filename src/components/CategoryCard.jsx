import React from 'react';
import './CategoryCard.css';

// A simple mapping for icon colors based on the design
const iconColors = {
  'Electronics': '#fef3c7', // Yellow
  'Cars': '#fee2e2', // Red
  'Fashion': '#d1fae5', // Green
  'Real Estate': '#fef3c7', // Yellow
  'Jobs': '#fee2e2', // Red
  'Services': '#d1fae5', // Green
};

const CategoryCard = ({ name, adCount = 0 }) => {
  const backgroundColor = iconColors[name] || '#f3f4f6'; // Default gray

  return (
    <div className="category-card">
      <div className="icon-container" style={{ backgroundColor }}>
        {/* Placeholder for a real icon */}
        <span>{name.charAt(0)}</span>
      </div>
      <h3 className="category-name">{name}</h3>
      <p className="ad-count">{adCount} ads</p>
    </div>
  );
};

export default CategoryCard;