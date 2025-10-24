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
  onEdit,
  onDelete,
  disableActions,
}) => {
  const resolved = status?.toLowerCase() === "resolved";

  return (
    <div
      className={`w-full sm:w-3/4 rounded-2xl shadow-lg p-8 sm:p-10 flex flex-col gap-3 items-center text-center transition-all duration-200 ${highlightColor}`}
    >
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
  );
};

export default CardDisplay;
