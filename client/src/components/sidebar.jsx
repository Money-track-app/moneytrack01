import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Close sidebar when screen resizes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsOpen(false); // Sidebar is always visible on desktop anyway
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
     <button className="toggle-btn" onClick={() => setIsOpen(!isOpen)}>
  &#9776; {/* Unicode hamburger menu */}
</button>



      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <h2>MoneyTrack</h2>
        <ul>
          <li><Link to="/dashboard">📊 Dashboard</Link></li>
          <li><Link to="/add-transaction">➕ Add Transaction</Link></li>
          <li><Link to="/reports">📈 Reports</Link></li>
          <li><Link to="/categories">📂 Categories</Link></li>
          <li><Link to="/recurring">🔁 Recurring</Link></li>
          <li><Link to="/settings">⚙️ Settings</Link></li>
        </ul>
      </aside>
    </>
  );
};

export default Sidebar;


