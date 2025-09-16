import React from 'react';
import './globalLoader.css';

// Simple unified loader: centered spinner + subtle skeleton pulse bar at top.
export default function GlobalLoader(){
  return (
    <div className="global-loader" role="status" aria-live="polite" aria-label="Loading">
      <div className="gl-bar" />
      <div className="gl-spinner" />
    </div>
  );
}
