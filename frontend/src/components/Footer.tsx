import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, User, ShoppingBag, Search } from "lucide-react";

type UserType = "Owner" | "Shopper"; // 👈 define roles

const Footer: React.FC = () => {
  const location = useLocation();
  const userType: UserType = "Shopper";

  const isStoreSearch = location.pathname === "/shopSearch";
  const isItemSearch = location.pathname === "/itemSearch";

  let searchLink = {
    to: "/shopSearch",
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
      to: "/shopSearch",
      label: "Store Search",
      icon: <ShoppingBag size="1.5rem" />,
    };
  }

  return (
    <footer className="fixed bottom-0 left-0 w-full bg-transparent z-50 flex justify-center">
      <div className="relative w-full bg-white rounded-t-3xl shadow-[0_-4px_12px_rgba(0,0,0,0.05)] flex justify-between items-center px-10 pt-4 pb-6">
        {/* Left side content (only for shoppers) */}
        {userType === "Shopper" && (
          <Link
            to={searchLink.to}
            className={`flex flex-col items-center text-sm gap-1 transition-all ${isStoreSearch || isItemSearch ? "text-gray-800" : "text-gray-400 hover:text-gray-800"}`}
          >
            {searchLink.icon}
            <span>{searchLink.label}</span>
          </Link>
        )}

        {/* Floating Home Button */}
        <Link
          to={userType === "Owner" ? "/shop/1" : "/"}
          className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-900 w-20 h-20 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
        >
          <Home size="1.75rem" className="text-amber-400" />
        </Link>

        {/* Profile Icon (always visible on right) */}
        <Link
          to="/profile"
          className={`flex flex-col items-center text-sm gap-1 transition-all ml-auto ${location.pathname === "/profile" ? "text-gray-800" : "text-gray-400 hover:text-gray-800"}`}
        >
          <User size="1.5rem" />
          <span>Profile</span>
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
