import express from 'express';

const router = express.Router();

/**
 * TEST ROUTER - MINIMAL VERSION THAT DEFINITELY WORKS
 * This router has NO imports from controllers or other files
 */

router.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'TEST ROUTER WORKS!',
    timestamp: new Date().toISOString(),
  });
});

router.get('/test', (_req, res) => {
  res.status(200).json({
    message: 'Direct test route works!',
  });
});

export default router;
