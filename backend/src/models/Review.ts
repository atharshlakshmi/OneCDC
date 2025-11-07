import mongoose, { Schema, Model } from "mongoose";
import { IReview } from "../types";

/**
 * Review Schema - Shopper-submitted item reviews
 */
const ReviewSchema = new Schema(
  {
    shopper: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    item: {
      type: Schema.Types.ObjectId,
      ref: "Item",
      required: true,
      index: true,
    },
    catalogue: {
      type: Schema.Types.ObjectId,
      ref: "Catalogue",
      required: true,
      index: true,
    },
    shop: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    availability: {
      type: Boolean,
      required: true,
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: function (images: string[]) {
          return images.length <= 10;
        },
        message: "Maximum 10 images allowed per review",
      },
    },
    warnings: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Indexes
 */
ReviewSchema.index({ shopper: 1 });
ReviewSchema.index({ catalogue: 1 });
ReviewSchema.index({ shop: 1 });
ReviewSchema.index({ item: "text", description: "text" });
ReviewSchema.index({ availability: 1 });
ReviewSchema.index({ isActive: 1 });

/**
 * Review Model
 */
export const Review: Model<IReview> = mongoose.model<IReview>("Review", ReviewSchema);
