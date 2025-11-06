import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../lib/api";
import { ArrowLeft, Upload } from "lucide-react";

interface Shop {
  _id: string;
  name: string;
}

interface Item {
  _id: string;
  name: string;
  description: string;
  price?: number;
  availability: boolean;
  images: string[];
  category?: string;
  cdcVoucherAccepted: boolean;
}

const EditItem: React.FC = () => {
  const navigate = useNavigate();
  const { shopId, itemId } = useParams<{ shopId: string; itemId: string }>();
  const { isAuthed, checked } = useAuth();
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [availability, setAvailability] = useState(true);
  const [cdcVoucherAccepted, setCdcVoucherAccepted] = useState(true);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Redirect if not authenticated
  useEffect(() => {
    if (checked && !isAuthed) {
      navigate("/login", { replace: true });
    }
  }, [checked, isAuthed, navigate]);

  // Fetch shop and item details
  useEffect(() => {
    const fetchData = async () => {
      if (!shopId || !itemId) {
        setLoading(false);
        return;
      }

      try {
        // Fetch shop details
        const shopResponse = await apiFetch<{ success: boolean; data: Shop }>(`/owner/shops/${shopId}`, {
          method: "GET",
        });

        if (shopResponse?.success && shopResponse?.data) {
          setShop(shopResponse.data);
        }

        // Fetch catalogue to get item details
        const catalogueResponse = await apiFetch<{ success: boolean; data: { items: Item[] } }>(`/owner/shops/${shopId}/catalogue`, { method: "GET" });

        if (catalogueResponse?.success && catalogueResponse?.data?.items) {
          const item = catalogueResponse.data.items.find((i: Item) => i._id === itemId);
          if (item) {
            setItemName(item.name);
            setDescription(item.description);
            setCategory(item.category || "");
            setPrice(item.price !== undefined ? item.price.toString() : "");
            setAvailability(item.availability);
            setCdcVoucherAccepted(item.cdcVoucherAccepted);
            setExistingImages(item.images || []);
          }
        }
      } catch (err: any) {
        console.error("Error fetching item:", err);
        alert(err?.message || "Failed to load item");
      } finally {
        setLoading(false);
      }
    };

    if (checked && isAuthed && shopId && itemId) {
      fetchData();
    }
  }, [checked, isAuthed, shopId, itemId]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const totalImages = existingImages.length + filesArray.length;

      if (totalImages > 5) {
        alert("Maximum 5 images allowed per item");
        return;
      }

      setNewImages(filesArray);

      // Create preview URLs
      const previewUrls = filesArray.map((file) => URL.createObjectURL(file));
      setImagePreviews(previewUrls);
    }
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          resolve(reader.result as string);
        } else {
          reject(new Error("Failed to convert file to Base64"));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!shopId || !itemId) {
      alert("Missing shop or item ID");
      return;
    }

    setSaving(true);

    try {
      // Convert new images to Base64
      const base64Images: string[] = [];
      for (const image of newImages) {
        const base64 = await convertFileToBase64(image);
        base64Images.push(base64);
      }

      // Combine existing and new images
      const allImages = [...existingImages, ...base64Images];

      const itemData = {
        name: itemName,
        description: description,
        category: category || undefined,
        price: price ? parseFloat(price) : undefined,
        availability: availability,
        cdcVoucherAccepted: cdcVoucherAccepted,
        images: allImages,
      };

      const response = await apiFetch(`/owner/shops/${shopId}/catalogue/${itemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(itemData),
      });

      if (response?.success) {
        // Navigate back to catalogue management
        navigate(`/ManageCatalogue/${shopId}`);
      } else {
        throw new Error(response?.message || "Failed to update item");
      }
    } catch (err: any) {
      console.error("Error updating item:", err);
      alert(err?.message || "Failed to update item");
    } finally {
      setSaving(false);
    }
  };

  const resolveImageUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("data:")) return url;
    if (url.startsWith("/")) {
      return `${import.meta.env.VITE_API_BASE_URL?.replace("/api", "") || "http://localhost:5000"}${url}`;
    }
    return url;
  };

  if (!checked || loading) {
    return <div className="min-h-[60vh] flex items-center justify-center text-gray-600">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="max-w-3xl mx-auto w-full p-6">
        {/* Back Button */}
        <button onClick={() => navigate(`/ManageCatalogue/${shopId}`)} className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors">
          <ArrowLeft size={20} />
          Back to Catalogue
        </button>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Edit Item</h1>
          {shop && (
            <p className="text-gray-600">
              Shop: <span className="font-semibold">{shop.name}</span>
            </p>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-6 space-y-5">
          {/* Item Name */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Item Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              required
              placeholder="Enter item name"
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Category */}
          <div className="relative">
            <label className="block font-medium text-gray-800 mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full appearance-none border border-gray-300 rounded-lg bg-gray-50 py-3 px-4 pr-10 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            >
              <option value="">Select a category (optional)</option>
              <option value="electronics">Electronics</option>
              <option value="books">Books</option>
              <option value="clothing">Clothing</option>
              <option value="furniture">Furniture</option>
              <option value="food">Food & Beverages</option>
              <option value="health">Health & Beauty</option>
              <option value="sports">Sports & Outdoors</option>
              <option value="other">Other</option>
            </select>

            {/* Down arrow icon */}
            <svg className="absolute right-3 top-11 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* Price */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Price ($)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Enter price (optional)"
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div>
              <label className="block text-gray-700 font-medium mb-2">Current Images</label>
              <div className="grid grid-cols-3 gap-3">
                {existingImages.map((img, idx) => (
                  <div key={idx} className="relative">
                    <img src={resolveImageUrl(img)} alt={`Current ${idx + 1}`} className="w-full h-32 object-cover rounded-lg shadow" />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(idx)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload New Images */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Add New Images <span className="text-gray-500 text-sm">(Max {5 - existingImages.length} more)</span>
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition">
              {imagePreviews.length > 0 ? (
                <div className="grid grid-cols-3 gap-3 mb-3">
                  {imagePreviews.map((preview, idx) => (
                    <img key={idx} src={preview} alt={`Preview ${idx + 1}`} className="w-full h-32 object-cover rounded-lg shadow" />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <Upload size={48} className="text-gray-400 mb-3" />
                  <p className="text-sm text-gray-500 mb-2">Click to upload new images</p>
                  <p className="text-xs text-gray-400">PNG, JPG up to {5 - existingImages.length} images</p>
                </div>
              )}
              <label className="flex items-center justify-center cursor-pointer">
                <span className="text-sm text-blue-600 hover:text-blue-700 font-medium">{imagePreviews.length > 0 ? "Change Images" : "Choose Images"}</span>
                <input type="file" accept="image/*" multiple onChange={handleImageChange} disabled={existingImages.length >= 5} hidden />
              </label>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide details about the item..."
              required
              className="w-full border border-gray-300 rounded-lg p-3 min-h-[100px] focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Availability Toggle */}
          <div className="flex items-center gap-3">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={availability}
                onChange={(e) => setAvailability(e.target.checked)}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="ml-2 text-gray-700 font-medium">Item is available</span>
            </label>
          </div>

          {/* CDC Voucher Toggle */}
          <div className="flex items-center gap-3">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={cdcVoucherAccepted}
                onChange={(e) => setCdcVoucherAccepted(e.target.checked)}
                className="w-5 h-5 text-amber-600 border-gray-300 rounded focus:ring-2 focus:ring-amber-500"
              />
              <span className="ml-2 text-gray-700 font-medium">Accepts CDC Vouchers</span>
            </label>
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate(`/ManageCatalogue/${shopId}`)}
              className="flex-1 py-3 rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300 transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center">* Required fields</p>
        </form>
      </div>
    </div>
  );
};

export default EditItem;
