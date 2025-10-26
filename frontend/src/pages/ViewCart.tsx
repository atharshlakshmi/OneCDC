import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";

const ViewCart: React.FC = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<{ id: number; name: string }[]>([]);
  const [selectedShops, setSelectedShops] = useState<number[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(storedCart);
  }, []);

  // Remove shop from cart
  const removeFromCart = (id: number) => {
    const updatedCart = cart.filter((s) => s.id !== id);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    setSelectedShops((prev) => prev.filter((shopId) => shopId !== id));
  };

  // Toggle selection
  const toggleSelectShop = (id: number) => {
    setSelectedShops((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  };

  const generateMER = () => {
  if (selectedShops.length === 0) {
    alert("Please select at least one shop to generate a path.");
    return;
  }

  // find full shop info for selected shops
  const selectedShopObjects = cart.filter((s) => selectedShops.includes(s.id));

  navigate("/MER", { state: { selectedShops: selectedShopObjects } });
};

  if (cart.length === 0) {
    return (
      <div>
        <PageHeader title="Your Cart" />
        <div className="flex flex-col gap-5 items-center m-5 align-center justify-center">
          <h2 className="text-xl text-amber-400">Your cart is empty!</h2>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Your Cart" />

      {/* Cart List */}
      <div className="flex flex-col gap-5 items-center m-5 align-center justify-center">
        {cart.map((shop) => {
          const isSelected = selectedShops.includes(shop.id);
          return (
            <div
              key={shop.id}
              className={`relative w-full rounded-2xl bg-white shadow-lg p-8 sm:p-10 flex flex-col gap-4 items-center text-center mx-auto transition-all duration-200 ${
                isSelected ? "ring-2 ring-amber-400" : ""
              }`}
            >
              {/* Checkbox on the right corner */}
              <input type="checkbox" checked={isSelected} onChange={() => toggleSelectShop(shop.id)} className="absolute top-5 right-5 w-5 h-5 accent-amber-400 cursor-pointer" />

              {/* Shop Name */}
              <Link to={`/ViewShop/${shop.id}`} className="text-xl text-amber-400 hover:underline">
                {shop.name}
              </Link>

              {/* Remove Button */}
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  removeFromCart(shop.id);
                }}
                variant="outline"
                size="sm"
              >
                Remove
              </Button>
            </div>
          );
        })}

        {/* ✅ Generate Path Button */}
        <Button
          onClick={generateMER}
          size="lg"
          disabled={selectedShops.length === 0}
          className={`mt-6 px-8 py-3 rounded-lg shadow-md text-white ${selectedShops.length === 0 ? "bg-gray-300 cursor-not-allowed" : "bg-amber-400 hover:bg-amber-500"}`}
        >
          Generate Path
        </Button>
      </div>
    </div>
  );
};

export default ViewCart;
