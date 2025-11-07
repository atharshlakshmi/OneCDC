import { ShoppingCart } from "../models";
import { AppError } from "../middleware";
import logger from "../utils/logger";

/**
 * Get User's Cart
 */
export const getCart = async (shopperId: string) => {
  let cart = await ShoppingCart.findOne({ shopper: shopperId }).populate("items.shop");

  if (!cart) {
    cart = await ShoppingCart.create({ shopper: shopperId, items: [] });
  }

  return cart;
};

/**
 * Add Shop to Cart (Use Case #2-1)
 */
export const addShopToCart = async (shopperId: string, shopId: string, itemTag: string) => {
  let cart = await ShoppingCart.findOne({ shopper: shopperId });

  if (!cart) {
    cart = await ShoppingCart.create({ shopper: shopperId, items: [] });
  }

  const result: any = await cart.addShopWithTag(shopId, itemTag);

  logger.info(`Shop ${shopId} ${result.alreadyInCart ? "updated in" : "added to"} cart for shopper ${shopperId}`);

  const populatedCart = await result.cart.populate("items.shop");

  return {
    cart: populatedCart,
    alreadyInCart: result.alreadyInCart,
    wasUpdated: result.wasUpdated,
  };
};

/**
 * Remove Shop from Cart
 */
export const removeShopFromCart = async (shopperId: string, shopId: string) => {
  const cart = await ShoppingCart.findOne({ shopper: shopperId });

  if (!cart) {
    throw new AppError("Cart not found", 404);
  }

  await cart.removeShop(shopId);

  logger.info(`Shop ${shopId} removed from cart for shopper ${shopperId}`);

  return cart.populate("items.shop");
};

/**
 * Clear Cart
 */
export const clearCart = async (shopperId: string) => {
  const cart = await ShoppingCart.findOne({ shopper: shopperId });

  if (!cart) {
    throw new AppError("Cart not found", 404);
  }

  cart.items = [];
  await cart.save();

  logger.info(`Cart cleared for shopper ${shopperId}`);

  return cart;
};
