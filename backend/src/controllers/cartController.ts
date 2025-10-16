import { Response } from 'express';
import { AuthRequest, TransportMode } from '../types';
import { asyncHandler } from '../middleware';
import * as cartService from '../services/cartService';
import * as mapsService from '../services/mapsService';
import { Shop } from '../models';

/**
 * Get Cart
 * GET /api/cart
 */
export const getCart = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const shopperId = req.user!.id;

    const cart = await cartService.getCart(shopperId);

    res.status(200).json({
      success: true,
      data: cart,
    });
  }
);

/**
 * Add Shop to Cart
 * POST /api/cart/add
 */
export const addToCart = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const shopperId = req.user!.id;
    const { shopId, itemTag } = req.body;

    const cart = await cartService.addShopToCart(shopperId, shopId, itemTag);

    res.status(200).json({
      success: true,
      data: cart,
      message: 'Shop added to cart',
    });
  }
);

/**
 * Remove Shop from Cart
 * DELETE /api/cart/remove/:shopId
 */
export const removeFromCart = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const shopperId = req.user!.id;
    const { shopId } = req.params;

    const cart = await cartService.removeShopFromCart(shopperId, shopId);

    res.status(200).json({
      success: true,
      data: cart,
      message: 'Shop removed from cart',
    });
  }
);

/**
 * Clear Cart
 * DELETE /api/cart/clear
 */
export const clearCart = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const shopperId = req.user!.id;

    const cart = await cartService.clearCart(shopperId);

    res.status(200).json({
      success: true,
      data: cart,
      message: 'Cart cleared',
    });
  }
);

/**
 * Generate Most Efficient Route
 * POST /api/cart/generate-route
 */
export const generateRoute = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const shopperId = req.user!.id;
    const { origin, mode } = req.body;

    // Get cart
    const cart = await cartService.getCart(shopperId);

    if (cart.items.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Cart is empty',
      });
      return;
    }

    // Get shop details for all items in cart
    const shopIds = cart.items.map((item) => item.shop);
    const shops = await Shop.find({ _id: { $in: shopIds } });

    // Prepare destinations
    const destinations = shops.map((shop) => ({
      lat: shop.location.coordinates[1],
      lng: shop.location.coordinates[0],
      shopId: (shop._id as any).toString(),
      shopName: shop.name,
    }));

    // Generate route
    const route = await mapsService.generateMostEfficientRoute(
      origin,
      destinations,
      mode || TransportMode.WALKING
    );

    res.status(200).json({
      success: true,
      data: route,
      message: 'Route generated successfully',
    });
  }
);
