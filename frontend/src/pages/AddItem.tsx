import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { shops } from "../data/mockData";

const AddItem: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId, shopID } = location.state || {}; 
  const shop = shops.find((s) => s.id === Number(shopID));

  // Form state
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setPhoto(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log({
      userId,
      itemName,
      category,
      description,
      photo,
    });

    navigate("/ActionSuccess", {
      state: {
        message: "Item added successfully.",
        backPath: "/MyItems",
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PageHeader title="Add New Item" />

      <form
        onSubmit={handleSubmit}
        className="flex flex-col max-w-xl mx-auto w-full bg-white rounded-2xl shadow-md mt-6 p-6 space-y-5"
      >
        {/* Item Name */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            You are adding an item to:
          </label>
          <p className="text-gray-900 font-semibold mb-2">{shop.name}</p>


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
          <label className="block font-medium text-gray-800">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            className="w-full appearance-none border border-gray-300 rounded-lg bg-gray-50 py-3 px-4 pr-10 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          >
            <option value="">Select a category</option>
            <option value="electronics">Electronics</option>
            <option value="books">Books</option>
            <option value="clothing">Clothing</option>
            <option value="furniture">Furniture</option>
            <option value="other">Other</option>
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

        {/* Upload Photo */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Upload Photo/Video <span className="text-red-500">*</span>
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition">
            {photo ? (
              <img
                src={URL.createObjectURL(photo)}
                alt="Preview"
                className="w-40 h-40 object-cover rounded-lg shadow"
              />
            ) : (
              <label className="flex flex-col items-center space-y-2 cursor-pointer">
                <div className="text-gray-500 text-3xl">⬆</div>
                <p className="text-sm text-gray-500">Click to upload photo/video</p>
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

        {/* Submit */}
        <Button
          type="submit"
          className="w-full py-3 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition font-medium"
        >
          Add Item
        </Button>

        <p className="text-xs text-gray-500 text-center">*All fields are required</p>
      </form>
    </div>
  );
};

export default AddItem;
