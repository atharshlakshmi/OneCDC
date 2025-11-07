import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { apiGet, apiPost } from "@/lib/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface Item {
  id: string;
  name: string;
  description?: string;
  price: number;
  catalogueId: string;
  shopId: string;
  shopName: string;
}

const EditItem: React.FC = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const itemDataFromState = location.state?.item;

  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [availability, setAvailability] = useState(true);

  // Fetch item details if not passed via state
  useEffect(() => {
    const fetchItem = async () => {
      if (itemDataFromState) {
        setItem(itemDataFromState);
        setName(itemDataFromState.name || "");
        setDescription(itemDataFromState.description || "");
        setPrice(itemDataFromState.price?.toString() || "");
        setLoading(false);
        return;
      }

      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const response = await apiGet<Item>(`/items/${id}`);
        setItem(response);
        setName(response.name || "");
        setDescription(response.description || "");
        setPrice(response.price?.toString() || "");
      } catch (error: any) {
        console.error("Failed to fetch item:", error);
        toast.error("Failed to load item details");
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id, itemDataFromState]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!item) {
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

      // Update item using owner API
      await apiPost(`/owner/shops/${item.shopId}/catalogue/${item.id}`, updates);

      toast.success("Item updated successfully!");

      // Navigate back
      setTimeout(() => {
        navigate(`/ViewItem/${item.id}`);
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

  if (!item) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500 text-lg">
        Item not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <PageHeader title="Edit Item" />

      <form
        onSubmit={handleSubmit}
        className="max-w-md mx-auto bg-white shadow-lg rounded-2xl p-8 mt-8 flex flex-col gap-4"
      >
        <div>
          <p className="text-sm text-gray-500 mb-4">
            Editing item from: <span className="font-semibold">{item.shopName}</span>
          </p>
        </div>

        <label className="flex flex-col text-left">
          <span className="font-medium mb-1">Item Name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </label>

        <label className="flex flex-col text-left">
          <span className="font-medium mb-1">Description</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </label>

        <label className="flex flex-col text-left">
          <span className="font-medium mb-1">Price</span>
          <input
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </label>

        <div className="space-y-2">
          <label className="block font-medium text-gray-800">
            <span className="font-medium mb-1">Availability</span>
          </label>
          <div className="relative">
            <select
              value={availability ? "true" : "false"}
              onChange={(e) => setAvailability(e.target.value === "true")}
              required
              className="w-full appearance-none border border-gray-300 rounded-lg bg-gray-50 py-3 px-4 pr-10 text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            >
              <option value="true">Available</option>
              <option value="false">Not Available</option>
            </select>

            <svg
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        <div className="flex gap-4 justify-center mt-4">
          <Button variant="outline" onClick={() => navigate(-1)} type="button">
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditItem;
