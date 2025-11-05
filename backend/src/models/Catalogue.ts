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
    items: [{ type: Schema.Types.ObjectId, ref: "Item" }],
  },
  {
    timestamps: true,
  }
);

// Indexes
CatalogueSchema.index({ shop: 1 });

// Export model
export const Catalogue: Model<ICatalogue> = mongoose.model<ICatalogue>("Catalogue", CatalogueSchema);
