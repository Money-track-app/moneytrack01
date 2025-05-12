import React, { useContext, useEffect, useState } from "react";
import "./header.css";
import { FiBell, FiSearch } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { SearchContext } from "../context/searchcontext";

const Header = () => {
  const { searchTerm, setSearchTerm } = useContext(SearchContext);
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/notifications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("❌ Failed to fetch notifications:", errorData.message);
        setNotifications([]); // fallback to empty
        return;
      }

      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Failed to fetch notifications:", err);
      setNotifications([]); // fallback
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Searching for:", searchTerm);
  };

  const markAsRead = (index) => {
    const updated = [...notifications];
    updated[index].read = true;
    setNotifications(updated);
  };

  const unreadCount = Array.isArray(notifications)
    ? notifications.filter((n) => !n.read).length
    : 0;

  return (
    <header className="app-header">
      {/* Search Bar */}
      <form className="search-bar" onSubmit={handleSearch}>
        <FiSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </form>

      {/* Notification & Upgrade */}
      <div className="header-actions">
        <div className="notification-wrapper">
          <button
            className="notification-btn"
            aria-label="Notifications"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <FiBell size={20} />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </button>

          {showDropdown && (
            <div className="notification-dropdown">
              <h4>Notifications</h4>
              <ul>
                {notifications.length === 0 && (
                  <li className="notification-empty">No notifications</li>
                )}
                {notifications.map((notif, index) => (
                  <li key={index} className={notif.read ? "read" : "unread"}>
                    {notif.message}
                    {!notif.read && (
                      <button onClick={() => markAsRead(index)}>Dismiss</button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <button className="upgrade-btn" onClick={() => navigate("/upgrade")}>
          Upgrade
        </button>
      </div>
    </header>
  );
};

export default Header;
