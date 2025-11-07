import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { apiGet, apiPut } from "@/lib/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

interface Item {
  id: string;
  _id?: string; // MongoDB ObjectId
  name: string;
  description?: string;
  price: number;
  catalogueId: string;
  shopId: string;
  shopName: string;
  images?: string[];
}

const EditItem: React.FC = () => {
  const { shopId, itemId } = useParams<{ shopId: string; itemId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const itemDataFromState = location.state?.item;

  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [availability, setAvailability] = useState(true);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<number[]>([]);

  // Helper function to convert file to base64
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
      const selectedFiles = Array.from(e.target.files);

      // Calculate remaining image slots
      const remainingCurrentImages = currentImages.length - imagesToDelete.length;
      const totalImages = remainingCurrentImages + newImages.length + selectedFiles.length;

      if (totalImages > 5) {
        toast.error("Maximum 5 images allowed per item");
        e.target.value = "";
        return;
      }

      // Validate file types (only jpg, jpeg, png)
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];

      for (const file of selectedFiles) {
        if (!allowedTypes.includes(file.type)) {
          toast.error("Only JPG, JPEG, and PNG images are allowed");
          e.target.value = "";
          return;
        }
      }

      setNewImages([...newImages, ...selectedFiles]);
    }
  };

  const removeNewImage = (index: number) => {
    setNewImages(newImages.filter((_, i) => i !== index));
  };

  const removeCurrentImage = (index: number) => {
    if (!imagesToDelete.includes(index)) {
      setImagesToDelete([...imagesToDelete, index]);
      toast.success("Image will be removed when you save");
    }
  };

  // Verify shop ownership
  useEffect(() => {
    const verifyOwnership = async () => {
      if (!shopId || !user) {
        setIsAuthorized(false);
        setLoading(false);
        return;
      }

      try {
        // Fetch owner's shops to verify ownership
        const response = await apiGet<{ success: boolean; data: any[] }>("/owner/shops");

        if (response?.success && response?.data) {
          const ownsShop = response.data.some((shop: any) => shop._id === shopId);
          setIsAuthorized(ownsShop);

          if (!ownsShop) {
            toast.error("You are not authorized to edit items from this shop");
            setLoading(false);
          }
        } else {
          setIsAuthorized(false);
          setLoading(false);
        }
      } catch (error: any) {
        console.error("Failed to verify shop ownership:", error);
        setIsAuthorized(false);
        setLoading(false);
      }
    };

    verifyOwnership();
  }, [shopId, user]);

  // Fetch item details if not passed via state
  useEffect(() => {
    const fetchItem = async () => {
      // Don't fetch if not authorized
      if (isAuthorized === false) {
        return;
      }

      // Wait for authorization check to complete
      if (isAuthorized === null) {
        return;
      }

      if (itemDataFromState) {
        setItem(itemDataFromState);
        setName(itemDataFromState.name || "");
        setDescription(itemDataFromState.description || "");
        setPrice(itemDataFromState.price?.toString() || "");
        setCurrentImages(itemDataFromState.images || []);
        setLoading(false);
        return;
      }

      if (!itemId) {
        setLoading(false);
        return;
      }

      try {
        const response = await apiGet<Item>(`/items/${itemId}`);
        setItem(response);
        setName(response.name || "");
        setDescription(response.description || "");
        setPrice(response.price?.toString() || "");
        setCurrentImages(response.images || []);
      } catch (error: any) {
        console.error("Failed to fetch item:", error);
        toast.error("Failed to load item details");
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [itemId, itemDataFromState, isAuthorized]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("DEBUG - shopId:", shopId);
    console.log("DEBUG - itemId:", itemId);
    console.log("DEBUG - item:", item);

    if (!item || !shopId || !itemId) {
      toast.error("Item data not found");
      return;
    }

    setIsSubmitting(true);

    try {
      const updates: any = {
        name,
        description,
        availability,
      };

      if (price) {
        updates.price = parseFloat(price);
      }

      // Build final images array
      const finalImages: string[] = [];

      // Add current images that are not marked for deletion
      currentImages.forEach((img, index) => {
        if (!imagesToDelete.includes(index)) {
          finalImages.push(img);
        }
      });

      // Convert and add new images
      if (newImages.length > 0) {
        const newImagesBase64 = await Promise.all(newImages.map((img) => fileToBase64(img)));
        finalImages.push(...newImagesBase64);
      }

      // Only send images field if there are changes
      if (newImages.length > 0 || imagesToDelete.length > 0) {
        updates.images = finalImages;
      }

      // Use _id if available (MongoDB ObjectId), otherwise use itemId from URL
      const actualItemId = item._id || itemId;
      console.log("DEBUG - actualItemId:", actualItemId);
      console.log("DEBUG - API URL:", `/owner/shops/${shopId}/catalogue/${actualItemId}`);

      // Update item using owner API - use actualItemId with PUT method
      await apiPut(`/owner/shops/${shopId}/catalogue/${actualItemId}`, updates);

      toast.success("Item updated successfully!");

      // Navigate back - use ObjectId since ViewItem now supports it
      setTimeout(() => {
        navigate(`/ViewItem/${actualItemId}`);
      }, 500);
    } catch (error: any) {
      console.error("Failed to update item:", error);
      toast.error(error.message || "Failed to update item. Please try again.");
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

  if (isAuthorized === false) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-2 font-semibold">Access Denied</p>
          <p className="text-gray-500 mb-4">You are not authorized to edit items from this shop</p>
          <Button onClick={() => navigate("/profile/stores")} className="bg-amber-400 hover:bg-amber-500">
            Go to My Stores
          </Button>
        </div>
      </div>
    );
  }

  if (!shopId || !itemId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-4">Shop ID or Item ID is missing</p>
          <Button onClick={() => navigate(-1)} className="bg-amber-400 hover:bg-amber-500">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-4">Item not found</p>
          <Button onClick={() => navigate(-1)} className="bg-amber-400 hover:bg-amber-500">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <PageHeader title="Edit Item" />

      <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white shadow-lg rounded-2xl p-8 mt-8 flex flex-col gap-4">
        <div>
          <p className="text-sm text-gray-500 mb-4">
            Editing item from: <span className="font-semibold">{item.shopName}</span>
          </p>
        </div>

        {/* Item Name */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Item Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter item name"
            required
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
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

        {/* Availability Status - Tick/Cross Buttons */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Availability Status <span className="text-red-500">*</span>
          </label>

          <div className="flex gap-4">
            <Button
              type="button"
              onClick={() => setAvailability(true)}
              className={`w-1/2 py-2 rounded-lg font-medium ${
                availability === true ? "bg-green-600 text-white hover:bg-green-700" : "bg-gray-200 text-gray-700 hover:bg-green-100"
              }`}
            >
              ✓ Available
            </Button>

            <Button
              type="button"
              onClick={() => setAvailability(false)}
              className={`w-1/2 py-2 rounded-lg font-medium ${availability === false ? "bg-red-600 text-white hover:bg-red-700" : "bg-gray-200 text-gray-700 hover:bg-red-100"}`}
            >
              ✕ Unavailable
            </Button>
          </div>
        </div>

        {/* Current Images Display */}
        {currentImages.length > 0 && (
          <div className="space-y-2">
            <label className="block text-gray-700 font-medium mb-2">Current Images</label>
            <div className="flex gap-3 flex-wrap">
              {currentImages.map((img, idx) => (
                <div key={`current-${idx}`} className={`relative ${imagesToDelete.includes(idx) ? "opacity-50" : ""}`}>
                  <img src={img} alt={`Current ${idx + 1}`} className="h-32 w-32 object-cover rounded-lg border-2 border-gray-200" />
                  {!imagesToDelete.includes(idx) && (
                    <button
                      type="button"
                      onClick={() => removeCurrentImage(idx)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      title="Delete this image"
                    >
                      ×
                    </button>
                  )}
                  {imagesToDelete.includes(idx) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                      <span className="text-white text-xs font-bold">Will be deleted</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New Images Preview */}
        {newImages.length > 0 && (
          <div className="space-y-2">
            <label className="block text-gray-700 font-medium mb-2">New Images to Add</label>
            <div className="flex gap-3 flex-wrap">
              {newImages.map((img, idx) => (
                <div key={`new-${idx}`} className="relative">
                  <img src={URL.createObjectURL(img)} alt={`New ${idx + 1}`} className="h-32 w-32 object-cover rounded-lg border-2 border-amber-400" />
                  <button
                    type="button"
                    onClick={() => removeNewImage(idx)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Image Upload */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            {currentImages.length > 0 || newImages.length > 0 ? "Add More Images" : "Upload Images"}
            <span className="text-sm text-gray-500 ml-2">(Max 5 total, JPG/JPEG/PNG only)</span>
          </label>

          {/* Upload button - show if less than 5 total images */}
          {currentImages.length - imagesToDelete.length + newImages.length < 5 && (
            <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-4 bg-gray-50 hover:bg-gray-100 transition">
              <label className="flex flex-col items-center cursor-pointer">
                <div className="text-3xl text-gray-400">⬆</div>
                <p className="text-sm text-gray-500 mt-1">Click to upload ({5 - (currentImages.length - imagesToDelete.length + newImages.length)} more allowed)</p>
                <input type="file" accept="image/jpeg,image/jpg,image/png" onChange={handleImageChange} multiple hidden />
              </label>
            </div>
          )}

          {currentImages.length - imagesToDelete.length + newImages.length >= 5 && <p className="text-sm text-gray-500 text-center py-3">Maximum of 5 images reached</p>}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>

        <div className="flex gap-2 justify-center">
          <Button variant="outline" onClick={() => navigate(-1)} type="button" className="flex-1">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditItem;
