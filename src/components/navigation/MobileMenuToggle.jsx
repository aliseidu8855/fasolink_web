import React from 'react';
import { IoMenuOutline } from 'react-icons/io5';

// Provides a button to open the mobile navigation drawer. Accepts open state for aria attributes.
const MobileMenuToggle = ({ onOpen, isOpen }) => {
  return (
    <button
      className="mobile-menu-toggle"
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
      aria-haspopup="dialog"
      aria-expanded={isOpen ? 'true' : 'false'}
      onClick={onOpen}
    >
      <IoMenuOutline size={26} />
    </button>
  );
};

export default MobileMenuToggle;