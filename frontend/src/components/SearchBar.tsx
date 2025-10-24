import React, { useState } from "react";
import { useLocation } from "react-router-dom";

const SearchBar: React.FC = () => {
  const [query, setQuery] = useState("");
  const location = useLocation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Search query:", query);
  };

  // Determine placeholder dynamically
  const placeholder =
    location.pathname === "/storeSearch"
      ? "Search for stores..."
      : location.pathname === "/itemSearch"
      ? "Search for items..."
      : "Search...";

  return (
    <div className="flex justify-center w-full px-4 py-4">
      <form
        onSubmit={handleSubmit}
        className="flex items-center w-[90%] max-w-2xl bg-slate-100 rounded-full shadow-md px-4 py-2"
      >
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 bg-transparent border-none outline-none text-slate-800 placeholder:text-slate-400 placeholder:italic text-base px-3 py-2"
        />
        <button
          type="submit"
          className="bg-blue-900 text-white rounded-full px-6 py-2 text-sm font-medium hover:bg-blue-800 transition-colors duration-200"
        >
          Search
        </button>
      </form>
    </div>
  );
};

export default SearchBar;
