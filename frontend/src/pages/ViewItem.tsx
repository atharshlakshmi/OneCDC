import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from '../services/api';
import type { Item, Review } from '../types/api';

const ViewItem: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState<Item | null>(null);
  const [itemReviews, setItemReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"info" | "reviews">("info");

  useEffect(() => {
    if (!id) return;

    // Fetch both item details and reviews in parallel
    Promise.all([
      api.getItem(id),
      api.getItemReviews(id)
    ])
      .then(([itemData, reviewsData]) => {
        setItem(itemData);
        setItemReviews(reviewsData);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch item:', err);
        setError(err.message || 'Failed to load item details');
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <p style={{ textAlign: 'center', padding: '20px' }}>Loading item details...</p>;
  }

  if (error || !item) {
    return <p style={{ textAlign: 'center', padding: '20px', color: 'red' }}>
      {error || 'Item not found.'}
    </p>;
  }

  return (
    <div>
      {/* Nav Bar */}
      <div className="page-nav">
        <button className="back-button" onClick={() => navigate(-1)}>
          ←
        </button>
        <h1 className="page-nav-title">{item.name}</h1>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={activeTab === "info" ? "tab active" : "tab"}
          onClick={() => setActiveTab("info")}
        >
          Info
        </button>
        <button
          className={activeTab === "reviews" ? "tab active" : "tab"}
          onClick={() => setActiveTab("reviews")}
        >
          Reviews
        </button>
      </div>

      {/* Content */}
      {activeTab === "info" && (
        <div className = "list-container">
        <div className="list-card">
          <p>{item.name}</p>
          <p>
            <strong>Price:</strong> {item.price}
          </p>
          </div>
          <button className="add-cart-button">Review Item</button>
        </div>
      )}

      {activeTab === "reviews" && (
        <div className = "list-container">
          {itemReviews.map((review) => (
          <div key={review.id} className="list-card">
            <h3>{review.rating}</h3>
            <p>{review.comment}</p>
          </div>))}
        </div>
        )}
    </div>
  );
};

export default ViewItem;
