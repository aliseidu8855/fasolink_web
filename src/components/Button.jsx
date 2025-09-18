import React from 'react';
import './Button.css';
import Spinner from './ui/Spinner';

// Supported variants: 'primary' | 'secondary' | 'ghost' | 'success' | 'neutral'
// Sizes: 'sm' | 'md'
const Button = ({ children, onClick, variant = 'primary', size = 'md', type = 'button', className = '', disabled = false, loading = false, fullWidth = false, ...rest }) => {
  const classes = [
    'btn',
    `btn-${variant}`,
    size === 'sm' ? 'btn-sm' : 'btn-md',
    fullWidth ? 'btn-block' : '',
    className
  ].filter(Boolean).join(' ');
  const isDisabled = disabled || loading;
  return (
    <button type={type} className={classes} onClick={onClick} disabled={isDisabled} {...rest}>
      {loading && <Spinner size={14} />}
      {children}
    </button>
  );
};

export default Button;