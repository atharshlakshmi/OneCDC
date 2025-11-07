import mongoose, { Schema, Model } from 'mongoose';
import { IShoppingCart, ICartItem } from '../types';

/**
 * Cart Item Sub-Schema
 */
const CartItemSchema = new Schema<ICartItem>(
  {
    shop: { type: Schema.Types.ObjectId, ref: 'Shop', required: true },
    itemTags: { type: [String], required: true, default: [] },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

/**
 * Shopping Cart Schema
 */
const ShoppingCartSchema = new Schema<IShoppingCart>(
  {
    shopper: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: { type: [CartItemSchema], default: [] },
  },
  {
    timestamps: true,
  }
);

/**
 * Indexes
 */
ShoppingCartSchema.index({ shopper: 1 });
ShoppingCartSchema.index({ 'items.shop': 1 });

/**
 * Method to add or update shop in cart
 */
ShoppingCartSchema.methods.addShopWithTag = function (
  shopId: string,
  tag: string
) {
  const existingItem = this.items.find(
    (item: ICartItem) => item.shop.toString() === shopId
  );

  if (existingItem) {
    // Append tag if not already present
    if (!existingItem.itemTags.includes(tag)) {
      existingItem.itemTags.push(tag);
    }
  } else {
    // Add new shop to cart
    this.items.push({
      shop: new mongoose.Types.ObjectId(shopId),
      itemTags: [tag],
      addedAt: new Date(),
    });
  }

  return this.save();
};

/**
 * Method to remove shop from cart
 */
ShoppingCartSchema.methods.removeShop = function (shopId: string) {
  this.items = this.items.filter(
    (item: ICartItem) => item.shop.toString() !== shopId
  );
  return this.save();
};

/**
 * Shopping Cart Model
 */
export const ShoppingCart: Model<IShoppingCart> = mongoose.model<IShoppingCart>(
  'ShoppingCart',
  ShoppingCartSchema
);
