import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import "../index.css";

const SearchBar: React.FC = () => {
  const [query, setQuery] = useState("");
  const location = useLocation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Search query:", query);
  };

  // Determine placeholder based on current path
  let placeholder = "Search...";
  if (location.pathname === "/storeSearch") {
    placeholder = "Search for stores...";
  } else if (location.pathname === "/itemSearch") {
    placeholder = "Search for items...";
  }

  return (
    <div className="blue-container">
      <form className="search-bar" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="search-input"
        />
        <button type="submit" className="search-button">
          Search
        </button>
      </form>
    </div>
  );
};

export default SearchBar;
