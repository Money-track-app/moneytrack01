// client/src/components/footer.jsx
import React from 'react';
import './footer.css';

const Footer = () => {
  return (
    <footer className="app-footer">
      <p>&copy; {new Date().getFullYear()} MoneyTrack • All rights reserved.</p>
      <div className="footer-links">
        <a href="/support">Help & Support</a>
        <a href="/privacy">Privacy</a>
        <a href="/terms">Terms</a>
      </div>
    </footer>
  );
};

export default Footer;
