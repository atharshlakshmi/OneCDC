import { Response } from "express";
import { AuthRequest } from "../types";
import { asyncHandler, AppError } from "../middleware";

/**
 * Upload single image
 * POST /api/upload/image
 */
export const uploadImage = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    throw new AppError("No file uploaded", 400);
  }

  // Get the file URL (relative path from public folder)
  const fileUrl = `/uploads/${req.file.filename}`;

  res.status(200).json({
    success: true,
    data: {
      url: fileUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
    },
    message: "Image uploaded successfully",
  });
});

/**
 * Upload multiple images
 * POST /api/upload/images
 */
export const uploadImages = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
    throw new AppError("No files uploaded", 400);
  }

  const uploadedFiles = req.files.map((file) => ({
    url: `/uploads/${file.filename}`,
    filename: file.filename,
    originalName: file.originalname,
    size: file.size,
  }));

  res.status(200).json({
    success: true,
    data: uploadedFiles,
    message: `${uploadedFiles.length} image(s) uploaded successfully`,
  });
});
