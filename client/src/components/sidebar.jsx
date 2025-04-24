import React from "react";
import { Link } from "react-router-dom";
import "./Sidebar.css"; // We'll style it separately

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2>MoneyTrack</h2>
      <ul>
        <li><Link to="/dashboard">📊 Dashboard</Link></li>
        <li><Link to="/add-transaction">➕ Add Transaction</Link></li>
        <li><Link to="/reports">📈 Reports</Link></li>
        <li><Link to="/categories">📂 Categories</Link></li>
        <li><Link to="/recurring">🔁 Recurring</Link></li>
        <li><Link to="/settings">⚙️ Settings</Link></li>
      </ul>
    </div>
  );
};

export default Sidebar;
