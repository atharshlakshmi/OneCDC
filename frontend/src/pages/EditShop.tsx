import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import { shops } from "../data/mockData";

const EditShop: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // shopId passed from "View Shop" page via state: navigate("/EditShop", { state: { shopId } })
  const shopId = location.state?.shopId;
  const shop = shops.find((s) => s.id === shopId);

  // Handle invalid shop
  if (!shop) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-600">
          <p className="text-lg font-medium">Shop not found.</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-3 text-blue-600 hover:underline"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Editable fields
  const [formData, setFormData] = useState({
    name: shop.name,
    address: shop.address || "",
    description: shop.details || "",
    contact: shop.contact_number || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    alert(`✅ Updated shop #${shopId} details successfully!`);
    navigate(-1); // Go back to previous page (e.g., View Shop)
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <PageHeader title="Edit Shop Details" />

      <div className="max-w-xl mx-auto mt-8 bg-white shadow-lg rounded-2xl p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
          {shop.name}
        </h2>

        {/* Name */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">Shop Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none"
          />
        </div>

        {/* Address */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">Address</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none"
          />
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">Description</label>
          <textarea
            name="description"
            rows={3}
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none"
          />
        </div>

        {/* Contact */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-1">Contact</label>
          <input
            type="text"
            name="contact"
            value={formData.contact}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-between mt-6">
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-200 text-gray-700 px-5 py-2 rounded-lg font-medium hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-900 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-800 transition"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditShop;
