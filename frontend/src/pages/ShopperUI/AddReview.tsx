import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { apiPost } from "@/lib/api";

const AddReview: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { itemId, itemName, catalogueId } = location.state || {};

  const [availability, setAvailability] = useState<boolean | null>(null);
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (e.target.files?.length) {
      const newImages = Array.from(e.target.files);

      // Validate file types (only jpg, jpeg, png)
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
      const invalidFiles = newImages.filter((file) => !allowedTypes.includes(file.type));

      if (invalidFiles.length > 0) {
        toast.error("Only JPG, JPEG, and PNG images are allowed");
        e.target.value = ""; // Clear the input
        return;
      }

      // Limit to 5 images total
      if (images.length + newImages.length > 5) {
        toast.error("Maximum 5 images allowed");
        e.target.value = ""; // Clear the input
        return;
      }

      setImages([...images, ...newImages]);
      e.target.value = ""; // Clear the input after successful upload
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (availability === null) {
      toast.error("Please select availability status");
      return;
    }

    // Validate images only allowed when available
    if (!availability && images.length > 0) {
      toast.error("Images can only be uploaded when item is marked as available");
      setImages([]);
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert images to base64 strings
      const imageBase64Strings = await Promise.all(images.map((file) => fileToBase64(file)));

      // Submit review to backend using direct API call
      const result = await apiPost<{
        success: boolean;
        message: string;
        data: any;
      }>("/shopper/reviews", {
        catalogueId,
        itemId: String(itemId),
        description,
        availability,
        images: imageBase64Strings,
      });

      toast.success(result.message || "Review submitted successfully!");

      // Navigate back to item page after short delay
      setTimeout(() => {
        navigate(`/ViewItem/${itemId}`);
      }, 500);
    } catch (error: any) {
      console.error("Failed to submit review:", error);
      toast.error(error.message || "Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!itemId || !catalogueId) {
    return <div className="flex items-center justify-center min-h-screen text-gray-500 text-lg">Item information missing.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Page Header */}
      <PageHeader title="Add New Review" />

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="max-w-xl mx-auto bg-white shadow-md rounded-2xl p-6 mt-6 space-y-6">
        {/* Item Info */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">Item Name</label>
          <p className="text-gray-900 font-semibold">{itemName}</p>
        </div>

        {/* Availability Status */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Status Of Item <span className="text-red-500">*</span>
          </label>

          <div className="flex gap-4">
            <Button
              type="button"
              onClick={() => setAvailability(true)}
              className={`w-1/2 py-2 rounded-lg font-medium ${availability === true ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-green-100"}`}
            >
              Available
            </Button>

            <Button
              type="button"
              onClick={() => {
                setAvailability(false);
                setImages([]); // Clear images when marking unavailable
              }}
              className={`w-1/2 py-2 rounded-lg font-medium ${availability === false ? "bg-red-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-red-100"}`}
            >
              Unavailable
            </Button>
          </div>
        </div>

        {/* Image Upload (Only when Available) */}
        {availability === true && (
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Upload Images <span className="text-red-500">*</span>
              <span className="text-sm text-gray-500 ml-2">(Max 5 images, JPG/JPEG/PNG only)</span>
            </label>

            {/* Preview uploaded images */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-3">
                {images.map((img, index) => (
                  <div key={index} className="relative">
                    <img src={URL.createObjectURL(img)} alt={`Preview ${index + 1}`} className="h-24 w-full object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload button */}
            {images.length < 5 && (
              <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-4 bg-gray-50 hover:bg-gray-100 transition">
                <label className="flex flex-col items-center cursor-pointer">
                  <div className="text-3xl text-gray-400">⬆</div>
                  <p className="text-sm text-gray-500 mt-1">Click to upload images ({images.length}/5)</p>
                  <input type="file" accept="image/jpeg,image/jpg,image/png" multiple onChange={handleImageChange} hidden />
                </label>
              </div>
            )}
          </div>
        )}

        {/* Description */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            className="w-full border border-gray-300 rounded-lg p-3 h-32 resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Give us a description of your experience and the product / service."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={1000}
            required
          />
          <p className="text-xs text-gray-500 mt-1">{description.length}/1000 characters</p>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-900 text-white py-3 rounded-xl font-semibold hover:bg-blue-800 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Submitting..." : "Post Review"}
        </Button>

        <p className="text-sm text-gray-500 text-center">*Fields are compulsory</p>
      </form>
    </div>
  );
};

export default AddReview;
