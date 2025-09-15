import React from 'react';

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
  <span style={{ fontWeight:600, fontSize:'var(--fs-sm)' }}>{isOpen ? '×' : '≡'}</span>
    </button>
  );
};

export default MobileMenuToggle;