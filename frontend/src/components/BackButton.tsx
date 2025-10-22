// BackButton.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button"

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
    <Button variant="outline" onClick = {handleClick}> Back</Button>
  );
};

export default BackButton;
