import multer from "multer";
import path from "path";
import { Request } from "express";

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || "5242880"); // 5MB
const MAX_FILES = parseInt(process.env.MAX_FILES || "5");

/**
 * Storage configuration - Using memory storage for Base64 conversion
 */
const storage = multer.memoryStorage(); // Changed from diskStorage to memoryStorage

/**
 * File filter
 */
const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"));
  }
};

/**
 * Upload middleware
 */
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES,
  },
  fileFilter: fileFilter,
});

/**
 * Single image upload
 */
export const uploadSingle = upload.single("image");

/**
 * Multiple images upload
 */
export const uploadMultiple = upload.array("images", MAX_FILES);
