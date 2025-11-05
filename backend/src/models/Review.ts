import mongoose, { Schema, Model } from "mongoose";
import { IReview } from "../types";

const ReviewSchema = new Schema<IReview>(
  {
    shopper: { type: Schema.Types.ObjectId, ref: "User", required: true },
    catalogue: { type: Schema.Types.ObjectId, ref: "Catalogue", required: true },
    item: { type: Schema.Types.ObjectId, ref: "Item", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true, maxlength: 1000 },
    photos: {
      type: [String],
      default: [],
      validate: {
        validator: function (photos: string[]) {
          return photos.length <= 5;
        },
        message: "Maximum 5 photos allowed per review",
      },
    },
    availability: { type: Boolean, required: true },
    timestamp: { type: Date, default: Date.now },
    warnings: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

// Indexes
ReviewSchema.index({ shopper: 1 });
ReviewSchema.index({ catalogue: 1 });
ReviewSchema.index({ item: 1 });
ReviewSchema.index({ isActive: 1 });
ReviewSchema.index({ rating: 1 });

export const Review: Model<IReview> = mongoose.model<IReview>("Review", ReviewSchema);
