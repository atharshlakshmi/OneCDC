import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { items, reviews } from "../data/mockData";
import BackButton from "../components/BackButton";


const ViewItem: React.FC = () => {
  const { id } = useParams();
  const item = items.find((i) => i.id === Number(id));
  const itemReviews = reviews.filter((r) => r.itemId === Number(id)); // Use filter, not find
  const [activeTab, setActiveTab] = useState<"info" | "reviews">("info");

  if (!item) return <p>Item not found.</p>;
  if (!item) return <p className="item-not-found">Item not found.</p>;

  return (
    <div>
      {/* Nav Bar */}
      <div className="page-nav">
        <BackButton />
        <h1 className="page-nav-title">{item.name}</h1>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={activeTab === "info" ? "tab active" : "tab"}
          onClick={() => setActiveTab("info")}
        >
          Information
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
          <button className="add-cart-button">
  <Link to="/AddReview" state={{ itemId: item.id }}>
    Review Item
  </Link>
</button>
        </div>
      )}

      {activeTab === "reviews" && (
        <div className = "list-container">
          {itemReviews.map((review) => (
          <div key={review.id} className="list-card">
            <h2>{review.rating}</h2>
            <p>{review.comment}</p>
          </div>))}
        </div>
        )}
    </div>
  );
};

export default ViewItem;
