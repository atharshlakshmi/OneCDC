import React, { useState, useEffect } from "react";
import SearchBar from "../components/SearchBar";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MapPin, ChevronLeft, ChevronRight, Info } from "lucide-react";
import { apiGet } from "../lib/api";
import { BadgeCheck } from "lucide-react";
import '../index.css'

export interface ItemSearchResult {
  shopId: string;
  shopName: string;
  shopAddress: string;
  shopCategory: string;
  shopLocation: {
    type: "Point";
    coordinates: [number, number];
  };
  shopPhone: string;
  shopEmail?: string;
  verifiedByOwner: boolean;
  distance: number;
  item: {
    _id: string;
    name: string;
    description: string;
    price?: number;
    availability: boolean;
    images?: string[];
    category?: string;
    cdcVoucherAccepted?: boolean;
  };
}

interface Shop {
  _id: string;
  name: string;
  description?: string;
  address: string;
  location: {
    type: "Point";
    coordinates: [number, number];
  };
  category: string;
  verifiedByOwner: boolean;
  distance: number;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface SearchResponse {
  results?: ItemSearchResult[];
  data?: ItemSearchResult[];
  suggestedShops?: Shop[];
  fallbackMessage?: string;
  categoryName?: string;
  isFallback?: boolean;
  pagination: PaginationData;
}

const ItemSearch: React.FC = () => {
    const [results, setResults] = useState<ItemSearchResult[]>([]);
    const [suggestedShops, setSuggestedShops] = useState<Shop[]>([]);
    const [isFallbackMode, setIsFallbackMode] = useState(false);
    const [fallbackMessage, setFallbackMessage] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState<string>("distance");
    const [query, setQuery] = useState("");
    const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [locationString, setLocationString] = useState<string>("Getting location...");
    const [pagination, setPagination] = useState<PaginationData>({
      page: 1,
      limit: 10,
      total: 0,
      pages: 0,
    });
  
    const availableFilters = ["verified", "open"];
  
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
          setCurrentLocation({ lat: 1.3521, lng: 103.8198 });
        }
      );
    } else {
      setLocationString("Location not supported");
      setCurrentLocation({ lat: 1.3521, lng: 103.8198 });
    }
  }, []);

  // Fetch items from backend
  const fetchItems = async (q: string, page: number = 1) => {
      setLoading(true);
      setError(null);
      console.log("Selected filters:", filters);
      
      try {
        const params: Record<string, any> = { 
          query: q, 
          sortBy,
          page: page.toString(),
          limit: "10",
        };
        
        // Add location if available
        if (currentLocation) {
          params.lat = currentLocation.lat.toString();
          params.lng = currentLocation.lng.toString();
        }
  
        // Only add filter params if filters are selected
        if (filters.includes("verified")) params.ownerVerified = true;
        if (filters.includes("open")) params.openNow = true;
  
        const res = await apiGet<SearchResponse>(
          "/search/items?" + new URLSearchParams(params)
        );
        
        // Handle case where API wraps response in 'data' property
        const actualResponse = res as SearchResponse;


        // Check if we got a fallback response
        if (actualResponse.isFallback === true) {
          if (actualResponse.suggestedShops) {
            setIsFallbackMode(true);
            setSuggestedShops(actualResponse.suggestedShops);
            setFallbackMessage(actualResponse.fallbackMessage || '');
            setResults([]);
          } else {
            setIsFallbackMode(false);
            setSuggestedShops([]);
            setFallbackMessage('');
            setResults([]);
          }
        } else {
          setIsFallbackMode(false);
          setSuggestedShops([]);
          setFallbackMessage('');
          // Handle both 'results' and 'data' properties
          const itemResults = actualResponse.results || actualResponse.data || [];
    
          setResults(itemResults);
        }
        
        setPagination(actualResponse.pagination || { page: 1, limit: 10, total: 0, pages: 0 });
      } catch (err: any) {
        console.error('Fetch error:', err);
        setError(err?.message || "Failed to fetch items");
        setIsFallbackMode(false);
        setSuggestedShops([]);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
      if (currentLocation) {
        fetchItems(query, 1);
      }
    }, [currentLocation, query, filters, sortBy]);
  
    const toggleFilter = (filter: string) => {
      if (filter === "all") {
        setFilters([]);
      } else {
        setFilters((prev) =>
          prev.includes(filter)
            ? prev.filter((f) => f !== filter)
            : [...prev, filter]
        );
      }
    };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      fetchItems(query, newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="pb-32">
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
        
        
        {/* Fallback Message */}
      {!loading && isFallbackMode && fallbackMessage && (
        <div className="w-full max-w-4xl bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
          <Info className="text-blue-600 shrink-0 mt-0.5" size={20} />
          <p className="text-blue-800 text-sm">{fallbackMessage}</p>
        </div>
      )}

        {/* Only show "No items found" when NOT in fallback mode AND no suggested shops */}
        {!loading && !error && !isFallbackMode && results.length === 0 && suggestedShops.length === 0 && (
          <p className="text-center text-gray-500">No items found</p>
        )}

        {/* Regular Item Results */}
        {!isFallbackMode && results.map((result) => (
          <Link
            to={`/ViewShop/${result.shopId}`}
            key={`${result.shopId}-${result.item._id}`}
            className="w-full rounded-2xl bg-white shadow-lg p-8 sm:p-10 flex flex-col gap-4 items-start text-left mx-auto hover:shadow-xl transition-shadow"
          >
            {/* Item Info */}
            <div className="w-full">
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-2xl font-bold text-blue-900">{result.item.name}</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  result.item.availability 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {result.item.availability ? 'Available' : 'Out of Stock'}
                </span>
              </div>
              
              {result.item.description && (
                <p className="text-gray-600 mb-3">{result.item.description}</p>
              )}
              
              {result.item.price !== undefined && (
                <p className="text-xl font-semibold text-green-600 mb-2">
                  ${result.item.price.toFixed(2)}
                </p>
              )}
              
              {result.item.cdcVoucherAccepted && (
                <span className="inline-block px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                  CDC Voucher Accepted
                </span>
              )}
            </div>

            {/* Shop Info */}
            <div className="w-full pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-amber-500">{result.shopName}</h3>
                    {result.verifiedByOwner && (
                      <BadgeCheck className="text-green-700" size={20} />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{result.shopAddress}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">{result.distance} km away</p>
                </div>
              </div>
            </div>
          </Link>
        ))}



        {/* Suggested Shops */}
{!loading && isFallbackMode && suggestedShops.length > 0 && (
  suggestedShops.map(shop => (
    <Link
      to={`/ViewShop/${shop._id}`}
      key={shop._id}
      className="w-full rounded-2xl bg-white shadow-lg p-8 sm:p-10 flex flex-col gap-4 items-start text-left mx-auto hover:shadow-xl transition-shadow border-2 border-blue-100"
    >
      {/* Shop Header */}
      <div className="w-full">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-amber-500">{shop.name}</h2>
            {shop.verifiedByOwner && <BadgeCheck className="text-green-700" size={20} />}
          </div>
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            May have availability
          </span>
        </div>

        {shop.description && <p className="text-gray-600 mb-3">{shop.description}</p>}

        <p className="text-sm text-gray-600">{shop.address}</p>

        {shop.category && (
          <span className="inline-block px-3 py-1 mt-3 bg-blue-100 text-blue-800 text-xs rounded-full">
            {shop.category.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
          </span>
        )}
      </div>

      {/* Distance */}
      {shop.distance !== undefined && (
        <div className="w-full pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500">{shop.distance} km away</p>
        </div>
      )}
    </Link>
  ))
)}

        {/* Pagination Controls */}
        {!loading && (results.length > 0 || suggestedShops.length > 0) && pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-8 mb-4">
            <Button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <ChevronLeft size={16} />
              Previous
            </Button>

            <span className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.pages} ({pagination.total} results)
            </span>

            <Button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight size={16} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemSearch;