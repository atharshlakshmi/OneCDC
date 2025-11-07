import express from "express";
import authRouter from "./auth";
import apiV2Router from "./api-v2";
import uploadRouter from "./upload";
import adminRouter from "./admin";
import shopperRouter from "./shopper";
import ownerRouter from "./owner";
import searchRouter from "./search";

// Legacy routes (deprecated - use /shopper/* instead)
import cartRouter from "./cart";
import reportsRouter from "./reports";
import reviewsRouter from "./reviews";

console.log("[ROUTES INDEX] loaded");
const router = express.Router();

/**
 * Mount all routers
 */
router.use("/", apiV2Router); // exposes /api/v2/*
router.use("/auth", authRouter); // exposes /api/auth/*
router.use("/admin", adminRouter); // exposes /api/admin/*
router.use("/shopper", shopperRouter); // exposes /api/shopper/* (NEW: consolidated shopper routes)
router.use("/owner", ownerRouter); // exposes /api/owner/* (uses ownerController)
router.use("/search", searchRouter); // exposes /api/search/*
router.use("/upload", uploadRouter); // exposes /api/upload/*

// Legacy routes (deprecated - maintained for backward compatibility)
router.use("/cart", cartRouter); // DEPRECATED: use /api/shopper/cart/*
router.use("/reports", reportsRouter); // DEPRECATED: use /api/shopper/reports/*
router.use("/reviews", reviewsRouter); // DEPRECATED: use /api/shopper/reviews/*

export default router;
