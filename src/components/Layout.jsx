import React from 'react';
import { Outlet, useLocation } from 'react-router-dom'; // Import useLocation
// Replaced legacy Header with new NavBar implementation
import Header from './Header';
import { useScroll } from '../hooks/useScroll';
import NavBar from './navigation/NavBar';
import Footer from './Footer';
import Modal from './Modal';
import { useModal } from '../context/ModalContext';

const Layout = () => {
  const { isModalOpen, closeModal, modalContent } = useModal();
  const location = useLocation(); // Get the current location

  // The messages page handles its own layout, so we don't apply padding
  const applyMainPadding = !location.pathname.startsWith('/messages');

  const { isScrolled } = useScroll();
  return (
    <div>
      <a href="#main-content" className="skip-link">Skip to content</a>
      <NavBar isScrolled={isScrolled} />
      <main id="main-content" style={{ paddingTop: applyMainPadding ? '80px' : '0' }}>
        <Outlet />
      </main>
      <Footer />
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {modalContent}
      </Modal>
    </div>
  );
};

export default Layout;