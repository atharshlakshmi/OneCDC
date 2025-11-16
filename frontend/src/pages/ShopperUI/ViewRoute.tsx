import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { APIProvider, Map, AdvancedMarker, Pin, useMap } from "@vis.gl/react-google-maps";
import { Button } from "@/components/ui/button";
import { Navigation, MapPin, Clock, ArrowLeft, AlertTriangle } from "lucide-react";
import PageHeader from "@/components/PageHeader";

declare const google: any;

type Shop = {
  lat: number;
  lng: number;
  shopId: string;
  shopName: string;
  address?: string;
};

type RouteData = {
  totalDistance: number;
  totalDuration: number;
  optimizedOrder: Array<any>;
  polyline?: string;
  legs?: Array<any>;
  mode: string;
};

type NavState = {
  routeData?: RouteData;
  transportMode?: string;
  origin?: { lat: number; lng: number };
  originAddress?: string;
  selectedShopIds?: string[];
  selectedCount?: number;
  selectedShopsDetailed?: Array<{ shopId: string; shopName: string; address?: string; lat: number; lng: number }>;
};

const GOOGLE_MAPS_API_KEY = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || "";

/* ---------- helpers for totals ---------- */
const parseGoogleDurationToSeconds = (d?: string) => {
  if (!d || typeof d !== "string") return 0;
  const num = parseFloat(d.replace("s", ""));
  return Number.isFinite(num) ? Math.max(0, num) : 0;
};

// haversine (meters)
const haversine = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
  const R = 6371000;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s1 = Math.sin(dLat / 2),
    s2 = Math.sin(dLng / 2);
  const q = s1 * s1 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * s2 * s2;
  return 2 * R * Math.asin(Math.sqrt(q));
};

/** Normalization helpers */
const isNum = (v: any): v is number => typeof v === "number" && !Number.isNaN(v);
const pickId = (s: any): string | null =>
  (typeof s?.shopId === "string" && s.shopId) ||
  (typeof s?.id === "string" && s.id) ||
  (typeof s?._id === "string" && s._id) ||
  (typeof s?.shop?.id === "string" && s.shop.id) ||
  (typeof s?.shop?._id === "string" && s.shop._id) ||
  null;

const pickName = (s: any): string | null =>
  (typeof s?.shopName === "string" && s.shopName) || (typeof s?.name === "string" && s.name) || (typeof s?.shop?.name === "string" && s.shop.name) || null;

const pickAddress = (s: any): string | undefined => (typeof s?.address === "string" && s.address) || (typeof s?.shop?.address === "string" && s.shop.address) || undefined;

const pickLatLng = (s: any): { lat: number; lng: number } | null => {
  if (isNum(s?.lat) && isNum(s?.lng)) return { lat: s.lat, lng: s.lng };
  if (isNum(s?.location?.lat) && isNum(s?.location?.lng)) return { lat: s.location.lat, lng: s.location.lng };
  if (Array.isArray(s?.location?.coordinates) && s.location.coordinates.length >= 2) {
    const [lng, lat] = s.location.coordinates;
    if (isNum(lat) && isNum(lng)) return { lat, lng };
  }
  if (Array.isArray(s?.coordinates) && s.coordinates.length >= 2) {
    const [lng, lat] = s.coordinates;
    if (isNum(lat) && isNum(lng)) return { lat, lng };
  }
  if (Array.isArray(s?.shop?.location?.coordinates) && s.shop.location.coordinates.length >= 2) {
    const [lng, lat] = s.shop.location.coordinates;
    if (isNum(lat) && isNum(lng)) return { lat, lng };
  }
  return null;
};

const normalizeShop = (s: any): Shop | null => {
  const id = pickId(s);
  const name = pickName(s);
  const addr = pickAddress(s);
  const latlng = pickLatLng(s);
  if (!id || !name || !latlng) return null;
  return { shopId: id, shopName: name, address: addr, ...latlng };
};

