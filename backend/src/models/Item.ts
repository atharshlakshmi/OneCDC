import mongoose, { Schema, Model } from "mongoose";
import { IItem } from "../types";

/**
 * Item Schema (standalone collection)
 */
const ItemSchema = new Schema<IItem>(
  {
    catalogue: {
      type: Schema.Types.ObjectId,
      ref: "Catalogue",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true, index: "text" },
    description: { type: String, required: true, trim: true, maxlength: 500 },
    price: { type: Number, min: 0 },
    availability: { type: Boolean, default: true },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: function (images: string[]) {
          return images.length <= 5;
        },
        message: "Maximum 5 images allowed per item",
      },
    },
    category: { type: String, trim: true },
    cdcVoucherAccepted: { type: Boolean, default: true },
    lastUpdatedDate: { type: Date, default: Date.now },
    lastUpdatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    reviews: {
      type: [{ type: Schema.Types.ObjectId, ref: "Review" }],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Indexes
 */
ItemSchema.index({ catalogue: 1 });
ItemSchema.index({ name: "text", description: "text" });
ItemSchema.index({ availability: 1 });
ItemSchema.index({ cdcVoucherAccepted: 1 });
ItemSchema.index({ category: 1 });

/**
 * Item Model
 */
export const Item: Model<IItem> = mongoose.model<IItem>("Item", ItemSchema);
