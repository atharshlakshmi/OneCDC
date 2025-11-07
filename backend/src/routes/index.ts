import express from "express";
import authRouter from "./auth";
import apiV2Router from "./api-v2";
import cartRouter from "./cart";
import ownerRouter from "./owner";
import uploadRouter from "./upload";
import reviewsRouter from "./reviews";
import searchRouter from "./search";

console.log("[ROUTES INDEX] loaded");
const router = express.Router();

/**
 * Mount all routers
 */
router.use("/", apiV2Router); // exposes /api/v2/*
router.use("/auth", authRouter); // exposes /api/auth/*
router.use("/cart", cartRouter); // exposes /api/cart/*
router.use("/owner", ownerRouter); // exposes /api/owner/*
router.use("/upload", uploadRouter); // exposes /api/upload/*
router.use("/reviews", reviewsRouter); // exposes /api/reviews/*
router.use("/search", searchRouter);

export default router;
