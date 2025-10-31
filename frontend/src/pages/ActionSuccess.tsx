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
      navigate(backPath);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col items-center justify-center px-6">
      {/* Animated Success Card */}
      <div className="bg-white shadow-md rounded-2xl p-8 max-w-md w-full text-center space-y-6 animate-fadeIn">
        {/* Thumbs-Up Animation */}
        <div className="flex justify-center">
          <div className="text-6xl text-green-500 animate-bounce-slow">
            👍
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-blue-900">
          {message || "Action completed successfully!"}
        </h2>

        <button
          onClick={handleBack}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition duration-200"
        >
          Go Back
        </button>
      </div>

      {/* Subtle pulse glow */}
      <div className="absolute inset-0 flex justify-center items-center -z-10">
        <div className="w-48 h-48 bg-green-400/20 rounded-full blur-3xl animate-pulse"></div>
      </div>
    </div>
  );
};

export default ActionSuccess;
