import express from "express";
import { body } from "express-validator";
import * as shopController from "../controllers/shopController";
import { authenticate, authorize, validate } from "../middleware";
import { UserRole } from "../types";

const router = express.Router();

// All owner routes require owner authentication
router.use(authenticate, authorize(UserRole.OWNER));

/**
 * GET /api/owner/shops
 * Get owner's shops
 */
router.get("/shops", shopController.getOwnerShops);

/**
 * GET /api/owner/flagged-shops
 * Get owner's flagged shops (with warnings)
 */
router.get("/flagged-shops", shopController.getFlaggedShops);

/**
 * GET /api/owner/shops/:id
 * Get single shop
 */
router.get("/shops/:id", shopController.getOwnerShop);

/**
 * POST /api/owner/shops
 * Create shop
 */
router.post(
  "/shops",
  validate([
    body("name").notEmpty().withMessage("Shop name is required"),
    body("description").notEmpty().withMessage("Description is required"),
    body("address").notEmpty().withMessage("Address is required"),
    body("location.coordinates").optional().isArray({ min: 2, max: 2 }).withMessage("Valid coordinates [lng, lat] are required"),
    body("phone")
      .matches(/^[689]\d{7}$/)
      .withMessage("Valid Singapore phone number is required"),
    body("category").notEmpty().withMessage("Category is required"),
    body("operatingHours").optional().isArray().withMessage("Operating hours must be an array"),
  ]),
  shopController.createShop
);

/**
 * PUT /api/owner/shops/:id
 * Update shop
 */
router.put("/shops/:id", shopController.updateShop);

/**
 * DELETE /api/owner/shops/:id
 * Delete shop
 */
router.delete("/shops/:id", shopController.deleteShop);

/**
 * GET /api/owner/shops/:id/catalogue
 * Get shop catalogue
 */
router.get("/shops/:id/catalogue", shopController.getCatalogue);

/**
 * POST /api/owner/shops/:id/catalogue
 * Add catalogue item
 */
router.post(
  "/shops/:id/catalogue",
  validate([
    body("name").notEmpty().withMessage("Item name is required"),
    body("description").notEmpty().withMessage("Description is required"),
    body("price").optional().isFloat({ min: 0 }).withMessage("Valid price is required"),
    body("availability").optional().isBoolean().withMessage("Availability must be a boolean"),
    body("cdcVoucherAccepted").optional().isBoolean().withMessage("CDC voucher accepted must be a boolean"),
  ]),
  shopController.addCatalogueItem
);

/**
 * PUT /api/owner/shops/:id/catalogue/:itemId
 * Update catalogue item
 */
router.put("/shops/:id/catalogue/:itemId", shopController.updateCatalogueItem);

/**
 * DELETE /api/owner/shops/:id/catalogue/:itemId
 * Delete catalogue item
 */
router.delete("/shops/:id/catalogue/:itemId", shopController.deleteCatalogueItem);

export default router;
