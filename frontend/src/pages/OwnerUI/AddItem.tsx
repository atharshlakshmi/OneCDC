import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { apiGet, apiPost } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

interface Shop {
  id: string;
  name: string;
}

const AddItem: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { userId, shopId } = location.state || {};

  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState<File | null>(null);

  // Fetch shop details
  useEffect(() => {
    const fetchShop = async () => {
      if (!shopId) {
        setLoading(false);
        return;
      }

      try {
        const response = await apiGet<Shop>(`/shops/${shopId}`);
        setShop(response);
      } catch (error: any) {
        console.error("Failed to fetch shop:", error);
        toast.error("Failed to load shop details");
      } finally {
        setLoading(false);
      }
    };

    fetchShop();
  }, [shopId]);

  /**
   * Convert file to base64 string for API submission
   */
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      // Validate file types (only jpg, jpeg, png)
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];

      if (!allowedTypes.includes(file.type)) {
        toast.error("Only JPG, JPEG, and PNG images are allowed");
        e.target.value = ''; // Clear the input
        return;
      }

      setImage(file);
    }
  };

  const removeImage = () => {
    setImage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!shopId) {
      toast.error("Shop ID is missing");
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare item data
      const itemData: any = {
        name: itemName,
        description,
        category,
        price: parseFloat(price),
      };

      // Convert image to base64 if provided
      if (image) {
        const imageBase64 = await fileToBase64(image);
        itemData.images = [imageBase64];
      }

      // Determine API endpoint based on user role
      const endpoint = user?.role === "registered_shopper"
        ? `/shopper/shops/${shopId}/catalogue`
        : `/owner/shops/${shopId}/catalogue`;

      // Add item to catalogue using appropriate API
      const result = await apiPost<{
        success: boolean;
        message: string;
        data: any;
      }>(endpoint, itemData);

      toast.success(result.message || "Item added successfully!");

      // Navigate back to shop view
      setTimeout(() => {
        navigate(`/ViewShop/${shopId}`);
      }, 500);
    } catch (error: any) {
      console.error("Failed to add item:", error);
      toast.error(error.message || "Failed to add item. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        <span className="ml-3 text-gray-600">Loading...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-24">
      <PageHeader title="Add New Item" />

      <form
        onSubmit={handleSubmit}
        className="flex flex-col max-w-xl mx-auto w-full bg-white rounded-2xl shadow-md mt-6 p-6 space-y-5"
      >
        {/* Shop Name */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            You are adding an item to:
          </label>
          <p className="text-gray-900 font-semibold mb-4">
            {shop?.name || "Unknown Shop"}
          </p>
        </div>

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
          <label className="block font-medium text-gray-800 mb-2">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            className="w-full appearance-none border border-gray-300 rounded-lg bg-gray-50 py-3 px-4 pr-10 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          >
            <option value="">Select a category</option>
            <option value="fashion & apparel">Fashion & Apparel</option>
            <option value="home products">Home Products</option>
            <option value="health & beauty">Health & Beauty</option>
            <option value="toys & hobbies">Toys & Hobbies</option>
            <option value="grocery">Grocery</option>
            <option value="food & beverage">Food & Beverage</option>
            <option value="electronics">Electronics</option>
            <option value="services">Services</option>
            <option value="other">Other</option>
          </select>

          <svg
            className="absolute right-3 top-12 w-5 h-5 text-gray-400 pointer-events-none"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Price */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Price <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Enter price (e.g., 25.00)"
            required
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
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

        {/* Image Upload */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Upload Image
            <span className="text-sm text-gray-500 ml-2">
              (Optional, JPG/JPEG/PNG only)
            </span>
          </label>

          {/* Preview uploaded image */}
          {image && (
            <div className="mb-3">
              <div className="relative inline-block">
                <img
                  src={URL.createObjectURL(image)}
                  alt="Preview"
                  className="h-32 w-32 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Upload button */}
          {!image && (
            <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-4 bg-gray-50 hover:bg-gray-100 transition">
              <label className="flex flex-col items-center cursor-pointer">
                <div className="text-3xl text-gray-400">⬆</div>
                <p className="text-sm text-gray-500 mt-1">
                  Click to upload image
                </p>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handleImageChange}
                  hidden
                />
              </label>
            </div>
          )}
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Adding Item..." : "Add Item"}
        </Button>

        <p className="text-xs text-gray-500 text-center">
          * Required fields
        </p>
      </form>
    </div>
  );
};

export default AddItem;
