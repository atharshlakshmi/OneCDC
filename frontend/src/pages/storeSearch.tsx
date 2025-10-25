import React, { useState, useEffect } from "react";
import SearchBar from "../components/SearchBar";
import { apiGet } from "../lib/api";
import { BadgeCheck } from "lucide-react";
import { Link } from "react-router-dom";


interface Shop {
  id: string;
  name: string;
  category: string;
  ownerVerified: boolean;
  openNow: boolean;
  address: string;
}

const StoreSearch: React.FC = () => {
  const [results, setResults] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "verified" | "open">("all");
  const [sortBy, setSortBy] = useState<"distance" | "name" | "rating">("distance");
  const [query, setQuery] = useState("");

  // Function to fetch shops
  const fetchShops = async (q: string) => {
    setLoading(true);
    setError(null);

    try {
      const params: Record<string, any> = { query: q, sortBy };
      if (filter === "verified") params.ownerVerified = true;
      if (filter === "open") params.openNow = true;

      const res = await apiGet<{ data: Shop[] }>("/search/shops?" + new URLSearchParams(params));
      setResults(res.data || []);
    } catch (err: any) {
      setError(err?.message || "Failed to fetch shops");
    } finally {
      setLoading(false);
    }
  };

  // Trigger search whenever query, filter, or sortBy changes
  useEffect(() => {
    fetchShops(query);
  }, [query, filter, sortBy]);

  return (
    <div className="flex flex-col items-center min-h-screen w-full bg-gray-50 pb-24">
      {/* Search Bar */}
      <SearchBar onSearch={(q) => setQuery(q)} />

      {/* Filter / Sort */}
      <div className="w-full max-w-2xl mt-4 px-4 flex flex-row gap-3 justify-end items-center">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">Filter:</label>
          <select
            className="w-full h-12 appearance-none border border-gray-300 rounded-lg bg-gray-50 py-3 px-4 pr-10 text-gray-700 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
          >
            <option value="all">All</option>
            <option value="verified">Owner Verified</option>
            <option value="open">Open Now</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">Sort:</label>
          <select
            className="w-full h-12 appearance-none border border-gray-300 rounded-lg bg-gray-50 py-3 px-4 pr-10 text-gray-700 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
          >
            <option value="distance">Distance</option>
            <option value="name">Name</option>
            <option value="rating">Rating</option>
          </select>
        </div>
      </div>

      {/* Results */}
    <div className="flex flex-col gap-5 items-center m-5 align-center justify-center">
        {loading && <p className="text-center text-gray-500">Loading...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}
        {!loading && !error && results.length === 0 && (
          <p className="text-center text-gray-500">No shops found</p>
        )}
       
       {results.map((shop) => (
          <Link to={`/ViewShop/${shop.id}`} key={shop.id} className="w-full rounded-2xl bg-white shadow-lg p-8 sm:p-10 flex flex-col gap-4 items-center text-center mx-auto">
            
            <div className = "flex flex-row">
              <h2 className="text-xl text-amber-400">{shop.name}</h2>
              {shop.ownerVerified  ? (
                <p className="text-green-700 font-medium absolute right-10"><BadgeCheck /></p>
              ) : (
                <></>
              )}
            </div> 
            <p>{shop.address}</p>
          </Link>
        ))}
      </div>
      </div>
  );
};

export default StoreSearch;

