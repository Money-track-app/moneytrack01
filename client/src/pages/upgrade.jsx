import React from 'react';
import './upgrade.css';

export default function Upgrade() {
  return (
    <div className="upgrade-page">
      <h1>Go Premium 🚀</h1>

      <div className="features-list">
        <div className="feature-card">
          <h3>🔒 Advanced Security</h3>
          <p>Enable 2FA and encrypted backups for your transactions.</p>
        </div>
        <div className="feature-card">
          <h3>📊 Detailed Insights</h3>
          <p>Unlock additional reports, trends, and analytics.</p>
        </div>
        <div className="feature-card">
          <h3>☁️ Cloud Sync</h3>
          <p>Access your data across multiple devices in real-time.</p>
        </div>
        <div className="feature-card">
          <h3>🧾 Receipt Scanner</h3>
          <p>Scan and auto-log receipts using AI.</p>
        </div>
        <div className="feature-card">
          <h3>👤 Priority Support</h3>
          <p>Get dedicated customer support 24/7.</p>
        </div>
      </div>

      <button className="buy-button">Buy Premium - $4.99/month</button>
    </div>
  );
}
