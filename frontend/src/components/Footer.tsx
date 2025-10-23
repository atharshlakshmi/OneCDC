import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, ShoppingBag, Search, User } from "lucide-react";

const Footer: React.FC = () => {
  const location = useLocation();

  const isStoreSearch = location.pathname === "/storeSearch";
  const isItemSearch = location.pathname === "/itemSearch";

  // Determine which search toggle to show
  let searchLink = {
    to: "/storeSearch",
    label: "Store Search",
    icon: <ShoppingBag size="1.5rem" />,
  };

  if (isStoreSearch) {
    searchLink = {
      to: "/itemSearch",
      label: "Item Search",
      icon: <Search size="1.5rem" />,
    };
  } else if (isItemSearch) {
    searchLink = {
      to: "/storeSearch",
      label: "Store Search",
      icon: <ShoppingBag size="1.5rem" />,
    };
  }

  return (
    <footer className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 flex justify-around items-center h-[12vh] shadow-[0_-4px_12px_rgba(0,0,0,0.05)] z-50">
      {/* Dynamic Search Toggle */}
      <Link
        to={searchLink.to}
        className={`flex flex-col items-center text-gray-500 text-sm gap-1 transition-colors duration-150 ${
          isStoreSearch || isItemSearch ? "text-amber-400" : "hover:text-amber-400"
        }`}
      >
        {searchLink.icon}
        <p>{searchLink.label}</p>
      </Link>

      {/* Home Button */}
      <Link
        to="/"
        className="bg-gray-900 text-amber-400 rounded-full w-14 h-14 flex items-center justify-center -mt-7 shadow-md hover:scale-105 transition-transform"
      >
        <Home size="1.5rem" />
      </Link>

      {/* Profile Link */}
      <Link
        to="/profile"
        className={`flex flex-col items-center text-gray-500 text-sm gap-1 transition-colors duration-150 ${
          location.pathname === "/profile"
            ? "text-amber-400"
            : "hover:text-amber-400"
        }`}
      >
        <User size="1.5rem" />
        <p>Profile</p>
      </Link>
    </footer>
  );
};

export default Footer;
