import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { apiGet } from "../lib/api";
import type { Shop } from "../pages/shopSearch"; // adjust as needed

interface SearchBarProps {
  onSearch: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Shop[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch suggestions as user types
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.trim().length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        const endpoint =
          location.pathname === "/storeSearch"
            ? "/search/shops"
            : location.pathname === "/itemSearch"
            ? "/search/items"
            : "/search/items";

        const params = new URLSearchParams({
          query,
          sortBy: "name_asc",
          limit: "5",
        });

        const res = await apiGet<{ data: Shop[] }>(`${endpoint}?${params}`);
        setSuggestions(res.data || []);
        setShowSuggestions(true);
      } catch (err) {
        console.error("Error fetching suggestions:", err);
        setSuggestions([]);
      }
    };

    const delay = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(delay);
  }, [query, location.pathname]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
    setShowSuggestions(false);
  };

  const handleSelectSuggestion = (name: string) => {
    setQuery(name);
    onSearch(name);
    setShowSuggestions(false);
  };

  const placeholder =
    location.pathname === "/storeSearch"
      ? "Search for stores..."
      : location.pathname === "/itemSearch"
      ? "Search for items..."
      : "Search...";

  return (
    <div className="relative flex justify-center w-full px-4 py-4" ref={dropdownRef}>
      <form
        onSubmit={handleSubmit}
        className="flex items-center w-[90%] max-w-2xl bg-slate-100 rounded-full shadow-md px-4 py-2 relative"
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

        {/* Dropdown suggestions */}
        {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 w-full bg-white border border-gray-300 rounded-b-xl shadow-lg max-h-64 overflow-y-auto z-50">
          {suggestions.map((shop) => (
            <div
              key={shop._id}
              onClick={() => handleSelectSuggestion(shop.name)}
              className="px-4 py-3 cursor-pointer hover:bg-blue-50 hover:text-blue-900 transition-colors duration-150 flex items-center gap-2"
            >
              <span className="truncate">{shop.name}</span>
            </div>
          ))}
        </div>
      )}


      </form>
    </div>
  );
};

export default SearchBar;
