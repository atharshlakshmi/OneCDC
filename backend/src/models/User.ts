import mongoose, { Schema, Model } from "mongoose";
import { IUser, IRegisteredShopper, IOwner, IAdmin, UserRole, IWarning } from "../types";

/**
 * Warning Sub-Schema
 */
const WarningSchema = new Schema<IWarning>(
  {
    reason: { type: String, required: true },
    issuedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    issuedAt: { type: Date, default: Date.now },
    relatedReport: { type: Schema.Types.ObjectId, ref: "Report" },
  },
  { _id: false }
);

/**
 * Base User Schema
 */
const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: true,
    },
    name: { type: String, required: true, trim: true },
    phone: {
      type: String,
      trim: true,
      match: [/^[689]\d{7}$/, "Please enter a valid Singapore phone number"],
    },
    isActive: { type: Boolean, default: true },
    warnings: { type: [WarningSchema], default: [] },
    singpassVerified: { type: Boolean, default: false },
    corppassVerified: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    discriminatorKey: "role",
    toJSON: {
      transform: function (_doc, ret) {
        const { passwordHash, ...rest } = ret;
        return rest;
      },
    },
  }
);

/**
 * Indexes for performance
 */
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });

/**
 * Base User Model
 */
export const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);

/**
 * Registered Shopper Schema
 */
const RegisteredShopperSchema = new Schema<IRegisteredShopper>({
  address: { type: String, trim: true },
  preferredLocation: {
    lat: { type: Number, min: -90, max: 90 },
    lng: { type: Number, min: -180, max: 180 },
  },
});

/**
 * Owner Schema
 */
const OwnerSchema = new Schema<IOwner>({
  businessRegistrationNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  shops: [{ type: Schema.Types.ObjectId, ref: "Shop" }],
  reportCount: { type: Number, default: 0, min: 0 },
});

/**
 * Admin Schema
 */
const AdminSchema = new Schema<IAdmin>({
  moderationActions: [{ type: Schema.Types.ObjectId, ref: "ModerationLog" }],
});

/**
 * Create Discriminators
 */
export const RegisteredShopper = User.discriminator<IRegisteredShopper>(UserRole.REGISTERED_SHOPPER, RegisteredShopperSchema);

export const Owner = User.discriminator<IOwner>(UserRole.OWNER, OwnerSchema);

export const Admin = User.discriminator<IAdmin>(UserRole.ADMIN, AdminSchema);
