import React from 'react';
import { Outlet, useLocation } from 'react-router-dom'; // Import useLocation
// Replaced legacy Header with new NavBar implementation
import NavBar from './navigation/NavBar';
import Footer from './Footer';
import MobileBottomNav from './navigation/MobileBottomNav';
import InstallPWA from './pwa/InstallPWA';
import PWAUpdatePrompt from './pwa/PWAUpdatePrompt';
import IOSAddToHomeBanner from './pwa/IOSAddToHomeBanner';
import Modal from './Modal';
import { useModal } from '../context/ModalContext';

const Layout = () => {
  const { isModalOpen, closeModal, modalContent } = useModal();
  const location = useLocation(); // Get the current location

  // The messages page handles its own layout, so we don't apply padding
  const applyMainPadding = !location.pathname.startsWith('/messages');

  return (
    <div>
      <a href="#main-content" className="skip-link">Skip to content</a>
      <NavBar />
      <main id="main-content" style={{ paddingTop: applyMainPadding ? '58px' : '0', paddingBottom: '64px' }}>
        <Outlet />
      </main>
  <Footer />
  <MobileBottomNav />
      <InstallPWA />
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {modalContent}
      </Modal>
      <PWAUpdatePrompt />
      <IOSAddToHomeBanner />
    </div>
  );
};

export default Layout;