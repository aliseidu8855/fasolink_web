import React from 'react';
import './Modal.css';

const Modal = ({ isOpen, onClose, children, contentClassName = '' }) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
  <div className={`modal-content ${contentClassName}`.trim()}>
        <button className="modal-close-button" onClick={onClose} aria-label="Close">
          <span style={{fontSize:'20px', lineHeight:1}}>×</span>
        </button>
        {children}
      </div>
    </>
  );
};

export default Modal;