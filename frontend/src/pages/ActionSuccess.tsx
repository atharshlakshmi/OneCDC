import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

interface LocationState {
  message?: string;
  backPath?: string;
}

const ActionSuccess: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { message, backPath }: LocationState = location.state || {};

  const handleBack = () => {
    if (backPath) {
      navigate(backPath); // go to a specific path
    } else {
      navigate(-1); // go back one page
    }
  };

  return (
    <div className="review-page">
      {/* Success content */}
      <div className="review-form" style={{ textAlign: "center" }}>
        <h2 style={{ color: "#1e3a8a", marginBottom: "1rem" }}>
          {message || "Action completed successfully."}
        </h2>

        <button className="add-cart-button" onClick={handleBack}>
          Go Back
        </button>
      </div>
    </div>
  );
};

export default ActionSuccess;
