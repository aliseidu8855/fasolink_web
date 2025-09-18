import React from 'react';
import Spinner from './Spinner';

export default function LoadingButton({ loading, children, disabled, spinnerLabel = 'Loading', ...props }) {
  return (
    <button {...props} disabled={disabled || loading}>
      {loading ? <Spinner size={14} stroke={2} label={spinnerLabel} /> : children}
    </button>
  );
}
