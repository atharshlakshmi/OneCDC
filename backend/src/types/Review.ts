import { Document, Types } from "mongoose";

/**
 * Review Interface
 */
export interface IReview extends Document {
  shopper: Types.ObjectId;
  item: Types.ObjectId;
  catalogue: Types.ObjectId;
  shop: Types.ObjectId;
  description: string;
  availability: boolean;
  images: string[];
  warnings: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
