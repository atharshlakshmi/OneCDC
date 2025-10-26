import React, { useState, useEffect } from "react";
import SearchBar from "../../components/SearchBar";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2 } from "lucide-react";
import { apiGet } from "../../lib/api";
import { toast } from "sonner";
import { DEFAULT_LOCATION } from "../../lib/constants";
import '../../index.css'

interface Item {
  _id: string;
  name: string;
  price?: number;
  category?: string;
  shopId: string;
  shopName: string;
  shopAddress: string;
  distance?: number;
}

const ItemSearch: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationString, setLocationString] = useState<string>("Getting location...");
  const [sortBy, setSortBy] = useState<string>("distance");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

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
          setCurrentLocation(DEFAULT_LOCATION);
        }
      );
    } else {
      setLocationString("Location not supported");
      setCurrentLocation(DEFAULT_LOCATION);
    }
  }, []);

  // Fetch items from backend
  useEffect(() => {
    const fetchItems = async () => {
      if (!currentLocation) return;

      setLoading(true);
      try {
        const query = searchParams.get("q") || "";
        const params = new URLSearchParams();

        if (query) params.append("query", query);
        if (filterCategory !== "all") params.append("category", filterCategory);
        params.append("lat", currentLocation.lat.toString());
        params.append("lng", currentLocation.lng.toString());
        params.append("sortBy", sortBy);

        const response = await apiGet<{
          success: boolean;
          data: any[];
          pagination: any;
        }>(`/search/items?${params.toString()}`);

        // Transform the response to match our Item interface
        const transformedItems = (response.data || []).map((item: any) => ({
          _id: item.item._id,
          name: item.item.name,
          price: item.item.price,
          category: item.item.category,
          shopId: item.shopId,
          shopName: item.shopName,
          shopAddress: item.shopAddress,
          distance: item.distance,
        }));

        setItems(transformedItems);
      } catch (error: any) {
        console.error("Failed to fetch items:", error);
        toast.error("Failed to load items. Please try again.");
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [currentLocation, searchParams, sortBy, filterCategory]);

  // Handle search query
  const handleSearch = (query: string) => {
    if (query.trim()) {
      setSearchParams({ q: query });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <SearchBar onSearch={handleSearch} />

      {/* Location and controls */}
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
              onClick={() => setSortBy(sortBy === "distance" ? "name_asc" : "distance")}
              variant="outline"
              size="sm"
            >
              Sort: {sortBy === "distance" ? "Distance" : "Name"}
            </Button>
          </div>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-2">Category:</p>
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={() => setFilterCategory("all")}
                variant={filterCategory === "all" ? "default" : "outline"}
                size="sm"
              >
                All
              </Button>
              <Button
                onClick={() => setFilterCategory("electronics")}
                variant={filterCategory === "electronics" ? "default" : "outline"}
                size="sm"
              >
                Electronics
              </Button>
              <Button
                onClick={() => setFilterCategory("food")}
                variant={filterCategory === "food" ? "default" : "outline"}
                size="sm"
              >
                Food
              </Button>
              <Button
                onClick={() => setFilterCategory("clothing")}
                variant={filterCategory === "clothing" ? "default" : "outline"}
                size="sm"
              >
                Clothing
              </Button>
              <Button
                onClick={() => setFilterCategory("books")}
                variant={filterCategory === "books" ? "default" : "outline"}
                size="sm"
              >
                Books
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Item listings */}
      <div className="flex flex-col gap-5 items-center m-5">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            <span className="ml-3 text-gray-600">Loading items...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No items found. Try adjusting your filters or search query.</p>
          </div>
        ) : (
          items.map((item) => (
            <Link
              to={`/ViewItem/${item._id}`}
              key={item._id}
              className="w-full rounded-3xl bg-amber-400 shadow-lg p-8 sm:p-10 flex flex-col gap-4 items-center text-center mx-auto hover:bg-amber-500 transition-colors"
            >
              <h2 className="text-xl text-white font-semibold">{item.name}</h2>
              {item.price !== undefined && (
                <p className="text-white font-medium">${item.price}</p>
              )}
              <p className="text-white text-sm">{item.shopName}</p>
              {item.distance !== undefined && (
                <p className="text-white text-xs">
                  {(item.distance / 1000).toFixed(2)} km away
                </p>
              )}
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default ItemSearch;