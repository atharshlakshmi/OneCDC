import mongoose, { Schema, Model, Document } from "mongoose";
import { IItem } from "../types/item";

// Method interface
interface IItemMethods {
  getAverageRating(): Promise<number>;
  getReviewCount(): Promise<number>;
}

// Document interface
interface IItemDocument extends Omit<IItem, keyof Document>, Document, IItemMethods {}

// Model type
type ItemModel = Model<IItemDocument, {}, IItemMethods>;

// Schema definition
const ItemSchema = new Schema(
  {
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
    reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
    catalogue: { type: Schema.Types.ObjectId, ref: "Catalogue", required: true },
  },
  {
    timestamps: true,
  }
);

// Indexes
ItemSchema.index({ name: "text", description: "text" });
ItemSchema.index({ catalogue: 1 });
ItemSchema.index({ availability: 1 });
ItemSchema.index({ cdcVoucherAccepted: 1 });
ItemSchema.index({ category: 1 });

// Instance methods
ItemSchema.methods.getAverageRating = async function (): Promise<number> {
  const reviews = await mongoose.model("Review").find({ item: this._id, isActive: true });
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc: number, review: any) => acc + review.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
};

ItemSchema.methods.getReviewCount = async function (): Promise<number> {
  return await mongoose.model("Review").countDocuments({ item: this._id, isActive: true });
};

export const Item: ItemModel = mongoose.model<IItemDocument, ItemModel>("Item", ItemSchema);
