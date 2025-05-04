import React from 'react';
import './support.css'; // Optional CSS file

export default function Support() {
  return (
    <div className="support-page">
      <h1>Help & Support</h1>
      <p>If you have any questions, issues, or need help using MoneyTrack, you're in the right place.</p>

      <section>
        <h2>Frequently Asked Questions</h2>
        <ul>
          <li><strong>How do I add a transaction?</strong> – Go to the Add Transaction page and fill in the form.</li>
          <li><strong>How do I categorize my expenses?</strong> – Use the Categories section to view or manage categories.</li>
          <li><strong>What is Premium?</strong> – Premium unlocks advanced features like reports export and receipt uploads.</li>
        </ul>
      </section>

      <section>
        <h2>Contact Support</h2>
        <p>Email us at <a href="mailto:support@moneytrack.com">support@moneytrack.com</a> for assistance.</p>
      </section>
    </div>
  );
}
