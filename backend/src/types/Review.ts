import { Document, Types } from "mongoose";

/**
 * Review Interface
 */
export interface IReview extends Document {
  shopper: Types.ObjectId;
  catalogue: Types.ObjectId;
  item: Types.ObjectId;
  rating: number;
  comment: string;
  photos: string[];
  availability: boolean;
  timestamp: Date;
  warnings: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
