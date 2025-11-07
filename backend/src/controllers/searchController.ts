// searchController.ts
// contains logic for handling search

import { Response } from "express";
import { AuthRequest, SearchFilters, SortOption } from "../types";
import { asyncHandler } from "../middleware";
import * as searchService from "../services/searchService";

/**
 * Search Items
 * GET /api/search/items
 */
export const searchItems = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { query, category, availability, ownerVerified, openNow, lat, lng, maxDistance, sortBy, page, limit } = req.query;

  const filters: SearchFilters = {
    query: query as string,
    category: category as any,
    availability: availability === undefined ? undefined : availability === "true" ? true : availability === "false" ? false : undefined,
    ownerVerified: ownerVerified === undefined ? undefined : ownerVerified === "true" ? true : ownerVerified === "false" ? false : undefined,
    openNow: openNow === "true",
    location: lat && lng ? { lat: parseFloat(lat as string), lng: parseFloat(lng as string) } : undefined,
    maxDistance: maxDistance ? parseFloat(maxDistance as string) : undefined,
  };

  const sort = (sortBy as SortOption) || SortOption.DISTANCE;
  const pagination = {
    page: page ? parseInt(page as string) : 1,
    limit: limit ? parseInt(limit as string) : 20,
  };

  // allow callers to opt-out of the LLM/shop-suggestion fallback by passing
  // `allowFallback=false` as a query param. Default is true for backward
  // compatibility (ItemSearch page will still get fallback behavior).
  const allowFallback = req.query.allowFallback === undefined ? true : String(req.query.allowFallback) === "true";

  const result = await searchService.searchItems(filters, sort, pagination, { allowFallback });

  res.status(200).json({
    success: true,
    data: result.results,
    pagination: result.pagination,
    suggestedShops: result.suggestedShops,
    isFallback: result.isFallback,
    fallbackMessage: result.fallbackMessage,
    categoryName: result.categoryName,
    suggestedCategory: result.suggestedCategory,
  });
});

/**
 * Search Shops
 * GET /api/search/shops
 */
export const searchShops = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { query, category, ownerVerified, openNow, lat, lng, maxDistance, sortBy, page, limit } = req.query;

  const filters: SearchFilters = {
    query: query as string,
    category: category as any,
    ownerVerified: ownerVerified === undefined ? undefined : ownerVerified === "true" ? true : ownerVerified === "false" ? false : undefined,
    openNow: openNow === "true",
    location: lat && lng ? { lat: parseFloat(lat as string), lng: parseFloat(lng as string) } : undefined,
    maxDistance: maxDistance ? parseFloat(maxDistance as string) : undefined,
  };

  const sort = (sortBy as SortOption) || SortOption.DISTANCE;
  const pagination = {
    page: page ? parseInt(page as string) : 1,
    limit: limit ? parseInt(limit as string) : 20,
  };

  const result = await searchService.searchShops(filters, sort, pagination);

  res.status(200).json({
    success: true,
    data: result.results,
    pagination: result.pagination,
  });
});

/**
 * Get Shop Details
 * GET /api/search/shops/:id
 */
export const getShopById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const shop = await searchService.getShopById(id);

  res.status(200).json({
    success: true,
    data: shop,
  });
});

/**
 * Get Shop Catalogue
 * GET /api/search/shops/:id/catalogue
 */
export const getShopCatalogue = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const catalogue = await searchService.getShopCatalogue(id);

  res.status(200).json({
    success: true,
    data: catalogue,
  });
});
