import React, { useState, useEffect } from "react";
import SearchBar from "../components/SearchBar";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { apiGet } from "../lib/api";
import { BadgeCheck } from "lucide-react";
import '../index.css'

interface Item {
  _id: string;
  name: string;
  description: string;
  price?: number;
  availability: boolean;
  images?: [String];
  category?: string;
  shop: [String];
  cdcVoucherAccepted?: boolean;
  lastUpdatedDate?: string;
  lastUpdatedBy?: string;
  distance?: number;
}

const ItemSearch: React.FC = () => {
    const [results, setResults] = useState<Item[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<string[]>(["all"]); // array of selected filters
    const [sortBy, setSortBy] = useState<string>("distance");
    const [query, setQuery] = useState("");
    const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [locationString, setLocationString] = useState<string>("Getting location...");
  
    const availableFilters = ["verified", "open"]; // list of all selectable filters
  
  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCurrentLocation(location);
          setLocationString(`${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`);
        },
        () => {
          setLocationString("Location unavailable");
          // Use default Singapore location if geolocation fails
          setCurrentLocation({ lat: 1.3521, lng: 103.8198 });
        }
      );
    } else {
      setLocationString("Location not supported");
      setCurrentLocation({ lat: 1.3521, lng: 103.8198 });
    }
  }, []);

  // Fetch items from backend
  const fetchItems = async (q: string) => {
      setLoading(true);
      setError(null);
      console.log("Selected filters:", filters);
      
      try {
        const params: Record<string, any> = { query: q, sortBy };
        
  
        // Only add filter params if filters are selected
        if (filters.length > 0 && !filters.includes("all")) {
          if (filters.includes("verified")) params.ownerVerified = true;
          if (filters.includes("open")) params.openNow = true;
        }
  
        const res = await apiGet<{ data: Item[] }>(
          "/search/items?" + new URLSearchParams(params)
        );
        setResults(res.data || []);
      } catch (err: any) {
        setError(err?.message || "Failed to fetch items");
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
      fetchItems(query);
    }, [currentLocation, query, filters, sortBy]);
  
    const toggleFilter = (filter: string) => {
      if (filter === "all") {
        setFilters([]); // All = no filters
      } else {
        setFilters((prev) =>
          prev.includes(filter)
            ? prev.filter((f) => f !== filter)
            : [...prev, filter]
        );
      }
    };

  return (
    <div>
      <SearchBar onSearch={(q) => setQuery(q)} />

      <div className="px-4 py-3 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin size={16} />
            <span>{locationString}</span>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              size="sm"
            >
              Filter
            </Button>
            <Button
              onClick={() =>
                setSortBy(sortBy === "distance" ? "name_asc" : "distance")
              }
              variant="outline"
              size="sm"
            >
              Sort: {sortBy === "distance" ? "Distance" : "Name"}
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-2">Filters:</p>
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={() => toggleFilter("all")}
                variant={filters.length === 0 ? "default" : "outline"}
                size="sm"
              >
                All
              </Button>
              {availableFilters.map((f) => (
                <Button
                  key={f}
                  onClick={() => toggleFilter(f)}
                  variant={filters.includes(f) ? "default" : "outline"}
                  size="sm"
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-5 items-center m-5">
        {loading && <p className="text-center text-gray-500">Loading...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}
        {!loading && !error && results.length === 0 && (
          <p className="text-center text-gray-500">No items found</p>
        )}

        {results.map((shop) => (
          <Link
            to={`/ViewShop/${shop._id}`}
            key={shop._id}
            className="w-full rounded-2xl bg-white shadow-lg p-8 sm:p-10 flex flex-col gap-4 items-center text-center mx-auto"
          >
            <div className="flex flex-row">
              <h2 className="text-xl text-amber-400">{shop.name}</h2>
              {shop.verifiedByOwner && (
                <p className="text-green-700 font-medium absolute right-10">
                  <BadgeCheck />
                </p>
              )}
            </div>
            <p>{shop.address}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ItemSearch;
