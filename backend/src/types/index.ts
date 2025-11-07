import { Request } from "express";
import { Document, Types } from "mongoose";

/**
 * User Role Types
 */
export enum UserRole {
  GUEST = "guest",
  REGISTERED_SHOPPER = "registered_shopper",
  OWNER = "owner",
  ADMIN = "admin",
}

/**
 * Shop Category Types
 */
export enum ShopCategory {
  FOOD_BEVERAGE = "food_beverage",
  GROCERY = "grocery",
  HEALTHCARE = "healthcare",
  RETAIL = "retail",
  SERVICES = "services",
  ELECTRONICS = "electronics",
  FASHION = "fashion",
  OTHER = "other",
}

/**
 * Transport Mode for Route Planning
 */
export enum TransportMode {
  WALKING = "walking",
  DRIVING = "driving",
  TRANSIT = "transit",
}

/**
 * Report Category Types
 */
export enum ReportCategory {
  SPAM = "spam",
  OFFENSIVE = "offensive",
  MISLEADING = "misleading",
  FALSE_INFORMATION = "false_information",
}

/**
 * Report Status
 */
export enum ReportStatus {
  PENDING = "pending",
  REVIEWED = "reviewed",
  RESOLVED = "resolved",
  DISMISSED = "dismissed",
  REVIEW_REMOVED = "review_removed",
}

/**
 * Moderation Action Types
 */
export enum ModerationAction {
  REMOVE_REVIEW = "remove_review",
  APPROVE_REVIEW = "approve_review",
  WARN_USER = "warn_user",
  REMOVE_USER = "remove_user",
  WARN_SHOP = "warn_shop",
  APPROVE_SHOP = "approve_shop",
}

/**
 * Base User Interface
 */
export type UserAuthProvider = "local" | "google";
export interface IUser extends Document {
  email: string;
  passwordHash: string;
  role: UserRole;
  name: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  authProvider: UserAuthProvider; // "local" | "google"
  emailVerified: boolean;
  emailVerifiedAt: Date | null;
  warnings: IWarning[];
  singpassVerified?: boolean;
  corppassVerified?: boolean;

  avatarUrl?: string;
  gender?: "male" | "female" | "other" | "";
  address?: string;
}

/**
 * Registered Shopper Interface
 */
export interface IRegisteredShopper extends IUser {
  role: UserRole.REGISTERED_SHOPPER;
  address?: string;
  preferredLocation?: {
    lat: number;
    lng: number;
  };
}

/**
 * Owner Interface
 */
export interface IOwner extends IUser {
  role: UserRole.OWNER;
  businessRegistrationNumber: string;
  shops: Types.ObjectId[];
  reportCount: number;
}

/**
 * Admin Interface
 */
export interface IAdmin extends IUser {
  role: UserRole.ADMIN;
  moderationActions: Types.ObjectId[];
}

/**
 * Warning Interface
 */
export interface IWarning {
  reason: string;
  issuedBy: Types.ObjectId;
  issuedAt: Date;
  relatedReport?: Types.ObjectId;
}

/**
 * Shop Interface
 */
export interface IShop extends Document {
  name: string;
  description: string;
  address: string;
  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  phone: string;
  email?: string;
  category: ShopCategory;
  images: string[];
  operatingHours: IOperatingHours[];
  owner: Types.ObjectId;
  catalogue?: Types.ObjectId;
  verifiedByOwner: boolean;
  reportCount: number;
  warnings: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastUpdatedBy?: Types.ObjectId;
}

/**
 * Operating Hours Interface
 */
export interface IOperatingHours {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  openTime: string; // HH:mm format
  closeTime: string; // HH:mm format
  isClosed: boolean;
}

/**
 * Catalogue Interface - Now stores Item ID references
 */
export interface ICatalogue extends Document {
  shop: Types.ObjectId;
  items: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Item Interface - Now a standalone document
 */
export interface IItem extends Document {
  _id: Types.ObjectId;
  catalogue: Types.ObjectId;
  name: string;
  description: string;
  price?: number;
  availability: boolean;
  images: string[];
  category?: string;
  cdcVoucherAccepted: boolean;
  lastUpdatedDate: Date;
  lastUpdatedBy: Types.ObjectId;
  reviews: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Review Interface
 */
export interface IReview {
  _id: Types.ObjectId;
  shopper: Types.ObjectId;
  rating: number; // 1-5
  comment: string;
  photos: string[];
  availability: boolean;
  timestamp: Date;
  warnings: number;
  isActive: boolean;
}

/**
 * Shopping Cart Interface
 */
export interface IShoppingCart extends Document {
  shopper: Types.ObjectId;
  items: ICartItem[];
  createdAt: Date;
  updatedAt: Date;
  addShopWithTag(shopId: string, tag: string): Promise<this>;
  removeShop(shopId: string): Promise<this>;
}

/**
 * Cart Item Interface
 */
export interface ICartItem {
  shop: Types.ObjectId;
  itemTags: string[]; // Item names/IDs user wants to buy
  addedAt: Date;
}

/**
 * Report Interface
 */
export interface IReport extends Document {
  reporter: Types.ObjectId;
  targetType: "review" | "shop";
  targetId: Types.ObjectId;
  category: ReportCategory;
  description: string;
  status: ReportStatus;
  timestamp: Date;
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  resolution?: string;
}

/**
 * Moderation Log Interface
 */
export interface IModerationLog extends Document {
  admin: Types.ObjectId;
  action: ModerationAction;
  targetType: "user" | "shop" | "review";
  targetId: Types.ObjectId;
  relatedReport?: Types.ObjectId;
  reason: string;
  details?: string;
  timestamp: Date;
}

/**
 * Extended Request with User
 */
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}

/**
 * JWT Payload
 */
export interface JWTPayload {
  id: string;
  email: string;
  role: UserRole;
}

/**
 * Search Filters
 */
export interface SearchFilters {
  query?: string;
  category?: ShopCategory;
  availability?: boolean;
  ownerVerified?: boolean;
  openNow?: boolean;
  inCart?: boolean;
  location?: {
    lat: number;
    lng: number;
  };
  maxDistance?: number; // in kilometers
}

/**
 * Sort Options
 */
export enum SortOption {
  RELEVANCE = "relevance",
  DISTANCE = "distance",
  ALPHABETICAL_ASC = "name_asc",
  ALPHABETICAL_DESC = "name_desc",
  RATING = "rating",
}

/**
 * Pagination Options
 */
export interface PaginationOptions {
  page: number;
  limit: number;
}

/**
 * API Response
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
