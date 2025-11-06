import mongoose, { Schema, Model } from "mongoose";
import { ICatalogue } from "../types";

/**
 * Catalogue Schema
 */
const CatalogueSchema = new Schema<ICatalogue>(
  {
    shop: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
      unique: true,
    },
    items: { type: [Schema.Types.ObjectId], ref: "Item", default: [] },
  },
  {
    timestamps: true,
    versionKey: false, // Disable __v field to match MongoDB validation schema
  }
);

/**
 * Indexes
 */
CatalogueSchema.index({ shop: 1 });
CatalogueSchema.index({ "items.name": "text", "items.description": "text" });
CatalogueSchema.index({ "items.availability": 1 });
CatalogueSchema.index({ "items.cdcVoucherAccepted": 1 });

/**
 * Catalogue Model
 */
export const Catalogue: Model<ICatalogue> = mongoose.model<ICatalogue>("Catalogue", CatalogueSchema);
