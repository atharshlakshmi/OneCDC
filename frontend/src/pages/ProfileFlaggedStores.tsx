import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../lib/api";
import { Store, MapPin, Phone, Mail, AlertTriangle, Calendar, User, Edit } from "lucide-react";

interface ModerationLog {
  _id: string;
  admin: {
    name: string;
    email: string;
  };
  action: string;
  reason: string;
  details?: string;
  timestamp: string;
  createdAt: string;
}

interface FlaggedShop {
  _id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email?: string;
  category: string;
  images: string[];
  warnings: number;
  reportCount: number;
  isActive: boolean;
  moderationLogs: ModerationLog[];
}

export default function ProfileFlaggedStores() {
  const navigate = useNavigate();
  const { isAuthed, checked } = useAuth();
  const [shops, setShops] = useState<FlaggedShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Defensive check: redirect if not authenticated
  useEffect(() => {
    if (checked && !isAuthed) {
      navigate("/login", { replace: true });
    }
  }, [checked, isAuthed, navigate]);

  // Fetch flagged shops
  useEffect(() => {
    const fetchFlaggedShops = async () => {
      try {
        setLoading(true);
        const response = await apiFetch<{ success: boolean; data: FlaggedShop[] }>("/owner/flagged-shops", { method: "GET" });

        if (response?.success && response?.data) {
          setShops(response.data);
        } else {
          setShops([]);
        }
      } catch (err: any) {
        console.error("Error fetching flagged shops:", err);
        setError(err?.message || "Failed to load flagged shops");
      } finally {
        setLoading(false);
      }
    };

    if (checked && isAuthed) {
      fetchFlaggedShops();
    }
  }, [checked, isAuthed]);

  // Show loading while checking auth status
  if (!checked) {
    return <div className="min-h-[60vh] flex items-center justify-center text-gray-600">Checking session…</div>;
  }

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center text-gray-600">Loading flagged stores…</div>;
  }

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-SG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 mt-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-800 flex items-center gap-3">
          <AlertTriangle size={32} className="text-orange-600" />
          Flagged Stores
        </h1>
        <p className="text-gray-600">Stores that have been flagged by admin due to reports</p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>}

      {shops.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200">
          <AlertTriangle size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No flagged stores</h2>
          <p className="text-gray-500 mb-6">Great! None of your stores have been flagged by admin.</p>
          <button
            onClick={() => navigate("/profile/stores")}
            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
          >
            <Store size={20} />
            View My Stores
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {shops.map((shop) => {
            const imageUrl =
              shop.images && shop.images.length > 0
                ? shop.images[0].startsWith("/")
                  ? `${import.meta.env.VITE_API_BASE_URL?.replace("/api", "") || "http://localhost:5000"}${shop.images[0]}`
                  : shop.images[0]
                : null;

            return (
              <div key={shop._id} className="bg-white border-2 border-orange-200 rounded-2xl overflow-hidden shadow-md">
                {/* Warning Header */}
                <div className="bg-orange-50 border-b-2 border-orange-200 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <AlertTriangle size={24} className="text-orange-600" />
                      <div>
                        <h3 className="text-lg font-bold text-orange-900">
                          {shop.warnings} Warning{shop.warnings !== 1 ? "s" : ""} Issued
                        </h3>
                        <p className="text-sm text-orange-700">
                          {shop.reportCount} report{shop.reportCount !== 1 ? "s" : ""} received
                        </p>
                      </div>
                    </div>
                    {!shop.isActive && <span className="bg-red-500 text-white text-sm font-semibold px-3 py-1 rounded-full">Deactivated</span>}
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex gap-6">
                    {/* Store Image */}
                    <div className="flex-shrink-0">
                      <div className="w-48 h-48 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl overflow-hidden">
                        {imageUrl ? (
                          <img src={imageUrl} alt={shop.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Store size={48} className="text-purple-300" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Store Details */}
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-800 mb-2">{shop.name}</h2>
                      <p className="text-gray-600 mb-4 line-clamp-2">{shop.description}</p>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-start gap-2 text-sm text-gray-600">
                          <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                          <span>{shop.address}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone size={16} className="flex-shrink-0" />
                          <span>{shop.phone}</span>
                        </div>

                        {shop.email && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail size={16} className="flex-shrink-0" />
                            <span>{shop.email}</span>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => navigate("/EditShop", { state: { shopId: shop._id } })}
                          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium"
                        >
                          <Edit size={16} />
                          Edit Store
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Warning Reasons */}
                  {shop.moderationLogs && shop.moderationLogs.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <AlertTriangle size={20} className="text-orange-600" />
                        Warning Details
                      </h3>
                      <div className="space-y-3">
                        {shop.moderationLogs.map((log, index) => (
                          <div key={log._id} className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-2">
                              <span className="text-sm font-semibold text-orange-900">Warning #{shop.moderationLogs.length - index}</span>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Calendar size={14} />
                                <span>{formatDate(log.timestamp || log.createdAt)}</span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-700 mb-2">
                              <strong>Reason:</strong> {log.reason}
                            </p>
                            {log.details && (
                              <p className="text-sm text-gray-600 mb-2">
                                <strong>Details:</strong> {log.details}
                              </p>
                            )}
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <User size={14} />
                              <span>
                                Issued by: {log.admin?.name || "Admin"} ({log.admin?.email || "N/A"})
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
