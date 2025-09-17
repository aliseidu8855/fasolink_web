import React from 'react';
import './Button.css';

// Supported variants: 'primary' | 'secondary' | 'ghost' | 'success' | 'neutral'
const Button = ({ children, onClick, variant = 'primary', type = 'button', className = '' }) => {
  const classes = `btn btn-${variant} ${className}`.trim();
  return (
    <button type={type} className={classes} onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;