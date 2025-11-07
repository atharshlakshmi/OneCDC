import React, { useState, useEffect } from "react";
import SearchBar from "../../components/SearchBar";
import { apiGet } from "../../lib/api";
import { BadgeCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useImageBlobUrls, getImageDisplayUrl } from "../../utils/imageUtils";


interface Shop {
  id: string;
  name: string;
  category: string;
  ownerVerified: boolean;
  openNow: boolean;
  address: string;
  images?: string[];
}

const StoreSearch: React.FC = () => {
  const [results, setResults] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "verified" | "open">("all");
  const [sortBy, setSortBy] = useState<"distance" | "name" | "rating">("distance");
  const [query, setQuery] = useState("");

  // Collect all shop images for blob conversion
  const allImages = results.flatMap(shop => shop.images || []);
  const imageBlobUrls = useImageBlobUrls(allImages);

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
          <Link
            to={`/ViewShop/${shop.id}`}
            key={shop.id}
            className="w-full max-w-4xl rounded-2xl bg-amber-400 shadow-lg overflow-hidden flex flex-row hover:bg-amber-500 transition-colors relative"
          >
            {/* Left Half - Image */}
            <div className="w-1/2 h-48 sm:h-56 bg-amber-300 flex items-center justify-center">
              {shop.images && shop.images.length > 0 ? (
                <img
                  src={getImageDisplayUrl(shop.images[0], imageBlobUrls)}
                  alt={shop.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full bg-amber-300">
                  <svg
                    className="w-16 h-16 text-amber-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
              )}
            </div>

            {/* Right Half - Text */}
            <div className="w-1/2 p-6 sm:p-8 flex flex-col justify-center relative">
              {shop.ownerVerified && (
                <div className="absolute top-4 right-4">
                  <BadgeCheck className="text-green-600 w-6 h-6" />
                </div>
              )}
              <h2 className="text-xl sm:text-2xl text-white font-bold mb-2">
                {shop.name}
              </h2>
              <p className="text-white text-sm sm:text-base">{shop.address}</p>
            </div>
          </Link>
        ))}
      </div>
      </div>
  );
};

export default StoreSearch;

