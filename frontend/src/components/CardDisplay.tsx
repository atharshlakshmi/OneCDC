// src/components/CardDisplay.tsx
import React from "react";
import { Button } from "@/components/ui/button";

interface CardDisplayProps {
  title: string;
  subtitle?: string;
  availability?: boolean;
  content?: string;
  photos?: string[];
  details?: string;
  status?: string;
  date?: string;
  highlightColor?: string; // optional color accent
  onEdit?: () => void;
  onDelete?: () => void;
  disableActions?: boolean;
}

const CardDisplay: React.FC<CardDisplayProps> = ({
  title,
  subtitle,
  availability,
  content,
  photos,
  details,
  status,
  date,
  highlightColor = "bg-white",
  onEdit,
  onDelete,
  disableActions,
}) => {
  const resolved = status?.toLowerCase() === "resolved";
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
  const BASE_URL = API_BASE.replace("/api", ""); // Get base URL without /api

  return (
    <div className={`w-full max-w-3xl rounded-2xl shadow-lg p-6 sm:p-8 flex flex-col gap-4 items-center text-center transition-all duration-200 hover:shadow-xl ${highlightColor}`}>
      <h2 className="text-xl font-bold text-gray-800">{title}</h2>
      {subtitle && <p className="text-gray-600 text-base">{subtitle}</p>}

      {/* Availability */}
      <div className="flex items-center justify-center gap-4 flex-wrap">
        {availability !== undefined && (
          <span
            className={`px-4 py-1.5 rounded-full text-sm font-semibold ${
              availability ? "bg-green-100 text-green-700 border-2 border-green-300" : "bg-red-100 text-red-700 border-2 border-red-300"
            }`}
          >
            {availability ? "✓ Available" : "✗ Unavailable"}
          </span>
        )}
      </div>

      {content && <p className="text-gray-700 text-base leading-relaxed">{content}</p>}

      {/* Display photos if available */}
      {photos && photos.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {photos.map((photo, index) => {
            // Handle Base64, full URLs, or relative paths
            const photoUrl = photo.startsWith("data:") || photo.startsWith("http") ? photo : `${BASE_URL}${photo}`;
            console.log("Photo URL:", photoUrl); // Debug
            return (
              <img
                key={index}
                src={photoUrl}
                alt={`Review photo ${index + 1}`}
                className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                onError={(e) => {
                  // Fallback for broken images
                  console.error("Failed to load image:", photoUrl);
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            );
          })}
        </div>
      )}

      {details && <p className="text-gray-600 italic">{details}</p>}
      {date && <p className="text-gray-400 text-sm">Date: {date}</p>}

      {status && <p className={`font-medium ${resolved ? "text-green-600" : "text-yellow-600"}`}>Status: {status}</p>}

      {!disableActions && !resolved && (onEdit || onDelete) && (
        <div className="flex gap-3 mt-2">
          {onEdit && (
            <Button variant="outline" onClick={onEdit}>
              Edit
            </Button>
          )}
          {onDelete && (
            <Button variant="destructive" onClick={onDelete}>
              Delete
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default CardDisplay;
