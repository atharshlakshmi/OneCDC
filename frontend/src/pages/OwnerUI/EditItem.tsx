import React, { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";

const EditItem: React.FC = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const itemData = location.state?.item;

  const [name, setName] = useState(itemData?.name || "");
  const [price, setPrice] = useState(itemData?.price || "");
  const [status, setStatus] = useState(itemData?.status || "Available");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Updated item:", { id, name, price, status });
    alert("Item details updated successfully!");
    navigate(-1);
  };

  if (!itemData) return <p>Item data not found.</p>;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <PageHeader title="Edit Item" />

      <form
        onSubmit={handleSubmit}
        className="max-w-md mx-auto bg-white shadow-lg rounded-2xl p-8 mt-8 flex flex-col gap-4"
      >
        <label className="flex flex-col text-left">
          <span className="font-medium mb-1">Item Name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-orange-400"
          />
        </label>

        <label className="flex flex-col text-left">
          <span className="font-medium mb-1">Price</span>
          <input
            type="text"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-orange-400"
          />
        </label>
        <div className="space-y-2">
          <label className="block font-medium text-gray-800">
          <span className="font-medium mb-1">Status</span></label>
          <div className="relative">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              required
              className="w-full appearance-none border border-gray-300 rounded-lg bg-gray-50 py-3 px-4 pr-10 text-gray-700 focus:ring-1 focus:ring-orange-400 outline-none transition-all"
            >
              <option value="Available">Available</option>
            <option value="Not available">Not available</option>
            </select>

            {/* Down arrow icon */}
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
          <Button variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </div>
  );
};

export default EditItem;
