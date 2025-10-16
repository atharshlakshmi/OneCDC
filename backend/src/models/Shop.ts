import mongoose, { Schema, Model } from 'mongoose';
import { IShop, IOperatingHours, ShopCategory } from '../types';

/**
 * Operating Hours Sub-Schema
 */
const OperatingHoursSchema = new Schema<IOperatingHours>(
  {
    dayOfWeek: { type: Number, required: true, min: 0, max: 6 },
    openTime: {
      type: String,
      required: true,
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:mm)'],
    },
    closeTime: {
      type: String,
      required: true,
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:mm)'],
    },
    isClosed: { type: Boolean, default: false },
  },
  { _id: false }
);

/**
 * Shop Schema
 */
const ShopSchema = new Schema<IShop>(
  {
    name: { type: String, required: true, trim: true, index: 'text' },
    description: { type: String, required: true, trim: true, index: 'text' },
    address: { type: String, required: true, trim: true },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: function (coords: number[]) {
            return (
              coords.length === 2 &&
              coords[0] >= -180 &&
              coords[0] <= 180 &&
              coords[1] >= -90 &&
              coords[1] <= 90
            );
          },
          message: 'Invalid coordinates',
        },
      },
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      match: [/^[689]\d{7}$/, 'Please enter a valid Singapore phone number'],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    category: {
      type: String,
      enum: Object.values(ShopCategory),
      required: true,
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: function (images: string[]) {
          return images.length <= 10;
        },
        message: 'Maximum 10 images allowed',
      },
    },
    operatingHours: { type: [OperatingHoursSchema], default: [] },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    verifiedByOwner: { type: Boolean, default: false },
    reportCount: { type: Number, default: 0, min: 0 },
    warnings: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
    lastUpdatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

/**
 * Indexes for performance
 */
ShopSchema.index({ location: '2dsphere' });
ShopSchema.index({ name: 'text', description: 'text' });
ShopSchema.index({ category: 1 });
ShopSchema.index({ owner: 1 });
ShopSchema.index({ isActive: 1 });
ShopSchema.index({ verifiedByOwner: 1 });

/**
 * Virtual for calculating if shop is currently open
 */
ShopSchema.virtual('isCurrentlyOpen').get(function () {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now
    .getMinutes()
    .toString()
    .padStart(2, '0')}`;

  const todayHours = this.operatingHours.find(
    (hours) => hours.dayOfWeek === dayOfWeek
  );

  if (!todayHours || todayHours.isClosed) {
    return false;
  }

  return currentTime >= todayHours.openTime && currentTime <= todayHours.closeTime;
});

/**
 * Shop Model
 */
export const Shop: Model<IShop> = mongoose.model<IShop>('Shop', ShopSchema);
