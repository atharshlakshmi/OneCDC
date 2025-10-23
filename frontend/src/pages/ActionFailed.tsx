import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

interface LocationState {
  message?: string;
  backPath?: string;
}

const ActionFailed: React.FC = () => {
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
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6">
      {/* Animated Error Card */}
      <div className="bg-white shadow-md rounded-2xl p-8 max-w-md w-full text-center space-y-6 animate-fadeIn">
        {/* Error Icon Animation */}
        <div className="flex justify-center">
          <div className="text-6xl text-red-500 animate-shake">
            ❌
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-red-700">
          {message || "Something went wrong."}
        </h2>

        <button
          onClick={handleBack}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-lg transition duration-200"
        >
          Go Back
        </button>
      </div>

      {/* Subtle red glow background */}
      <div className="absolute inset-0 flex justify-center items-center -z-10">
        <div className="w-48 h-48 bg-red-400/20 rounded-full blur-3xl animate-pulse"></div>
      </div>
    </div>
  );
};

export default ActionFailed;
