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
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    passwordHash: {
      type: String,
      required: function (this: any): boolean {
        return this.authProvider === "local";
      },
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerifiedAt: {
      type: Date,
      default: null,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: true,
    },
    name: { type: String, required: true, trim: true },
    phone: {
      type: String,
      trim: true,
      set: (v: string | undefined) => {
        if (!v) return v;
        const digits = v.replace(/\D/g, "");
        return digits.replace(/^65/, "");
      },
      validate: {
        validator: (v: string | undefined) => {
          if (!v) return true; // allow empty
          return /^[89]\d{7}$/.test(v); // must be 8 digits starting with 8 or 9
        },
        message: "Phone number not valid", // 🔹 clear message
      },
    },

    gender: {
      type: String,
      enum: ["male", "female", "other", ""],
      default: "",
    },
    address: {
      type: String,
      trim: true,
      default: "",
    },

    avatarUrl: { type: String, trim: true, default: "" },

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
