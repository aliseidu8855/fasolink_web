import React from 'react';
import { IoClose } from 'react-icons/io5';
import './Modal.css';

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-content">
        <button className="modal-close-button" onClick={onClose}>
          <IoClose size={24} />
        </button>
        {children}
      </div>
    </>
  );
};

export default Modal;