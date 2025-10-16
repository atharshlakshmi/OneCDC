import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import type { Shop } from '../types/api';

const ViewShop: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"info" | "catalogue">("info");

  useEffect(() => {
    if (!id) return;

    // Fetch shop details from API
    api.getShop(id)
      .then((data) => {
        setShop(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch shop:', err);
        setError(err.message || 'Failed to load shop details');
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <p style={{ textAlign: 'center', padding: '20px' }}>Loading shop details...</p>;
  }

  if (error || !shop) {
    return <p style={{ textAlign: 'center', padding: '20px', color: 'red' }}>
      {error || 'Shop not found.'}
    </p>;
  }

  const items = shop.items || [];

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
        <button className="back-button" onClick={() => navigate(-1)}>
          ←
        </button>
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
            <h3>{item.name}</h3>
            <p>{item.price}</p>
          </Link>))}
        </div>
      
      )
    }
    </div>
  );
}

export default ViewShop
