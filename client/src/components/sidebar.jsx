// client/src/components/Sidebar.jsx
import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Auto-close sidebar if resized to desktop width
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
        aria-label="Toggle menu"
      >
        ☰
      </button>

      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <img src="/Logo2.jpg" alt="MoneyTrack Logo" className="sidebar-logo" />
          <span className="sidebar-title">MoneyTrack</span>
        </div>

        <ul className="menu">
          <li>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `menu-item ${isActive ? "active-link" : ""}`
              }
            >
              <span className="icon">📊</span>
              <span className="label">Dashboard</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/add-transaction"
              className={({ isActive }) =>
                `menu-item ${isActive ? "active-link" : ""}`
              }
            >
              <span className="icon">➕</span>
              <span className="label">Add Transaction</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/reports"
              className={({ isActive }) =>
                `menu-item ${isActive ? "active-link" : ""}`
              }
            >
              <span className="icon">📈</span>
              <span className="label">Reports</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/categories"
              className={({ isActive }) =>
                `menu-item ${isActive ? "active-link" : ""}`
              }
            >
              <span className="icon">📂</span>
              <span className="label">Categories</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/receipts"
              className={({ isActive }) =>
                `menu-item ${isActive ? "active-link" : ""}`
              }
            >
              <span className="icon">🧾</span>
              <span className="label">Receipts</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/scheduled"
              className={({ isActive }) =>
                `menu-item ${isActive ? "active-link" : ""}`
              }
            >
              <span className="icon">🔁</span>
              <span className="label">Scheduled</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `menu-item ${isActive ? "active-link" : ""}`
              }
            >
              <span className="icon">⚙️</span>
              <span className="label">Settings</span>
            </NavLink>
          </li>
        </ul>
      </aside>
    </>
  );
};

export default Sidebar;
