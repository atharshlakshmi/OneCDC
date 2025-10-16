// BackButton.tsx
import React from "react";
import { useNavigate } from "react-router-dom";

interface BackButtonProps {
  to?: string; // optional path to navigate
}

const BackButton: React.FC<BackButtonProps> = ({ to }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <button className="back-button" onClick={handleClick}>
      ← Back
    </button>
  );
};

export default BackButton;
