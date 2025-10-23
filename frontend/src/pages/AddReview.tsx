import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { items } from "../data/mockData"; 
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";

const AddReview: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { itemId, userId } = location.state || {}; // 

  const item = items.find((i) => i.id === itemId);

  const [status, setStatus] = useState<"Available" | "Unavailable" | null>(null);
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setPhoto(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log({
      userId, // ✅ now captured
      itemId,
      item: item?.name,
      status,
      description,
      photo,
    });

    navigate("/ActionSuccess", {
      state: {
        message: "Review submitted successfully.",
        backPath: `/ViewItem/${item?.id}`,
      },
    });
  };

  if (!item) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500 text-lg">
        Item not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Page Header */}
      <PageHeader title="Add New Review" />

      {/* Form Container */}
      <form
        onSubmit={handleSubmit}
        className="max-w-xl mx-auto bg-white shadow-md rounded-2xl p-6 mt-6 space-y-6"
      >
        {/* Item Info */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Item Name
          </label>
          <p className="text-gray-900 font-semibold">{item.name}</p>
        </div>

        {/* Status */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Status Of Item <span className="text-red-500">*</span>
          </label>

          <div className="flex gap-4">
            <Button
              type="button"
              onClick={() => setStatus("Available")}
              className={`w-1/2 py-2 rounded-lg font-medium ${
                status === "Available"
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-green-100"
              }`}
            >
              Available
            </Button>

            <Button
              type="button"
              onClick={() => {
                setStatus("Unavailable");
                setPhoto(null);
              }}
              className={`w-1/2 py-2 rounded-lg font-medium ${
                status === "Unavailable"
                  ? "bg-red-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-red-100"
              }`}
            >
              Unavailable
            </Button>
          </div>
        </div>

        {/* Photo Upload (Only when Available) */}
        {status === "Available" && (
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Upload Photo/Video <span className="text-red-500">*</span>
            </label>

            <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-4 bg-gray-50 hover:bg-gray-100 transition">
              {photo ? (
                <img
                  src={URL.createObjectURL(photo)}
                  alt="Preview"
                  className="h-32 object-cover rounded-lg"
                />
              ) : (
                <label className="flex flex-col items-center cursor-pointer">
                  <div className="text-3xl text-gray-400">⬆</div>
                  <p className="text-sm text-gray-500 mt-1">
                    Click to upload a photo or video
                  </p>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handlePhotoChange}
                    hidden
                  />
                </label>
              )}
            </div>
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
            required
          />
        </div>

        {/* Submit */}
        <Button
          type="submit"
          className="w-full bg-blue-900 text-white py-3 rounded-xl font-semibold hover:bg-blue-800 transition"
        >
          Post Review
        </Button>

        <p className="text-sm text-gray-500 text-center">
          *Fields are compulsory
        </p>
      </form>
    </div>
  );
};

export default AddReview;
