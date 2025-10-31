import mongoose, { Schema, Model } from 'mongoose';
import { ICatalogue, IItem, IReview } from '../types';
import {Shop} from './Shop';

/**
 * Review Sub-Schema
 */
const ReviewSchema = new Schema<IReview>({
  shopper: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true, trim: true, maxlength: 1000 },
  photos: {
    type: [String],
    default: [],
    validate: {
      validator: function (photos: string[]) {
        return photos.length <= 5;
      },
      message: 'Maximum 5 photos allowed per review',
    },
  },
  availability: { type: Boolean, required: true },
  timestamp: { type: Date, default: Date.now },
  warnings: { type: Number, default: 0, min: 0 },
  isActive: { type: Boolean, default: true },
});

/**
 * Item Sub-Schema
 */
/**
 * Item Sub-Schema
 */
const ItemSchema = new Schema<IItem>({
  shopId: { type: Schema.Types.ObjectId, ref: 'Shop', required: true },  
  name: { type: String, required: true, trim: true, index: 'text' },
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
      message: 'Maximum 5 images allowed per item',
    },
  },
  category: { type: String, trim: true },
  cdcVoucherAccepted: { type: Boolean, default: true },
  lastUpdatedDate: { type: Date, default: Date.now },
  lastUpdatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  reviews: { type: [ReviewSchema], default: [] },
});

/**
 * Catalogue Schema
 */
const CatalogueSchema = new Schema<ICatalogue>(
  {
    shop: {
      type: Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
      unique: true,
    },
    items: { type: [ItemSchema], default: [] },
  },
  {
    timestamps: true,
  }
);

/**
 * Indexes
 */
CatalogueSchema.index({ shop: 1 });
CatalogueSchema.index({ 'items.name': 'text', 'items.description': 'text' });
CatalogueSchema.index({ 'items.availability': 1 });
CatalogueSchema.index({ 'items.cdcVoucherAccepted': 1 });

/**
 * Virtual for average rating of an item
 */
ItemSchema.virtual('averageRating').get(function () {
  const activeReviews = this.reviews.filter((review) => review.isActive);
  if (activeReviews.length === 0) return 0;
  const sum = activeReviews.reduce((acc, review) => acc + review.rating, 0);
  return Math.round((sum / activeReviews.length) * 10) / 10;
});

/**
 * Virtual for review count
 */
ItemSchema.virtual('reviewCount').get(function () {
  return this.reviews.filter((review) => review.isActive).length;
});

/**
 * Catalogue Model
 */
export const Catalogue: Model<ICatalogue> = mongoose.model<ICatalogue>(
  'Catalogue',
  CatalogueSchema
);
