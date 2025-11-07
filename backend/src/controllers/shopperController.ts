import { Response } from 'express';
import { AuthRequest, TransportMode } from '../types';
import { asyncHandler } from '../middleware';
import * as cartService from '../services/cartService';
import * as reviewService from '../services/reviewService';
import * as reportService from '../services/reportService';
import * as mapsService from '../services/mapsService';
import * as shopService from '../services/shopService';

/**
 * Shopper Controller
 * Handles all shopper-specific operations: cart, reviews, reports
 */

// ========== CART OPERATIONS ==========

/**
 * Get Cart
 * GET /api/shopper/cart
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
 * POST /api/shopper/cart/add
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
 * DELETE /api/shopper/cart/remove/:shopId
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
 * DELETE /api/shopper/cart/clear
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
 * POST /api/shopper/cart/generate-route
 */
export const generateRoute = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const shopperId = req.user!.id;
    const { origin, mode } = req.body;

    const cart = await cartService.getCart(shopperId);

    if (!cart || cart.items.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Cart is empty',
      });
      return;
    }

    // Extract shop locations from cart items
    const destinations = cart.items.map((item: any) => ({
      lat: item.shop.location.coordinates[1],
      lng: item.shop.location.coordinates[0],
      shopId: item.shop._id.toString(),
      shopName: item.shop.name,
    }));

    const route = await mapsService.generateMostEfficientRoute(
      origin,
      destinations,
      mode as TransportMode
    );

    res.status(200).json({
      success: true,
      data: route,
    });
  }
);

// ========== CATALOGUE OPERATIONS ==========

/**
 * Add Catalogue Item
 * POST /api/shopper/shops/:id/catalogue
 */
export const addCatalogueItem = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const shopperId = req.user!.id;
    const { id } = req.params;
    const itemData = req.body;

    const catalogue = await shopService.addCatalogueItemByShopper(
      id,
      shopperId,
      itemData
    );

    res.status(201).json({
      success: true,
      data: catalogue,
      message: 'Item added to catalogue',
    });
  }
);

// ========== REVIEW OPERATIONS ==========

/**
 * Submit Review
 * POST /api/shopper/reviews
 */
export const submitReview = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const shopperId = req.user!.id;
    const { catalogueId, itemId, description, images, availability } =
      req.body;

    const result = await reviewService.submitReview(
      shopperId,
      catalogueId,
      itemId,
      {
        description,
        images,
        availability,
      }
    );

    res.status(201).json(result);
  }
);

/**
 * Update Own Review
 * PUT /api/shopper/reviews/:catalogueId/:itemId/:reviewId
 */
export const updateReview = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const shopperId = req.user!.id;
    const { catalogueId, itemId, reviewId } = req.params;
    const updates = req.body;

    const result = await reviewService.updateReview(
      catalogueId,
      itemId,
      reviewId,
      shopperId,
      updates
    );

    res.status(200).json(result);
  }
);

/**
 * Delete Own Review
 * DELETE /api/shopper/reviews/:catalogueId/:itemId/:reviewId
 */
export const deleteReview = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const shopperId = req.user!.id;
    const { catalogueId, itemId, reviewId } = req.params;

    const result = await reviewService.deleteReview(
      catalogueId,
      itemId,
      reviewId,
      shopperId
    );

    res.status(200).json(result);
  }
);

/**
 * Get Shopper's Own Reviews
 * GET /api/shopper/reviews/my-reviews
 */
export const getMyReviews = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const shopperId = req.user!.id;

    // TODO: Implement getShopperReviews in reviewService
    // const reviews = await reviewService.getShopperReviews(shopperId);

    res.status(200).json({
      success: true,
      data: {
        message: 'Get shopper reviews - to be implemented',
        shopperId,
      },
    });
  }
);

// ========== REPORT OPERATIONS ==========

/**
 * Report a Review
 * POST /api/shopper/reports/review
 */
export const reportReview = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const reporterId = req.user!.id;
    const { reviewId, category, description } = req.body;

    const result = await reportService.reportReview(
      reporterId,
      reviewId,
      category,
      description
    );

    res.status(201).json(result);
  }
);

/**
 * Report a Shop
 * POST /api/shopper/reports/shop
 */
export const reportShop = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const reporterId = req.user!.id;
    const { shopId, category, description } = req.body;

    const result = await reportService.reportShop(
      reporterId,
      shopId,
      category,
      description
    );

    res.status(201).json(result);
  }
);

/**
 * Get Shopper's Own Reports
 * GET /api/shopper/reports/my-reports
 */
export const getMyReports = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const reporterId = req.user!.id;

    const reports = await reportService.getUserReports(reporterId);

    res.status(200).json({
      success: true,
      data: reports,
    });
  }
);
