import mongoose, { Schema, Model, Types } from 'mongoose';

/**
 * Review Interface for standalone model
 */
export interface IReviewDocument extends mongoose.Document {
  shopper: Types.ObjectId;
  item: string; // Using item name as identifier
  catalogue: Types.ObjectId;
  shop: Types.ObjectId;
  description: string;
  availability: boolean;
  images: string[];
  warnings: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Instance methods
  addWarning(): Promise<this>;
  deactivate(): Promise<this>;
  activate(): Promise<this>;
}

/**
 * Review Model Interface with Static Methods
 */
interface IReviewModel extends Model<IReviewDocument> {
  getShopperReviews(shopperId: Types.ObjectId): Promise<IReviewDocument[]>;
  getShopReviews(shopId: Types.ObjectId): Promise<IReviewDocument[]>;
  getItemReviews(itemName: string): Promise<IReviewDocument[]>;
}

/**
 * Review Schema
 * Represents user reviews for catalogue items as a standalone collection
 */
const ReviewSchema = new Schema<IReviewDocument>(
  {
    shopper: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    item: {
      type: String, // Using item name as identifier
      required: true,
    },
    catalogue: {
      type: Schema.Types.ObjectId,
      ref: 'Catalogue',
      required: true,
    },
    shop: {
      type: Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    availability: {
      type: Boolean,
      required: true,
    },
    images: [
      {
        type: String,
      },
    ],
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
    timestamps: true, // Adds createdAt and updatedAt
  }
);

/**
 * Indexes
 */
ReviewSchema.index({ item: 1, isActive: 1 }); // Get reviews for an item
ReviewSchema.index({ shopper: 1, isActive: 1 }); // Get reviews by a shopper
ReviewSchema.index({ catalogue: 1, isActive: 1 }); // Get reviews for a catalogue
ReviewSchema.index({ shop: 1, isActive: 1 }); // Get reviews for a shop
ReviewSchema.index({ availability: 1 }); // Filter by availability
ReviewSchema.index({ createdAt: -1 }); // Sort by date (newest first)

// Compound index for uniqueness
ReviewSchema.index({ item: 1, shopper: 1 }, { unique: true }); // One review per item per shopper

/**
 * Instance Methods
 */

/**
 * Add warning to review
 */
ReviewSchema.methods.addWarning = function () {
  this.warnings += 1;
  return this.save();
};

/**
 * Deactivate review (soft delete)
 */
ReviewSchema.methods.deactivate = function () {
  this.isActive = false;
  return this.save();
};

/**
 * Activate review
 */
ReviewSchema.methods.activate = function () {
  this.isActive = true;
  return this.save();
};

/**
 * Static Methods
 */

/**
 * Get reviews for a shopper
 */
ReviewSchema.statics.getShopperReviews = async function (shopperId: Types.ObjectId) {
  return this.find({ shopper: shopperId, isActive: true })
    .populate('shop', 'name')
    .sort({ createdAt: -1 });
};

/**
 * Get reviews for a shop
 */
ReviewSchema.statics.getShopReviews = async function (shopId: Types.ObjectId) {
  return this.find({ shop: shopId, isActive: true })
    .populate('shopper', 'name')
    .sort({ createdAt: -1 });
};

/**
 * Get reviews for an item
 */
ReviewSchema.statics.getItemReviews = async function (itemName: string) {
  return this.find({ item: itemName, isActive: true })
    .populate('shopper', 'name email')
    .sort({ createdAt: -1 });
};

/**
 * Pre-save validation
 */
ReviewSchema.pre('save', function (next) {
  // Images only allowed if item is marked as available
  if (!this.availability && this.images && this.images.length > 0) {
    throw new Error('Images can only be included when the item is marked as available');
  }

  // Validate images array length when available
  if (this.availability && this.images && this.images.length > 5) {
    throw new Error('Maximum 5 images allowed per review');
  }

  // Unique index on { item, shopper } will handle duplicate prevention automatically

  next();
});

/**
 * Review Model
 */
export const Review = mongoose.model<IReviewDocument, IReviewModel>('Review', ReviewSchema);
