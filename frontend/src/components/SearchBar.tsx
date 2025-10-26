import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

interface SearchBarProps {
  onSearch: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [query, setQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  // Initialize query from URL params
  useEffect(() => {
    const urlQuery = searchParams.get("q");
    if (urlQuery) {
      setQuery(urlQuery);
    }
  }, [searchParams]);

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
