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

  // Convert buffer to Base64 data URI
  const base64Data = req.file.buffer.toString("base64");
  const dataUri = `data:${req.file.mimetype};base64,${base64Data}`;

  res.status(200).json({
    success: true,
    data: {
      url: dataUri, // Return Base64 data URI directly
      filename: req.file.originalname,
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

  const uploadedFiles = req.files.map((file) => {
    // Convert buffer to Base64 data URI
    const base64Data = file.buffer.toString("base64");
    const dataUri = `data:${file.mimetype};base64,${base64Data}`;

    return {
      url: dataUri, // Return Base64 data URI directly
      filename: file.originalname,
      originalName: file.originalname,
      size: file.size,
    };
  });

  res.status(200).json({
    success: true,
    data: uploadedFiles,
    message: `${uploadedFiles.length} image(s) uploaded successfully`,
  });
});
