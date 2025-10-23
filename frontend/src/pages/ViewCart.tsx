import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import BackButton from "../components/PageHeader";

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
      <div className="list-container">
        <BackButton />
        <h1>Your Cart is Empty</h1>
      </div>
    );
  }

  return (
    <div>
      {/* Nav Bar */}
      <div className="page-nav">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1 className="page-nav-title">Shopping Cart</h1>
      </div>

      {/* Cart List */}
      <div className="list-container">
          {cart.map((shop) => (
          <Link to={`/ViewShop/${shop.id}`} key={shop.id} className="list-card">
              {shop.name}
              <button
                className="add-cart-button"
                style={{ marginLeft: "1rem" }}
                onClick={(e) => {
                  e.preventDefault();  // prevent default link navigation
                  e.stopPropagation(); // stop the click from reaching the Link
                  removeFromCart(shop.id);
                }}
              >
                Remove
              </button>
            </Link>
          ))}
      </div>
    </div>
  );
};

export default ViewCart;