const decodePolyline = (encoded: string): Array<{ lat: number; lng: number }> => {
  const poly: Array<{ lat: number; lng: number }> = [];
  let index = 0,
    len = encoded.length,
    lat = 0,
    lng = 0;
  while (index < len) {
    let b,
      shift = 0,
      result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;
    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;
    poly.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }
  return poly;
};

/** Map overlay */
const PolylineOverlay = ({ path }: { path: Array<{ lat: number; lng: number }> }) => {
  const map = useMap();
  useEffect(() => {
    if (!map || path.length < 2) return;
    const polyline = new google.maps.Polyline({
      path,
      geodesic: true,
      strokeColor: "#F59E0B",
      strokeOpacity: 0.9,
      strokeWeight: 5,
    });
    polyline.setMap(map);
    return () => polyline.setMap(null);
  }, [map, path]);
  return null;
};

const toRoutesMode = (mode?: string): "DRIVE" | "WALK" | "BICYCLE" | "TWO_WHEELER" => {
  switch ((mode || "").toLowerCase()) {
    case "driving":
      return "DRIVE";
    case "walking":
      return "WALK";
    case "bicycling":
      return "BICYCLE";
    case "two_wheeler":
      return "TWO_WHEELER";
    default:
      return "WALK";
  }
};

const ViewRoute = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { routeData, transportMode, origin, originAddress, selectedShopIds, selectedCount, selectedShopsDetailed } = (location.state || {}) as NavState;

  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 1.3521, lng: 103.8198 });
  const [mapZoom] = useState(13);
  const [routePath, setRoutePath] = useState<Array<{ lat: number; lng: number }>>([]);
  const [sumDistance, setSumDistance] = useState<number | null>(null); // meters
  const [sumDuration, setSumDuration] = useState<number | null>(null); // seconds

  // Normalize backend list
  const normalizedFromBackend = useMemo<Shop[]>(() => (routeData?.optimizedOrder ?? []).map(normalizeShop).filter((s): s is Shop => !!s), [routeData]);

  // Normalize selectedShopsDetailed (fallback truth from cart)
  const normalizedFromCart = useMemo<Shop[]>(() => (selectedShopsDetailed ?? []).map(normalizeShop).filter((s): s is Shop => !!s), [selectedShopsDetailed]);

  // Merge backend + cart fallback to ensure all selected shops are present
  const mergedShops = useMemo<Shop[]>(() => {
    const byId: Map<string, Shop> = new globalThis.Map();
    normalizedFromBackend.forEach((s) => byId.set(s.shopId, s));
    normalizedFromCart.forEach((s) => byId.set(s.shopId, s)); // cart overrides/fills missing
    return Array.from(byId.values());
  }, [normalizedFromBackend, normalizedFromCart]);

  // Apply selection order if provided; else if count provided, take first N; else use merged list
  const displayedShops = useMemo<Shop[]>(() => {
    if (Array.isArray(selectedShopIds) && selectedShopIds.length > 0) {
      const order: Map<string, number> = new globalThis.Map(selectedShopIds.map((id, idx): [string, number] => [id, idx]));
      return mergedShops.filter((s) => order.has(s.shopId)).sort((a, b) => order.get(a.shopId)! - order.get(b.shopId)!);
    }
    if (typeof selectedCount === "number" && selectedCount >= 0) {
      return mergedShops.slice(0, selectedCount);
    }
    return mergedShops;
  }, [mergedShops, selectedShopIds, selectedCount]);

  // Remount map when actual displayed content changes
  const routeKey = useMemo(
    () => (origin ? [origin.lat, origin.lng, ...displayedShops.map((s) => `${s.shopId}:${s.lat.toFixed(6)},${s.lng.toFixed(6)}`)].join("|") : "no-origin"),
    [origin, displayedShops]
  );

  // Fetch road route with per-leg polylines (and compute totals for *displayed* shops)
  useEffect(() => {
    let abort = false;

    const run = async () => {
      if (!origin || displayedShops.length === 0) {
        setRoutePath([]);
        setSumDistance(null);
        setSumDuration(null);
        return;
      }

      const mode = (transportMode || routeData?.mode || "walking").toLowerCase();

      // Handle TRANSIT: draw straight segments + haversine distance; duration unknown
      if (mode === "transit") {
        // Build points in order: origin -> selected shops (your UI already limits to 1 for transit)
        const points: Array<{ lat: number; lng: number }> = [origin, ...displayedShops.map((s) => ({ lat: s.lat, lng: s.lng }))];

        try {
          let totalMeters = 0;
          let totalSecs = 0;
          let stitched: Array<{ lat: number; lng: number }> = [];

          // Transit doesn't support intermediates; call per leg and stitch
          for (let i = 0; i < points.length - 1; i++) {
            if (abort) return;

            const legOrigin = points[i];
            const legDest = points[i + 1];

            const body = {
              origin: { location: { latLng: { latitude: legOrigin.lat, longitude: legOrigin.lng } } },
              destination: { location: { latLng: { latitude: legDest.lat, longitude: legDest.lng } } },
              travelMode: "TRANSIT",
              polylineEncoding: "ENCODED_POLYLINE",
              computeAlternativeRoutes: false,
            };

            const resp = await fetch(`https://routes.googleapis.com/directions/v2:computeRoutes?key=${GOOGLE_MAPS_API_KEY}`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-Goog-FieldMask": "routes.legs.distanceMeters,routes.legs.duration,routes.legs.polyline.encodedPolyline",
              },
              body: JSON.stringify(body),
            });

            const json = await resp.json();
            const leg = json?.routes?.[0]?.legs?.[0];
            if (!leg) continue;

            // totals
            totalMeters += leg?.distanceMeters ?? 0;
            const secs = typeof leg?.duration === "string" ? parseFloat(leg.duration.replace("s", "")) : 0;
            totalSecs += Number.isFinite(secs) ? secs : 0;

            // stitch polyline
            const enc = leg?.polyline?.encodedPolyline;
            if (enc) {
              const pts = decodePolyline(enc);
              if (stitched.length > 0 && pts.length > 0) {
                const last = stitched[stitched.length - 1];
                const first = pts[0];
                if (last.lat === first.lat && last.lng === first.lng) {
                  stitched.push(...pts.slice(1));
                } else {
                  stitched.push(...pts);
                }
              } else {
                stitched.push(...pts);
              }
            } else {
              // no polyline returned: straight fallback for this leg
              stitched.push(legOrigin, legDest);
            }
          }

          if (!abort) {
            if (stitched.length < 2) {
              // full fallback if API returned nothing
              stitched = points;
            }
            setRoutePath(stitched);
            setSumDistance(totalMeters);
            setSumDuration(totalSecs); // 👈 now duration is non-zero
          }
        } catch (e) {
          console.error("Transit routing failed; falling back to straight segments:", e);
          if (!abort) {
            const straight = [origin, ...displayedShops.map((s) => ({ lat: s.lat, lng: s.lng }))];
            setRoutePath(straight);
            let dist = 0;
            for (let i = 0; i < straight.length - 1; i++) dist += haversine(straight[i], straight[i + 1]);
            setSumDistance(dist);
            setSumDuration(null); // unknown without API duration
          }
        }
        return; // important: don't fall through to driving/walking branch
      }

      const destination = displayedShops[displayedShops.length - 1];
      const body = {
        origin: { location: { latLng: { latitude: origin.lat, longitude: origin.lng } } },
        destination: { location: { latLng: { latitude: destination.lat, longitude: destination.lng } } },
        intermediates: displayedShops.slice(0, -1).map((s) => ({
          location: { latLng: { latitude: s.lat, longitude: s.lng } },
        })),
        travelMode: toRoutesMode(mode),
        computeAlternativeRoutes: false,
        polylineEncoding: "ENCODED_POLYLINE",
        // optimizeWaypointOrder: true, // enable if you want Google to reorder mids
      };

      try {
        const resp = await fetch(`https://routes.googleapis.com/directions/v2:computeRoutes?key=${GOOGLE_MAPS_API_KEY}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // ask for distances & durations per leg so our totals match displayed shops
            "X-Goog-FieldMask": "routes.legs.polyline.encodedPolyline,routes.legs.distanceMeters,routes.legs.duration",
          },
          body: JSON.stringify(body),
        });

        const json = await resp.json();
        const legs = json?.routes?.[0]?.legs;

        if (!abort) {
          if (Array.isArray(legs) && legs.length > 0) {
            // stitch polyline
            const stitched: Array<{ lat: number; lng: number }> = [];
            legs.forEach((leg: any, i: number) => {
              const enc = leg?.polyline?.encodedPolyline;
              if (!enc) return;
              const pts = decodePolyline(enc);
              if (i > 0 && stitched.length > 0 && pts.length > 0) {
                const last = stitched[stitched.length - 1];
                const first = pts[0];
                if (last.lat === first.lat && last.lng === first.lng) {
                  stitched.push(...pts.slice(1));
                  return;
                }
              }
              stitched.push(...pts);
            });
            setRoutePath(stitched.length > 1 ? stitched : [origin, { lat: destination.lat, lng: destination.lng }]);

            // compute totals from legs (ONLY displayed shops)
            const dist = legs.reduce((acc: number, l: any) => acc + (l?.distanceMeters ?? 0), 0);
            const dur = legs.reduce((acc: number, l: any) => acc + parseGoogleDurationToSeconds(l?.duration), 0);
            setSumDistance(Number.isFinite(dist) ? dist : null);
            setSumDuration(Number.isFinite(dur) ? dur : null);
          } else {
            // fallback: straight segments
            const straight = [origin, ...displayedShops.map((s) => ({ lat: s.lat, lng: s.lng }))];
            setRoutePath(straight);
            let dist = 0;
            for (let i = 0; i < straight.length - 1; i++) dist += haversine(straight[i], straight[i + 1]);
            setSumDistance(dist);
            setSumDuration(null);
          }
        }
      } catch (e) {
        console.error("Routes API failed; falling back to straight segments:", e);
        if (!abort) {
          const straight = [origin, ...displayedShops.map((s) => ({ lat: s.lat, lng: s.lng }))];
          setRoutePath(straight);
          let dist = 0;
          for (let i = 0; i < straight.length - 1; i++) dist += haversine(straight[i], straight[i + 1]);
          setSumDistance(dist);
          setSumDuration(null);
        }
      }
    };

    run();
    return () => {
      abort = true;
    };
  }, [origin, displayedShops, transportMode, routeData?.mode]);

  // Center map
  useEffect(() => {
    if (!routeData || !origin) {
      navigate("/ViewCart", { replace: true });
      return;
    }
    if (displayedShops.length > 0) {
      const avgLat = displayedShops.reduce((sum, s) => sum + s.lat, origin.lat) / (displayedShops.length + 1);
      const avgLng = displayedShops.reduce((sum, s) => sum + s.lng, origin.lng) / (displayedShops.length + 1);
      setMapCenter({ lat: avgLat, lng: avgLng });
    } else {
      setMapCenter(origin);
    }
  }, [routeData, origin, displayedShops, navigate]);

  if (!routeData || !origin) {
    return (
      <div>
        <PageHeader title="Route Not Found" />
        <div className="flex flex-col gap-5 items-center m-5 justify-center min-h-[40vh]">
          <p className="text-gray-600">No route data available.</p>
          <Button onClick={() => navigate("/ViewCart")} className="bg-amber-400 hover:bg-amber-500 text-white">
            Back to Cart
          </Button>
        </div>
      </div>
    );
  }

  const formatDistance = (m: number) => (m < 1000 ? `${m.toFixed(0)} m` : `${(m / 1000).toFixed(2)} km`);
  const formatDuration = (s: number) => {
    const h = Math.floor(s / 3600),
      m = Math.floor((s % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const distanceToShow = sumDistance ?? routeData.totalDistance;
  const durationToShow = sumDuration ?? routeData.totalDuration;

  const openGoogleMapsNavigation = () => {
    if (!origin || displayedShops.length === 0) return;
    const last = displayedShops[displayedShops.length - 1];
    const mids = displayedShops.slice(0, -1);
    const waypoints = mids.length ? mids.map((s) => `${s.lat},${s.lng}`).join("|") : "";
    const url =
      `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}` +
      `&destination=${last.lat},${last.lng}` +
      `${waypoints ? `&waypoints=${waypoints}` : ""}` +
      `&travelmode=${transportMode || "walking"}`;
    window.open(url, "_blank");
  };

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div>
        <PageHeader title="Optimized Route" />
        <div className="mx-5 mb-6 p-6 bg-red-50 border border-red-200 rounded-2xl">
          <div className="flex items-center gap-2 text-red-800 mb-2">
            <AlertTriangle size={20} />
            <h3 className="font-semibold">Google Maps API Key Missing</h3>
          </div>
          <p className="text-sm text-red-700">Please add VITE_GOOGLE_MAPS_API_KEY to your frontend .env file to display the map.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Optimized Route" />
      <div className="mx-5 mb-6 p-6 bg-white rounded-2xl shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Route Summary</h2>
            <p className="text-sm text-gray-600 capitalize">Transport Mode: {transportMode}</p>
          </div>
          <div className="flex gap-6">
            <div className="text-center">
              <div className="flex items-center gap-2 text-amber-600">
                <MapPin size={20} />
                <span className="text-2xl font-bold">{formatDistance(distanceToShow)}</span>
              </div>
              <p className="text-xs text-gray-600">Total Distance</p>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-2 text-blue-600">
                <Clock size={20} />
                <span className="text-2xl font-bold">{formatDuration(durationToShow)}</span>
              </div>
              <p className="text-xs text-gray-600">Total Duration</p>
            </div>
          </div>
        </div>

        <div className="h-96 w-full rounded-xl border-2 border-gray-200 mb-6 relative">
          <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
            <Map
              key={routeKey}
              style={{ width: "100%", height: "100%" }}
              defaultCenter={mapCenter}
              defaultZoom={mapZoom}
              mapId="c1591fd3ec73233b123b0a50"
              options={{ gestureHandling: "greedy", disableDefaultUI: false, clickableIcons: true, scrollwheel: true, draggable: true }}
            >
              <AdvancedMarker position={origin} title="Your Location (Start)">
                <Pin background="#22c55e" glyphColor="#ffffff" borderColor="#16a34a">
                  <span style={{ fontSize: "20px" }}>📍</span>
                </Pin>
              </AdvancedMarker>

              {displayedShops.map((shop, index) => (
                <AdvancedMarker key={shop.shopId} position={{ lat: shop.lat, lng: shop.lng }} title={shop.shopName}>
                  <Pin background="#f59e0b" glyphColor="#ffffff" borderColor="#d97706">
                    <div
                      style={{
                        color: "white",
                        fontWeight: "bold",
                        fontSize: "14px",
                        width: "24px",
                        height: "24px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#f59e0b",
                        borderRadius: "50%",
                      }}
                    >
                      {index + 1}
                    </div>
                  </Pin>
                </AdvancedMarker>
              ))}

              {routePath.length >= 2 && <PolylineOverlay path={routePath} />}
            </Map>
          </APIProvider>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold text-gray-800 mb-3">Route Order:</h3>
          <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm">📍</div>
              <div>
                <p className="font-medium text-gray-800">Your Location (Start)</p>
                <p className="text-xs text-gray-600">{originAddress || "Starting Point"}</p>
              </div>
            </div>
          </div>

          {displayedShops.map((shop, index) => (
            <div key={shop.shopId} className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-amber-400 text-white rounded-full flex items-center justify-center font-bold text-sm">{index + 1}</div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{shop.shopName}</p>
                  <p className="text-xs text-gray-600">{shop.address || `${shop.lat.toFixed(6)}, ${shop.lng.toFixed(6)}`}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-6">
          <Button onClick={() => navigate("/ViewCart")} variant="outline" className="flex items-center gap-2">
            <ArrowLeft size={16} /> Back to Cart
          </Button>
          <Button onClick={openGoogleMapsNavigation} className="bg-amber-400 hover:bg-amber-500 text-white flex items-center gap-2">
            <Navigation size={16} /> Start Navigation
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ViewRoute;
