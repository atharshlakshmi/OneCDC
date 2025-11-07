import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import { apiGet, apiPost } from "@/lib/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface Shop {
  id: string;
  name: string;
  details: string;
  address: string;
  contact_number: string;
  operating_hours: string;
}

const EditShop: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const shopId = location.state?.shopId;

  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    description: "",
    phone: "",
  });

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
        setFormData({
          name: response.name,
          address: response.address || "",
          description: response.details || "",
          phone: response.contact_number || "",
        });
      } catch (error: any) {
        console.error("Failed to fetch shop:", error);
        toast.error("Failed to load shop details");
      } finally {
        setLoading(false);
      }
    };

    fetchShop();
  }, [shopId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!shopId) {
      toast.error("Shop ID is missing");
      return;
    }

    setIsSubmitting(true);

    try {
      // Update shop using owner API
      await apiPost(`/owner/shops/${shopId}`, formData);

      toast.success("Shop updated successfully!");

      // Navigate back to shop view
      setTimeout(() => {
        navigate(`/ViewShop/${shopId}`);
      }, 500);
    } catch (error: any) {
      console.error("Failed to update shop:", error);
      toast.error(error.message || "Failed to update shop. Please try again.");
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

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <PageHeader title="Edit Shop Details" />

      <div className="max-w-xl mx-auto mt-8 bg-white shadow-lg rounded-2xl p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
          {shop.name}
        </h2>

        {/* Name */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">
            Shop Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">
            Description
          </label>
          <textarea
            name="description"
            rows={3}
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Phone */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-1">Phone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="e.g., 91234567"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-between mt-6">
          <button
            onClick={() => navigate(-1)}
            disabled={isSubmitting}
            className="bg-gray-200 text-gray-700 px-5 py-2 rounded-lg font-medium hover:bg-gray-300 transition disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className="bg-blue-900 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-800 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditShop;
