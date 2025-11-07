import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { apiFetch } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

interface Review {
  _id: string;
  description: string;
  images: string[];
  availability: boolean;
  itemName: string;
  shopName: string;
  itemId: string;
  catalogueId: string;
}

const EditReview: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  // Get from location state
  const { reviewId, itemId, catalogueId } = location.state || {};

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [review, setReview] = useState<Review | null>(null);

  // Form state
  const [status, setStatus] = useState<string>("Available");
  const [description, setDescription] = useState<string>("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [currentPhotos, setCurrentPhotos] = useState<string[]>([]);

  useEffect(() => {
    const fetchReview = async () => {
      try {
        const response = await apiFetch(`/reviews/item/${catalogueId}/${itemId}`, {
          method: "GET",
        });

        const reviewData = response.data.reviews.find((r: any) => r._id === reviewId);
        if (reviewData) {
          setReview(reviewData);
          setStatus(reviewData.availability ? "Available" : "Unavailable");
          setDescription(reviewData.description || "");
          setCurrentPhotos(reviewData.images || []);
        } else {
          setError("Review not found");
        }
      } catch (err: any) {
        if (err?.status === 401) {
          await logout();
          navigate("/login", { replace: true });
          return;
        }
        setError(err?.message || "Failed to load review");
      } finally {
        setLoading(false);
      }
    };

    if (reviewId && itemId && catalogueId) {
      fetchReview();
    } else {
      setError("Missing required review information");
      setLoading(false);
    }
  }, [reviewId, itemId, catalogueId, navigate, logout]);

  // --- Handlers ---
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setPhoto(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Upload photo if new one is selected
      let photoUrls = currentPhotos;
      if (photo) {
        const formData = new FormData();
        formData.append("image", photo);
        const uploadResp = await apiFetch("/upload/image", {
          method: "POST",
          body: formData,
        });
        photoUrls = [...currentPhotos, uploadResp.data.url];
      }

      // Update review - use correct field names that backend expects
      await apiFetch(`/reviews/${catalogueId}/${itemId}/${reviewId}`, {
        method: "PUT",
        body: JSON.stringify({
          description: description,
          availability: status === "Available",
          images: photoUrls,
        }),
      });

      navigate("/ActionSuccess", {
        state: {
          message: "Your review has been successfully updated.",
          backPath: "/Profile/Reviews",
        },
      });
    } catch (err: any) {
      if (err?.status === 401) {
        await logout();
        navigate("/login", { replace: true });
        return;
      }
      setError(err?.message || "Failed to update review");
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-gray-500 text-lg">Loading review...</div>;
  }

  if (error || !review) {
    return <div className="flex items-center justify-center min-h-screen text-gray-500 text-lg">{error || "Review not found"}</div>;
  }

  // Helper to get full photo URL
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
  const BASE_URL = API_BASE.replace("/api", ""); // Get base URL without /api
  const getPhotoUrl = (url: string) => {
    // If it's a Base64 data URI or full URL, return as is
    if (url.startsWith("data:") || url.startsWith("http")) {
      return url;
    }
    // Otherwise, prepend the base URL
    return `${BASE_URL}${url}`;
  };

  // --- Render ---
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <PageHeader title="Edit Review" />

      <form onSubmit={handleSubmit} className="max-w-xl mx-auto bg-white shadow-md rounded-2xl p-6 mt-6 space-y-6">
        {/* --- Item Info --- */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">Item Name</label>
          <p className="text-gray-900 font-semibold">{review.itemName}</p>
        </div>

        {/* --- Status --- */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Status Of Item <span className="text-red-500">*</span>
          </label>

          <div className="flex gap-4">
            <Button
              type="button"
              onClick={() => setStatus("Available")}
              className={`w-1/2 py-2 rounded-lg font-medium ${status === "Available" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-green-100"}`}
            >
              Available
            </Button>

            <Button
              type="button"
              onClick={() => {
                setStatus("Unavailable");
                setPhoto(null);
              }}
              className={`w-1/2 py-2 rounded-lg font-medium ${status === "Unavailable" ? "bg-red-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-red-100"}`}
            >
              Unavailable
            </Button>
          </div>
        </div>

        {/* --- Photo Upload (Only when Available) --- */}
        {status === "Available" && (
          <div>
            <label className="block text-gray-700 font-medium mb-2">Upload Photo</label>

            <div className="space-y-4">
              {/* Current Photos */}
              {currentPhotos.length > 0 && (
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {currentPhotos.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={getPhotoUrl(url)}
                        alt={`Existing photo ${index + 1}`}
                        className="h-32 w-32 object-cover rounded-lg"
                        onError={(e) => {
                          console.error("Failed to load image:", getPhotoUrl(url));
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setCurrentPhotos(currentPhotos.filter((_, i) => i !== index))}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* New Photo Upload */}
              {currentPhotos.length < 5 && (
                <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-4 bg-gray-50 hover:bg-gray-100 transition">
                  {photo ? (
                    <div className="relative">
                      <img src={URL.createObjectURL(photo)} alt="Preview" className="h-32 w-32 object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={() => setPhoto(null)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center cursor-pointer">
                      <div className="text-3xl text-gray-400">⬆</div>
                      <p className="text-sm text-gray-500 mt-1">Click to upload a photo (max 5)</p>
                      <input type="file" accept="image/*" onChange={handlePhotoChange} hidden />
                    </label>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- Description --- */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            className="w-full border border-gray-300 rounded-lg p-3 h-32 resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Edit your review description here."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        {/* --- Submit --- */}
        <Button type="submit" className="w-full bg-blue-900 text-white py-3 rounded-xl font-semibold hover:bg-blue-800 transition">
          Save Changes
        </Button>

        <p className="text-sm text-gray-500 text-center">*Fields are compulsory</p>
      </form>
    </div>
  );
};

export default EditReview;
