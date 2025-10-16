import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, ShoppingBag, Search, User } from "lucide-react";
import "../index.css";

const Footer: React.FC = () => {
  const location = useLocation();

  // Detect which search page you're currently on
  const isStoreSearch = location.pathname === "/storeSearch";
  const isItemSearch = location.pathname === "/itemSearch";

  // Default to store search if on any other page
  let searchLink = {
    to: "/storeSearch",
    label: "Store Search",
    icon: <ShoppingBag size="1.5rem" />,
  };

  // If currently on store search, show link to item search
  if (isStoreSearch) {
    searchLink = {
      to: "/itemSearch",
      label: "Item Search",
      icon: <Search size="1.5rem" />,
    };
  }

  // If currently on item search, show link to store search
  else if (isItemSearch) {
    searchLink = {
      to: "/storeSearch",
      label: "Store Search",
      icon: <ShoppingBag size="1.5rem" />,
    };
  }

  return (
    <footer className="footer-nav">
      {/* Dynamic Search Toggle */}
      <Link
        to={searchLink.to}
        className={`footer-link ${
          isStoreSearch || isItemSearch ? "active" : ""
        }`}
      >
        {searchLink.icon}
        <p>{searchLink.label}</p>
      </Link>

      {/* Home */}
      <Link to="/" className="footer-center-button">
        <Home size="1.5rem" />
      </Link>

      {/* Profile */}
      <Link
        to="/profile"
        className={`footer-link ${
          location.pathname === "/profile" ? "active" : ""
        }`}
      >
        <User size="1.5rem" />
        <p>Profile</p>
      </Link>
    </footer>
  );
};

export default Footer;
