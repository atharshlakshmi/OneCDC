import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../lib/api";
import { Store, MapPin, Phone, Mail, Edit, Plus } from "lucide-react";

interface Shop {
  _id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email?: string;
  category: string;
  images: string[];
  isActive: boolean;
  verifiedByOwner: boolean;
}

export default function ProfileStores() {
  const navigate = useNavigate();
  const { isAuthed, checked } = useAuth();
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatImageUrl = (url: string) => {
    if (!url) return "";

    // Case 1: Old relative uploads (e.g., /uploads/image-xxx.jpg)
    if (url.startsWith("/")) {
      return `${import.meta.env.VITE_API_BASE_URL?.replace("/api", "") || "http://localhost:5000"}${url}`;
    }

    // Case 2: Google Places photo URL (add API key if missing)
    if (url.startsWith("https://places.googleapis.com/v1/")) {
      const hasKey = url.includes("key=");
      if (!hasKey) {
        const joiner = url.includes("?") ? "&" : "?";
        return `${url}${joiner}key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`;
      }
    }

    // Case 3: Already a valid external URL
    return url;
  };

  // Defensive check: redirect if not authenticated
  useEffect(() => {
    if (checked && !isAuthed) {
      navigate("/login", { replace: true });
    }
  }, [checked, isAuthed, navigate]);

  // Fetch owner's shops
  useEffect(() => {
    const fetchShops = async () => {
      try {
        setLoading(true);
        const response = await apiFetch<{ success: boolean; data: Shop[] }>("/owner/shops", { method: "GET" });

        if (response?.success && response?.data) {
          setShops(response.data);
        } else {
          setShops([]);
        }
      } catch (err: any) {
        console.error("Error fetching shops:", err);
        setError(err?.message || "Failed to load shops");
      } finally {
        setLoading(false);
      }
    };

    if (checked && isAuthed) {
      fetchShops();
    }
  }, [checked, isAuthed]);

  // Show loading while checking auth status
  if (!checked) {
    return <div className="min-h-[60vh] flex items-center justify-center text-gray-600">Checking session…</div>;
  }

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center text-gray-600">Loading your stores…</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 mt-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-gray-800">My Stores</h1>
          <p className="text-gray-600">Manage your store listings and details</p>
        </div>
        <button
          onClick={() => navigate("/AddShop")}
          className="flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-white px-6 py-3 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
        >
          <Plus size={20} />
          Add New Store
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>}

      {shops.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200">
          <Store size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No stores yet</h2>
          <p className="text-gray-500 mb-6">Create your first store to get started</p>
          <button
            onClick={() => navigate("/AddShop")}
            className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-white px-6 py-3 rounded-lg transition-colors duration-200"
          >
            <Plus size={20} />
            Add Your First Store
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shops.map((shop) => (
            <div key={shop._id} className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-200">
              {/* Store Image */}
              <div className="h-48 bg-gradient-to-br from-purple-100 to-blue-100 relative">
                {shop.images && shop.images.length > 0 ? (
                  <img src={formatImageUrl(shop.images[0])} alt={shop.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Store size={64} className="text-purple-300" />
                  </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  {shop.isActive ? (
                    <span className="bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full">Active</span>
                  ) : (
                    <span className="bg-gray-500 text-white text-xs font-semibold px-3 py-1 rounded-full">Inactive</span>
                  )}
                </div>
              </div>

              {/* Store Details */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-800 line-clamp-1">{shop.name}</h3>
                  {shop.verifiedByOwner && <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded">Verified</span>}
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{shop.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-1">{shop.address}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone size={16} className="flex-shrink-0" />
                    <span>{shop.phone}</span>
                  </div>

                  {shop.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail size={16} className="flex-shrink-0" />
                      <span className="line-clamp-1">{shop.email}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/ViewShop/${shop._id}`)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium"
                    >
                      View
                    </button>
                    <button
                      onClick={() => navigate("/EditShop", { state: { shopId: shop._id } })}
                      className="flex-1 bg-amber-400 hover:bg-amber-500 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <Edit size={16} />
                      Edit
                    </button>
                  </div>
                  <button
                    onClick={() => navigate(`/ManageCatalogue/${shop._id}`)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium"
                  >
                    Manage Items
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
