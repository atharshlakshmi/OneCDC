import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { shops } from "../data/mockData";
import { Link } from 'react-router-dom';
import BackButton from "../components/BackButton";

const ViewShop: React.FC = () => {
  const { id } = useParams();
  const shop = shops.find((s) => s.id === Number(id));
  const items = shop ? shop.items : [];

  const [activeTab, setActiveTab] = useState<"info" | "catalogue">("info");

  if (!shop) return <p>Shop not found.</p>;

  // Function to add shop to cart
  const addShopToCart = () => {
    // Get current cart from localStorage
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");

    // Check if shop is already in cart
    if (!cart.find((s: any) => s.id === shop.id)) {
      cart.push({ id: shop.id, name: shop.name });
      localStorage.setItem("cart", JSON.stringify(cart));
      alert(`${shop.name} added to cart!`);
    } else {
      alert(`${shop.name} is already in your cart.`);
    }
  };

  return (
    <div >
      {/* Nav Bar */}
      <div className="page-nav">
        <BackButton />
        <h1 className="page-nav-title">{shop.name}</h1>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={activeTab === "info" ? "tab active" : "tab"}
          onClick={() => setActiveTab("info")}
        >
          Shop Info
        </button>
        <button
          className={activeTab === "catalogue" ? "tab active" : "tab"}
          onClick={() => setActiveTab("catalogue")}
        >
          Catalogue
        </button>
      </div>

      {/* Content */}
      {activeTab === "info" && (
        <div className = "list-container">
        <div className="list-card">
          <p>{shop.details}</p>
          <p>
            <strong>Address:</strong> {shop.address}
          </p>
          <p>
            <strong>Contact:</strong> {shop.contact_number}
          </p>
          <p>
            <strong>Operating Hours:</strong> {shop.operating_hours}
          </p>
        </div>
            <button className="add-cart-button" onClick={addShopToCart}>Add Shop to Cart</button>
        </div>
        
      )}

      {activeTab === "catalogue" && (
        <div className = "list-container">
          {items.map((item) => (
          <Link to={`/ViewItem/${item.id}`} key={item.id} className="list-card">
            <h2>{item.name}</h2>
            <p>{item.price}</p>
          </Link>))}
        </div>
      
      )
    }
    </div>
  );
}

export default ViewShop
