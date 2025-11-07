import express from 'express';
import * as uploadController from '../controllers/uploadController';
import { authenticate } from '../middleware';
import { uploadSingle, uploadMultiple } from '../middleware/upload';

const router = express.Router();

// All upload routes require authentication
router.use(authenticate);

/**
 * POST /api/upload/image
 * Upload single image
 */
router.post('/image', uploadSingle, uploadController.uploadImage);

/**
 * POST /api/upload/images
 * Upload multiple images (max 5)
 */
router.post('/images', uploadMultiple, uploadController.uploadImages);

export default router;
