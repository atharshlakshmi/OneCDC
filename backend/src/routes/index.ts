import express from "express";
import authRouter from "./auth";
import apiV2Router from "./api-v2";
import cartRouter from "./cart";
import searchRouter from "./search";


console.log("[ROUTES INDEX] loaded"); // <— add this
const router = express.Router();

/**
 * Health check endpoint
 */
router.use("/", apiV2Router); // exposes /api/v2/*
router.use("/auth", authRouter); // exposes /api/auth/*
router.use("/cart", cartRouter); // exposes /api/cart/*
router.use("/search", searchRouter);

export default router;
