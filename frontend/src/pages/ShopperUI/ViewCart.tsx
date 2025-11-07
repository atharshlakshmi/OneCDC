import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { apiFetch } from "../../lib/api";
import { MapPin, Navigation, Loader2 } from "lucide-react";

type CartItem = {
  shop: {
    _id: string;
    name: string;
    address: string;
    location: {
      type: string;
      coordinates: [number, number]; // [lng, lat]
    };
  };
  itemTags: string[];
  addedAt: string;
};

type TransportMode = "walking" | "driving" | "transit";

// ---- Helpers for client-side filtering of the route response ----
type RouteShop = {
  lat: number;
  lng: number;
  shopId: string;
  shopName: string;
  address?: string;
};

const isValidRouteShop = (s: any): s is RouteShop => !!s && typeof s === "object" && typeof s.lat === "number" && typeof s.lng === "number" && typeof s.shopId === "string";

type RouteData = {
  totalDistance: number;
  totalDuration: number;
  optimizedOrder: Array<RouteShop | null | undefined>;
  polyline?: string;
  legs?: Array<any>;
  mode: string;
};

const filterRouteBySelection = (route: any, selectedIds: string[]): RouteData => {
  const rd: RouteData = {
    totalDistance: Number(route?.totalDistance ?? 0),
    totalDuration: Number(route?.totalDuration ?? 0),
    optimizedOrder: Array.isArray(route?.optimizedOrder) ? route.optimizedOrder : [],
    polyline: route?.polyline,
    legs: route?.legs ?? [],
    mode: route?.mode ?? "walking",
  };

  const idSet = new Set(selectedIds);
  const filtered = rd.optimizedOrder.filter((s) => isValidRouteShop(s) && idSet.has(s.shopId));
  const finalOrder = filtered.length > 0 ? filtered : rd.optimizedOrder.filter(isValidRouteShop);
  return { ...rd, optimizedOrder: finalOrder };
};

