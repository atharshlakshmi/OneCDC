import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../lib/api";
import { Plus, Package, Edit, Trash2, ArrowLeft, AlertCircle } from "lucide-react";

interface CatalogueItem {
  _id: string;
  name: string;
  description: string;
  price?: number;
  availability: boolean;
  images: string[];
  category?: string;
  cdcVoucherAccepted: boolean;
}

interface Shop {
  _id: string;
  name: string;
}

export default function ManageCatalogue() {
  const navigate = useNavigate();
  const { shopId } = useParams<{ shopId: string }>();
  const { isAuthed, checked } = useAuth();
  const [items, setItems] = useState<CatalogueItem[]>([]);
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const resolveImageUrl = (url: string) => {
    if (!url) return "";

    // Base64 data URI
    if (url.startsWith("data:")) {
      return url;
    }

    // Relative path (old uploads)
    if (url.startsWith("/")) {
      return `${import.meta.env.VITE_API_BASE_URL?.replace("/api", "") || "http://localhost:5000"}${url}`;
    }

    // Already a full URL
    return url;
  };

  // Redirect if not authenticated
  useEffect(() => {
    if (checked && !isAuthed) {
      navigate("/login", { replace: true });
    }
  }, [checked, isAuthed, navigate]);

  // Fetch shop details and catalogue
  useEffect(() => {
    const fetchData = async () => {
      if (!shopId) {
        setError("No shop ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch shop details
        const shopResponse = await apiFetch<{ success: boolean; data: Shop }>(`/owner/shops/${shopId}`, {
          method: "GET",
        });

        if (shopResponse?.success && shopResponse?.data) {
          setShop(shopResponse.data);
        }

        // Fetch catalogue items
        const catalogueResponse = await apiFetch<{ success: boolean; data: { items: CatalogueItem[] } }>(`/owner/shops/${shopId}/catalogue`, { method: "GET" });

        if (catalogueResponse?.success && catalogueResponse?.data?.items) {
          setItems(catalogueResponse.data.items);
        } else {
          setItems([]);
        }
      } catch (err: any) {
        console.error("Error fetching catalogue:", err);
        setError(err?.message || "Failed to load catalogue");
      } finally {
        setLoading(false);
      }
    };

    if (checked && isAuthed && shopId) {
      fetchData();
    }
  }, [checked, isAuthed, shopId]);

  const handleDeleteItem = async (itemId: string) => {
    if (deleteConfirm !== itemId) {
      setDeleteConfirm(itemId);
      return;
    }

    try {
      const response = await apiFetch(`/owner/shops/${shopId}/catalogue/${itemId}`, {
        method: "DELETE",
      });

      if (response?.success) {
        setItems((prev) => prev.filter((item) => item._id !== itemId));
        setDeleteConfirm(null);
      }
    } catch (err: any) {
      console.error("Error deleting item:", err);
      alert(err?.message || "Failed to delete item");
    }
  };

  if (!checked) {
    return <div className="min-h-[60vh] flex items-center justify-center text-gray-600">Checking session…</div>;
  }

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center text-gray-600">Loading catalogue…</div>;
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg max-w-md">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={20} />
            <span className="font-semibold">Error</span>
          </div>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 mt-8">
      {/* Header */}
      <div className="mb-8">
        <button onClick={() => navigate("/profile/stores")} className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors">
          <ArrowLeft size={20} />
          Back to My Stores
        </button>

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-gray-800">Manage Catalogue</h1>
            {shop && <p className="text-gray-600">{shop.name}</p>}
          </div>
          <button
            onClick={() => navigate(`/AddItem/${shopId}`)}
            className="flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-500 text-white px-6 py-3 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg w-full sm:w-auto"
          >
            <Plus size={20} />
            Add Item
          </button>
        </div>
      </div>

      {/* Items Grid */}
      {items.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200">
          <Package size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No items yet</h2>
          <p className="text-gray-500 mb-6">Add your first item to start building your catalogue</p>
          <button
            onClick={() => navigate(`/AddItem/${shopId}`)}
            className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-white px-6 py-3 rounded-lg transition-colors duration-200"
          >
            <Plus size={20} />
            Add Your First Item
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item._id} className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-200">
              {/* Item Image */}
              <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 relative">
                {item.images && item.images.length > 0 ? (
                  <img src={resolveImageUrl(item.images[0])} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Package size={64} className="text-blue-300" />
                  </div>
                )}

                {/* Availability Badge */}
                <div className="absolute top-3 right-3">
                  {item.availability ? (
                    <span className="bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full">Available</span>
                  ) : (
                    <span className="bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full">Unavailable</span>
                  )}
                </div>
              </div>

              {/* Item Details */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-800 line-clamp-1">{item.name}</h3>
                  {item.cdcVoucherAccepted && <span className="bg-amber-100 text-amber-700 text-xs font-medium px-2 py-1 rounded">CDC</span>}
                </div>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>

                {item.category && (
                  <div className="mb-3">
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{item.category}</span>
                  </div>
                )}

                {item.price !== undefined && <p className="text-lg font-bold text-blue-600 mb-4">${item.price.toFixed(2)}</p>}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {deleteConfirm === item._id ? (
                    <>
                      <button
                        onClick={() => handleDeleteItem(item._id)}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium"
                      >
                        Confirm?
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => navigate(`/EditItem/${shopId}/${item._id}`)}
                        className="flex-1 bg-amber-400 hover:bg-amber-500 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium flex items-center justify-center gap-2"
                      >
                        <Edit size={16} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item._id)}
                        className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium flex items-center justify-center gap-2"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
