import React from 'react';
import './upgrade.css';
import { FaInfinity, FaFileExport, FaListUl, FaCalendarAlt, FaGlobe, FaHeadset } from 'react-icons/fa';

export default function Upgrade() {
  return (
    <div className="upgrade-page">
      <h1 className="upgrade-title">Unlock Premium 🚀</h1>

      <div className="features-list">
        <div className="feature-card">
          <FaInfinity className="feature-icon" />
          <h3>Unlimited Transactions</h3>
          <p>Track endless income and expense entries without restrictions.</p>
        </div>
        <div className="feature-card">
          <FaFileExport className="feature-icon" />
          <h3>Unlimited Exports</h3>
          <p>Download your data anytime as PDF or CSV files.</p>
        </div>
        <div className="feature-card">
          <FaListUl className="feature-icon" />
          <h3>Unlimited Categories</h3>
          <p>Create and manage unlimited custom categories.</p>
        </div>
        <div className="feature-card">
          <FaCalendarAlt className="feature-icon" />
          <h3>Unlimited Scheduled Transactions</h3>
          <p>Set up unlimited recurring payments or deposits.</p>
        </div>
        <div className="feature-card">
          <FaGlobe className="feature-icon" />
          <h3>Multi-Currency Support</h3>
          <p>Choose your preferred currency from multiple options.</p>
        </div>
        <div className="feature-card">
          <FaHeadset className="feature-icon" />
          <h3>24/7 Priority Support</h3>
          <p>Get fast, dedicated help whenever you need it.</p>
        </div>
      </div>

      <button className="buy-button">Buy Premium - $4.99/month</button>
    </div>
  );
}
