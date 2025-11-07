// src/components/CardDisplay.tsx
import React from "react";
import { Button } from "@/components/ui/button";

interface CardDisplayProps {
  title: string;
  subtitle?: string;
  rating?: number;
  content?: string;
  details?: string;
  status?: string;
  date?: string;
  highlightColor?: string; // optional color accent
  images?: string[]; // array of image URLs
  onEdit?: () => void;
  onDelete?: () => void;
  disableActions?: boolean;
}

const CardDisplay: React.FC<CardDisplayProps> = ({
  title,
  subtitle,
  rating,
  content,
  details,
  status,
  date,
  highlightColor = "bg-white",
  images,
  onEdit,
  onDelete,
  disableActions,
}) => {
  const resolved = status?.toLowerCase() === "resolved";

  const hasImages = images && images.length > 0;

  return (
    <div
      className={`w-full sm:w-3/4 rounded-2xl shadow-lg p-4 sm:p-10 transition-all duration-200 ${highlightColor}`}
    >
      <div className={`flex ${hasImages ? 'flex-row gap-6' : 'flex-col'} items-start`}>
        {/* Left side - Content */}
        <div className={`flex flex-col gap-3 ${hasImages ? 'flex-1' : 'w-full items-center text-center'}`}>
          <h2 className="text-lg font-semibold">{title}</h2>
          {subtitle && <p className="text-gray-500 text-sm">{subtitle}</p>}
          {rating && <p className="text-yellow-500">⭐ {rating}/5</p>}
          {content && <p className="text-gray-700">{content}</p>}
          {details && <p className="text-gray-600 italic">{details}</p>}
          {date && <p className="text-gray-400 text-sm">Date: {date}</p>}

          {status && (
            <p
              className={`font-medium ${
                resolved ? "text-green-600" : "text-yellow-600"
              }`}
            >
              Status: {status}
            </p>
          )}

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

        {/* Right side - Images */}
        {hasImages && (
          <div className="flex-1 flex flex-col gap-3">
            {images.map((imageUrl, index) => (
              <div key={index} className="w-full h-48 rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={imageUrl}
                  alt={`Review image ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Image+Not+Available';
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CardDisplay;
