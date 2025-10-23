import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { items } from "../data/mockData"; // adjust path if needed
import PageHeader from "@/components/PageHeader"
import { Button } from "@/components/ui/button"

const AddReview: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { itemId } = location.state || {}; // get item id from navigation state
  const item = items.find((i) => i.id === itemId);

  const [status, setStatus] = useState<"Available" | "Unavailable" | null>(null);
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
      item: item?.name,
      status,
      description,
      photo,
    });
    navigate("/ActionSuccess", {
    state: {
        message: "Review submitted successfully.",
        backPath: `/ViewItem/${item.id}`,
  },
});

  };

  if (!item) return <p className="item-not-found">Item not found.</p>;

  return (
    <div className="review-page">
      {/* Page Navigation */}
      <PageHeader title="Add New Review" />

      {/* Form */}
      <form className="review-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Item Name</label>
          <p className="item-name">{item.name}</p>
        </div>

        <div className="form-group">
          <label>
            Status Of Item <span className="required">*</span>
          </label>
          <div className="status-buttons">
            <button
              type="button"
              className={`status-btn ${status === "Available" ? "active" : ""}`}
              onClick={() => setStatus("Available")}
            >
              Available
            </button>
            <button
              type="button"
              className={`status-btn ${status === "Unavailable" ? "active-unavailable" : ""}`}
              onClick={() => {
                setStatus("Unavailable");
                setPhoto(null); // clear photo when unavailable
              }}
            >
              Unavailable
            </button>
          </div>
        </div>

        {/* Only show upload if Available */}
        {status === "Available" && (
          <div className="form-group">
            <label>
              Upload Photo/Video <span className="required">*</span>
            </label>
            <div className="upload-container">
              {photo ? (
                <img
                  src={URL.createObjectURL(photo)}
                  alt="Preview"
                  className="preview-image"
                />
              ) : (
                <label className="upload-box">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handlePhotoChange}
                    hidden
                  />
                  <div className="upload-icon">⬆</div>
                </label>
              )}
            </div>
          </div>
        )}

        <div className="form-group">
          <label>
            Description <span className="required">*</span>
          </label>
          <textarea
            className="review-textarea"
            placeholder="Give us a description of your experience and the product / service."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <button type="submit" className="submit-review-btn">
          Post Review
        </button>

        <p className="required-note">*Fields Are Compulsory</p>
      </form>
    </div>
  );
};

export default AddReview;