const ViewCart: React.FC = () => {
  const navigate = useNavigate();
  const { logout, isAuthed, checked } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedShops, setSelectedShops] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Route generation state
  const [transportMode, setTransportMode] = useState<TransportMode>("walking");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [generatingRoute, setGeneratingRoute] = useState(false);

  // Defensive auth check
  useEffect(() => {
    if (checked && !isAuthed) {
      navigate("/login", { replace: true });
    }
  }, [checked, isAuthed, navigate]);

  // Fetch cart from backend
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const resp = await apiFetch("/cart", { method: "GET" });
        const data = resp?.data?.cart?.items ?? resp?.data?.items ?? resp?.items ?? [];
        if (!active) return;
        setCart(data);
      } catch (err: any) {
        if (err?.status === 401) {
          await logout();
          navigate("/login", { replace: true });
          return;
        }
        if (!active) return;
        setError(err?.message || "Failed to load cart");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [logout, navigate]);

  // Remove shop from cart
  const removeFromCart = async (shopId: string) => {
    try {
      await apiFetch(`/cart/remove/${shopId}`, { method: "DELETE" });
      setCart((prev) => prev.filter((item) => item.shop._id !== shopId));
      setSelectedShops((prev) => prev.filter((id) => id !== shopId));
    } catch (err: any) {
      if (err?.status === 401) {
        await logout();
        navigate("/login", { replace: true });
        return;
      }
      alert(err?.message || "Failed to remove shop from cart");
    }
  };

  // Toggle selection
  const toggleSelectShop = (shopId: string) => {
    setSelectedShops((prev) => (prev.includes(shopId) ? prev.filter((id) => id !== shopId) : [...prev, shopId]));
  };

  // If >1 shop selected and transit is chosen, auto-switch to walking
  useEffect(() => {
    if (selectedShops.length > 1 && transportMode === "transit") {
      setTransportMode("walking");
    }
  }, [selectedShops, transportMode]);

  // Reverse geocode coordinates to address
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`);
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        return data.results[0].formatted_address;
      }
      return null;
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      return null;
    }
  };

  // Get user's current location
  const getUserLocation = async () => {
    setGettingLocation(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setGettingLocation(false);
      // Default Singapore location
      const defaultLat = 1.3521;
      const defaultLng = 103.8198;
      setUserLocation({ lat: defaultLat, lng: defaultLng });
      const address = await reverseGeocode(defaultLat, defaultLng);
      setUserAddress(address || "Singapore");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setUserLocation({ lat, lng });

        const address = await reverseGeocode(lat, lng);
        setUserAddress(address || `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        setGettingLocation(false);
      },
      async (error) => {
        console.error("Geolocation error:", error);
        const defaultLat = 1.3521;
        const defaultLng = 103.8198;
        setUserLocation({ lat: defaultLat, lng: defaultLng });
        const address = await reverseGeocode(defaultLat, defaultLng);
        setUserAddress(address || "Singapore");
        setError("Using default location (Singapore). Please enable location access for accurate routing.");
        setGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Auto-fetch location on mount
  useEffect(() => {
    getUserLocation();
  }, []);

  // Generate route
  // Generate route
  const generateRoute = async () => {
    if (selectedShops.length === 0) {
      alert("Please select at least one shop to generate a route.");
      return;
    }
    if (!userLocation) {
      alert("Please get your location first.");
      return;
    }

    // Guard: transit not allowed for multiple shops
    const effectiveMode: TransportMode = selectedShops.length > 1 && transportMode === "transit" ? "walking" : transportMode;

    setGeneratingRoute(true);
    setError(null);

    try {
      // 🚦 SPECIAL CASE: Transit + exactly one selected shop → bypass backend
      if (effectiveMode === "transit" && selectedShops.length === 1) {
        const selId = selectedShops[0];
        const sel = cart.find((c) => c.shop._id === selId);
        if (!sel) {
          alert("Selected shop not found.");
          return;
        }
        const [lng, lat] = sel.shop.location?.coordinates ?? [undefined, undefined];
        if (typeof lat !== "number" || typeof lng !== "number") {
          alert("Selected shop has invalid coordinates.");
          return;
        }

        const selectedDetail = {
          shopId: sel.shop._id,
          shopName: sel.shop.name,
          address: sel.shop.address,
          lat,
          lng,
        };

        // Minimal stub; ViewRoute will compute the actual transit leg and totals
        const routeData = {
          totalDistance: 0,
          totalDuration: 0,
          optimizedOrder: [selectedDetail], // only the one selected shop
          polyline: undefined,
          legs: [],
          mode: "transit",
        };

        navigate("/route", {
          state: {
            routeData,
            transportMode: "transit",
            origin: userLocation,
            originAddress: userAddress,
            selectedShopIds: [selId],
            selectedCount: 1,
            selectedShopsDetailed: [selectedDetail],
          },
          replace: false,
        });

        return; // ✅ done; no backend call
      }

      // ✅ Normal path (driving/walking OR multi-stop non-transit)
      const selectedShopsDetailed = cart
        .filter((c) => selectedShops.includes(c.shop._id))
        .map((c) => {
          const [lng, lat] = c.shop.location?.coordinates ?? [undefined, undefined];
          return {
            shopId: c.shop._id,
            shopName: c.shop.name,
            address: c.shop.address,
            lat: typeof lat === "number" ? lat : 0,
            lng: typeof lng === "number" ? lng : 0,
          };
        })
        .filter((s) => typeof s.lat === "number" && typeof s.lng === "number" && !Number.isNaN(s.lat) && !Number.isNaN(s.lng));

      const resp = await apiFetch("/cart/generate-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin: userLocation,
          mode: effectiveMode,
          selectedShopIds: selectedShops, // tell backend exactly which to route
        }),
      });

      const rawRoute = resp?.data ?? resp;
      const routeData = {
        totalDistance: Number(rawRoute?.totalDistance ?? 0),
        totalDuration: Number(rawRoute?.totalDuration ?? 0),
        optimizedOrder: Array.isArray(rawRoute?.optimizedOrder) ? rawRoute.optimizedOrder : [],
        polyline: rawRoute?.polyline,
        legs: rawRoute?.legs ?? [],
        mode: rawRoute?.mode ?? effectiveMode,
      };

      navigate("/route", {
        state: {
          routeData,
          transportMode: effectiveMode,
          origin: userLocation,
          originAddress: userAddress,
          selectedShopIds: selectedShops,
          selectedCount: selectedShops.length,
          selectedShopsDetailed,
        },
        replace: false,
      });
    } catch (err: any) {
      if (err?.status === 401) {
        await logout();
        navigate("/login", { replace: true });
        return;
      }
      setError(err?.message || "Failed to generate route");
    } finally {
      setGeneratingRoute(false);
    }
  };

  if (loading) {
    return (
      <div>
        <PageHeader title="Your Cart" />
        <div className="flex flex-col gap-5 items-center m-5 justify-center min-h-[40vh]">
          <Loader2 className="animate-spin text-amber-400" size={48} />
          <p className="text-gray-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div>
        <PageHeader title="Your Cart" />
        <div className="flex flex-col gap-5 items-center m-5 align-center justify-center min-h-[40vh]">
          <h2 className="text-xl text-amber-400">Your cart is empty!</h2>
          <p className="text-gray-600">Add some shops to start planning your route.</p>
          <Button onClick={() => navigate("/storeSearch")} className="bg-amber-400 hover:bg-amber-500 text-white">
            Browse Shops
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Your Cart" />

      {/* Error message */}
      {error && <div className="mx-5 mb-4 p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg">{error}</div>}

      {/* Route Planning Section */}
      <div className="mx-5 mb-6 p-6 bg-white rounded-2xl shadow-lg">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Route Planning</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Transport Mode Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Transport Mode</label>
            <select
              value={transportMode}
              onChange={(e) => setTransportMode(e.target.value as TransportMode)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="walking">🚶 Walking</option>
              <option value="driving">🚗 Driving</option>
              <option value="transit" disabled={selectedShops.length > 1} title={selectedShops.length > 1 ? "Transit is only available for one stop" : ""}>
                🚌 Public Transit
              </option>
            </select>

            {selectedShops.length > 1 && (
              <p className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1 inline-block">
                Transit is only available when a single shop is selected.
              </p>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Your Location</label>
            {gettingLocation ? (
              <div className="flex items-center text-sm text-gray-600 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                <Loader2 className="animate-spin mr-2" size={16} />
                Getting your location...
              </div>
            ) : userLocation && userAddress ? (
              <div className="flex items-center text-sm text-gray-600 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                <Navigation size={16} className="mr-2 text-green-600" />
                {userAddress}
              </div>
            ) : (
              <div className="flex items-center text-sm text-gray-600 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                <MapPin size={16} className="mr-2" />
                Location not available
              </div>
            )}
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-3">Select shops below and generate an optimized route from your location.</p>
      </div>

      {/* Cart List */}
      <div className="flex flex-col gap-5 items-center m-5">
        {cart.map((item) => {
          const isSelected = selectedShops.includes(item.shop._id);
          return (
            <div
              key={item.shop._id}
              className={`relative w-full rounded-2xl bg-white shadow-lg p-8 sm:p-10 flex flex-col gap-4 items-center text-center mx-auto transition-all duration-200 ${
                isSelected ? "ring-2 ring-amber-400" : ""
              }`}
            >
              {/* Checkbox on the right corner */}
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleSelectShop(item.shop._id)}
                className="absolute top-5 right-5 w-5 h-5 accent-amber-400 cursor-pointer"
              />

              {/* Shop Name */}
              <Link to={`/ViewShop/${item.shop._id}`} className="text-xl text-amber-400 hover:underline">
                {item.shop.name}
              </Link>

              {/* Address */}
              <p className="text-sm text-gray-600">{item.shop.address}</p>

              {/* Items to buy */}
              {item.itemTags.length > 0 && (
                <div className="text-sm text-gray-700">
                  <span className="font-medium">Items: </span>
                  {item.itemTags.join(", ")}
                </div>
              )}

              {/* Remove Button */}
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  removeFromCart(item.shop._id);
                }}
                variant="outline"
                size="sm"
              >
                Remove
              </Button>
            </div>
          );
        })}

        {/* Generate Path Button */}
        <Button
          onClick={generateRoute}
          size="lg"
          disabled={selectedShops.length === 0 || !userLocation || generatingRoute}
          className={`mt-6 px-8 py-3 rounded-lg shadow-md text-white flex items-center gap-2 ${
            selectedShops.length === 0 || !userLocation || generatingRoute ? "bg-gray-300 cursor-not-allowed" : "bg-amber-400 hover:bg-amber-500"
          }`}
        >
          {generatingRoute ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Generating Route...
            </>
          ) : (
            <>
              <Navigation size={20} />
              Generate Optimized Route
            </>
          )}
        </Button>

        {selectedShops.length > 0 && (
          <p className="text-sm text-gray-600">
            {selectedShops.length} shop{selectedShops.length > 1 ? "s" : ""} selected
          </p>
        )}
      </div>
    </div>
  );
};

export default ViewCart;
