<<<<<<< HEAD
import React, { useState } from "react";
import { useLocation } from "react-router-dom";
=======
import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { apiGet } from "../lib/api";

// Define interfaces locally to avoid circular dependencies
interface Shop {
  _id: string;
  name: string;
  address: string;
  verifiedByOwner?: boolean;
}

interface ItemSearchResult {
  shopId: string;
  shopName: string;
  shopAddress: string;
  item: {
    _id: string;
    name: string;
  };
}

type SearchSuggestion = Shop | ItemSearchResult;
>>>>>>> origin/lakshmi

interface SearchBarProps {
  onSearch: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [query, setQuery] = useState("");
<<<<<<< HEAD
  const location = useLocation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query); // pass query to parent
  };

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
=======
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isStoreSearch = location.pathname === "/shopSearch";
  const isItemSearch = location.pathname === "/itemSearch";

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
        const endpoint = isStoreSearch 
          ? "/search/shops" 
          : isItemSearch 
          ? "/search/items" 
          : "/search/shops";

        const params = new URLSearchParams({
          query,
          sortBy: "name_asc",
          limit: "5",
        });

        const res = await apiGet<{ data: SearchSuggestion[] }>(`${endpoint}?${params}`);
        setSuggestions(res.data || []);
        setShowSuggestions(true);
      } catch (err) {
        console.error("Error fetching suggestions:", err);
        setSuggestions([]);
      }
    };

    const delay = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(delay);
  }, [query, isStoreSearch, isItemSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
    setShowSuggestions(false);
  };

  const handleSelectSuggestion = (suggestion: SearchSuggestion) => {
    if (isItemSearch && 'item' in suggestion) {
      // For item search, use the item name
      setQuery(suggestion.item.name);
      onSearch(suggestion.item.name);
    } else if (isStoreSearch && 'name' in suggestion) {
      // For shop search, use the shop name
      setQuery(suggestion.name);
      onSearch(suggestion.name);
    }
    setShowSuggestions(false);
  };

  const renderSuggestion = (suggestion: SearchSuggestion) => {
    if (isItemSearch && 'item' in suggestion) {
      // Item search result
      return (
        <div className="flex flex-col">
          <span className="font-medium truncate">{suggestion.item.name}</span>
          <span className="text-xs text-gray-500 truncate">at {suggestion.shopName}</span>
        </div>
      );
    } else if (isStoreSearch && 'name' in suggestion) {
      // Shop search result
      return (
        <div className="flex flex-col">
          <span className="font-medium truncate">{suggestion.name}</span>
          {suggestion.address && (
            <span className="text-xs text-gray-500 truncate">{suggestion.address}</span>
          )}
        </div>
      );
    }
    return null;
  };

  const getSuggestionKey = (suggestion: SearchSuggestion): string => {
    if ('item' in suggestion) {
      return `${suggestion.shopId}-${suggestion.item._id}`;
    } else if ('_id' in suggestion) {
      return suggestion._id;
    }
    return Math.random().toString();
  };

  const placeholder = isStoreSearch
    ? "Search for stores..."
    : isItemSearch
    ? "Search for items..."
    : "Search...";

  return (
    <div className="relative flex justify-center w-full px-4 py-4" ref={dropdownRef}>
      <form
        onSubmit={handleSubmit}
        className="flex items-center w-[90%] max-w-2xl bg-slate-100 rounded-full shadow-md px-4 py-2 relative"
>>>>>>> origin/lakshmi
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
<<<<<<< HEAD
=======

        {/* Dropdown suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 w-full bg-white border border-gray-300 rounded-b-xl shadow-lg max-h-64 overflow-y-auto z-50">
            {suggestions.map((suggestion) => (
              <div
                key={getSuggestionKey(suggestion)}
                onClick={() => handleSelectSuggestion(suggestion)}
                className="px-4 py-3 cursor-pointer hover:bg-blue-50 hover:text-blue-900 transition-colors duration-150"
              >
                {renderSuggestion(suggestion)}
              </div>
            ))}
          </div>
        )}
>>>>>>> origin/lakshmi
      </form>
    </div>
  );
};

<<<<<<< HEAD
export default SearchBar;
=======
export default SearchBar;
>>>>>>> origin/lakshmi
