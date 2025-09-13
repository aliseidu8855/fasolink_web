import React from 'react';
import './Button.css'; // We'll create this CSS file next

const Button = ({ children, onClick, variant = 'primary', type = 'button' }) => {
  // variant can be 'primary', 'secondary', 'success', 'neutral'
  const className = `btn btn-${variant}`;
  
  return (
    <button type={type} className={className} onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;