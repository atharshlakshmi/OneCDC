import mongoose, { Schema, Model } from 'mongoose';
import { IItem } from '../types';

/**
 * Item Schema
 */
const ItemSchema = new Schema<IItem>(
  {
    catalogue: { type: Schema.Types.ObjectId, ref: 'Catalogue', required: true },
    name: { type: String, required: true, trim: true, index: 'text' },
    description: { type: String, required: true, trim: true, maxlength: 500 },
    price: { type: Number, required: true, min: 0 },
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
    reviews: [{ type: Schema.Types.ObjectId, ref: 'Review' }],
  },
  {
    timestamps: true,
  }
);

/**
 * Indexes
 */
ItemSchema.index({ name: 'text', description: 'text' });
ItemSchema.index({ availability: 1 });
ItemSchema.index({ cdcVoucherAccepted: 1 });

/**
 * Note: averageRating and reviewCount need to be calculated by populating
 * the reviews and aggregating, or by querying the Review model directly.
 * These virtuals are removed since reviews are now stored as references.
 */

/**
 * Item Model
 */
export const Item: Model<IItem> = mongoose.model<IItem>('Item', ItemSchema);
