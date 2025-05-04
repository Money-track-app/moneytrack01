import React, { useContext } from "react";
import "./header.css";
import { FiBell, FiSearch } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { SearchContext } from "../context/searchcontext";

const Header = () => {
  const { searchTerm, setSearchTerm } = useContext(SearchContext);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Searching for:", searchTerm);
  };

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
        <button className="notification-btn" aria-label="Notifications">
          <FiBell size={20} />
        </button>
        <button className="upgrade-btn" onClick={() => navigate('/upgrade')}>
          Upgrade
        </button>
      </div>
    </header>
  );
};

export default Header;
