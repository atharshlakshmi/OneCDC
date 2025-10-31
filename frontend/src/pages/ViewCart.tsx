import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import PageHeader from "@/components/PageHeader"
import { Button } from "@/components/ui/button"

const ViewCart: React.FC = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<{ id: number; name: string }[]>([]);

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
  };

  if (cart.length === 0) {
    return (
      <div>
        <PageHeader title = "Your Cart" />
      <div className = "flex flex-col gap-5 items-center m-5 align-center justify-center">
        
        <h2 className="text-xl text-amber-400">Your cart is empty!</h2>
      </div>
      </div>
    );
  }

  return (
    <div>
      {/* Nav Bar */}
      <PageHeader title = "Your Cart" />

      {/* Cart List */}
      <div className = "flex flex-col gap-5 items-center m-5 align-center justify-center">
          {cart.map((shop) => (

          <Link to={`/ViewShop/${shop.id}`} key={shop.id} className="w-full rounded-2xl bg-white shadow-lg p-8 sm:p-10 flex flex-col gap-4 items-center text-center mx-auto">
              <h2 className="text-xl text-amber-400">{shop.name}</h2>
              <Button onClick={(e) => {
                  e.preventDefault();  // prevent default link navigation
                  e.stopPropagation(); // stop the click from reaching the Link
                  removeFromCart(shop.id);
                }} variant="outline" size="lg">Remove</Button>
            </Link>
          ))}
      </div>
    </div>
  );
};

export default ViewCart;
