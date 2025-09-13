import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="main-footer">
      <div className="container footer-grid">
        <div className="footer-about">
          <h3 className="footer-logo">FasoLink</h3>
          <p>Your trusted marketplace for Burkina Faso.</p>
          {/* Add social icons here later */}
        </div>
        <div className="footer-links">
          <h4 className="footer-heading">Quick Links</h4>
          <ul>
            <li><Link to="/categories">Browse Categories</Link></li>
            <li><Link to="/post-ad">Post an Ad</Link></li>
            <li><Link to="/safety">Safety Tips</Link></li>
            <li><Link to="/help">Help Center</Link></li>
          </ul>
        </div>
        <div className="footer-links">
          <h4 className="footer-heading">Categories</h4>
          <ul>
            <li><Link to="/listings?category=electronics">Electronics</Link></li>
            <li><Link to="/listings?category=cars">Cars</Link></li>
            <li><Link to="/listings?category=real-estate">Real Estate</Link></li>
            <li><Link to="/listings?category=fashion">Fashion</Link></li>
          </ul>
        </div>
        <div className="footer-contact">
          <h4 className="footer-heading">Contact</h4>
          <p>+226 XX XX XX XX</p>
          <p>support@fasolink.bf</p>
          <p>Ouagadougou, Burkina Faso</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} FasoLink. All rights reserved. Made with ♥ for Burkina Faso</p>
      </div>
    </footer>
  );
};

export default Footer;