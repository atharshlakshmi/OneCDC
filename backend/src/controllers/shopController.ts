import { Response } from 'express';
import { AuthRequest } from '../types';
import { asyncHandler } from '../middleware';
import * as shopService from '../services/shopService';

/**
 * Get Owner's Shops
 * GET /api/owner/shops
 */
export const getOwnerShops = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const ownerId = req.user!.id;

    const shops = await shopService.getOwnerShops(ownerId);

    res.status(200).json({
      success: true,
      data: shops,
    });
  }
);

/**
 * Get Single Shop
 * GET /api/owner/shops/:id
 */
export const getOwnerShop = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const ownerId = req.user!.id;
    const { id } = req.params;

    const shop = await shopService.getOwnerShop(id, ownerId);

    res.status(200).json({
      success: true,
      data: shop,
    });
  }
);

/**
 * Get Flagged Shops
 * GET /api/owner/flagged-shops
 */
export const getFlaggedShops = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const ownerId = req.user!.id;

    const shops = await shopService.getFlaggedShops(ownerId);

    res.status(200).json({
      success: true,
      data: shops,
    });
  }
);

/**

 * Create Shop
 * POST /api/owner/shops
 */
export const createShop = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const ownerId = req.user!.id;
    const shopData = req.body;

    const shop = await shopService.createShop(ownerId, shopData);

    res.status(201).json({
      success: true,
      data: shop,
      message: 'Shop created successfully',
    });
  }
);

/**
 * Update Shop
 * PUT /api/owner/shops/:id
 */
export const updateShop = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const ownerId = req.user!.id;
    const { id } = req.params;
    const updates = req.body;

    const shop = await shopService.updateShop(id, ownerId, updates);

    res.status(200).json({
      success: true,
      data: shop,
      message: 'Shop updated successfully',
    });
  }
);

/**
 * Delete Shop
 * DELETE /api/owner/shops/:id
 */
export const deleteShop = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const ownerId = req.user!.id;
    const { id } = req.params;

    const result = await shopService.deleteShop(id, ownerId);

    res.status(200).json(result);
  }
);

/**
 * Get Shop Catalogue
 * GET /api/owner/shops/:id/catalogue
 */
export const getCatalogue = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const ownerId = req.user!.id;
    const { id } = req.params;

    const catalogue = await shopService.getShopCatalogue(id, ownerId);

    res.status(200).json({
      success: true,
      data: catalogue,
    });
  }
);

/**
 * Add Catalogue Item
 * POST /api/owner/shops/:id/catalogue
 */
export const addCatalogueItem = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const ownerId = req.user!.id;
    const { id } = req.params;
    const itemData = req.body;

    const catalogue = await shopService.addCatalogueItem(
      id,
      ownerId,
      itemData
    );

    res.status(201).json({
      success: true,
      data: catalogue,
      message: 'Item added to catalogue',
    });
  }
);

/**
 * Update Catalogue Item
 * PUT /api/owner/shops/:id/catalogue/:itemId
 */
export const updateCatalogueItem = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const ownerId = req.user!.id;
    const { id, itemId } = req.params;
    const updates = req.body;

    const catalogue = await shopService.updateCatalogueItem(
      id,
      itemId,
      ownerId,
      updates
    );

    res.status(200).json({
      success: true,
      data: catalogue,
      message: 'Item updated successfully',
    });
  }
);

/**
 * Delete Catalogue Item
 * DELETE /api/owner/shops/:id/catalogue/:itemId
 */
export const deleteCatalogueItem = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const ownerId = req.user!.id;
    const { id, itemId } = req.params;

    const result = await shopService.deleteCatalogueItem(id, itemId, ownerId);

    res.status(200).json(result);
  }
);
