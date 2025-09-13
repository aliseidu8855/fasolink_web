import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import Modal from './Modal'; // Import Modal
import { useModal } from '../context/ModalContext'; // Import useModal hook

const Layout = () => {
  const { isModalOpen, closeModal, modalContent } = useModal(); // Get modal state and functions

  return (
    <div>
      <Header />
      <main>
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