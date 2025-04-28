import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Auto-close sidebar if screen is resized to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <button
        className={`toggle-btn ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        ☰
      </button>

      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <h2>MoneyTrack</h2>
        <ul>
          <li><Link to="/dashboard">📊 Dashboard</Link></li>
          <li><Link to="/add-transaction">➕ Add Transaction</Link></li>
          <li><Link to="/reports">📈 Reports</Link></li>
          <li><Link to="/categories">📂 Categories</Link></li>
          <li><Link to="/receipts">🧾 Receipts</Link></li>
          <li><Link to="/scheduled">🔁 Scheduled</Link></li>
          <li><Link to="/settings">⚙️ Settings</Link></li>
        </ul>
      </aside>
    </>
  );
};

export default Sidebar;




