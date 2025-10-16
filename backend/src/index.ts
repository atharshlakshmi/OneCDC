import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import connect from './utils/connect';
import logger from './utils/logger';
import routes from './routes/api-v2';
import { errorHandler, notFoundHandler, generalLimiter } from './middleware';

const app = express();
const PORT = process.env.PORT || 5000;

/**
 * Middleware
 */
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(generalLimiter);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

/**
 * Routes
 */
app.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'OneCDC Backend API',
    version: '1.0.0',
    documentation: '/api/health',
  });
});

app.get('/healthcheck', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api', routes);

/**
 * Error Handling
 */
app.use(notFoundHandler);
app.use(errorHandler);

/**
 * Start Server
 */
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connect();

    // Start listening
    app.listen(PORT, () => {
      logger.info(`========================================`);
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`API URL: http://localhost:${PORT}/api`);
      logger.info(`Health Check: http://localhost:${PORT}/healthcheck`);
      logger.info(`========================================`);
    });
  } catch (error: unknown) {
    logger.error({ error }, 'Failed to start server');
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  logger.error({ err }, 'Unhandled Promise Rejection');
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  logger.error({ err }, 'Uncaught Exception');
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

startServer();
