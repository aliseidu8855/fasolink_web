import React from 'react';

const DashboardStatCard = ({ label, value, tone = 'default' }) => {
  return (
    <div className={`dash-stat dash-stat-${tone}`}>
      <div className="dash-stat-value">{value}</div>
      <div className="dash-stat-label">{label}</div>
    </div>
  );
};

export default DashboardStatCard;
