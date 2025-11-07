import "dotenv/config";
import express from "express";
import cors, { CorsOptions } from "cors";
import path from "path";
import connect from "./utils/connect";
import logger from "./utils/logger";
import routes from "./routes";
import { errorHandler, notFoundHandler, generalLimiter } from "./middleware";

const app = express();
const PORT = process.env.PORT || 5000;

// Frontend origins (env + local dev)
const FRONTEND_URL = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/+$/, "");
const LOCAL_DEV = "http://localhost:5173";

/**
 * Middleware
 */

// If you run behind a proxy/load balancer and use cookies, keep this:
app.set("trust proxy", 1);

// CORS with credentials and tight origin check
const corsOptions: CorsOptions = {
  origin(origin, callback) {
    // Allow same-origin (server-to-server) or no Origin (curl/Postman)
    if (!origin) return callback(null, true);

    const allowed = [FRONTEND_URL, LOCAL_DEV];
    if (allowed.includes(origin)) return callback(null, true);

    // In development, allow any localhost origin
    if (process.env.NODE_ENV === "development" && origin.startsWith("http://localhost:")) {
      return callback(null, true);
    }

    // You can log here to diagnose unexpected origins:
    logger.warn({ origin }, "Blocked CORS origin");
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
// Fast preflight
app.options("*", cors(corsOptions));
// upload of avatar files
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
// Body parsers - skip JSON parsing for upload routes (multer handles multipart/form-data)
app.use((req, res, next) => {
  if (req.path.startsWith("/api/upload")) {
    return next();
  }
  express.json({ limit: "20mb" })(req, res, next);
});
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// Mount all routes under /api
app.use("/api", routes);

// Global rate limiter
app.use(generalLimiter);

/**
 * Routes
 */
app.use("/api", routes);

// Basic root & health
app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "OneCDC Backend API",
    version: "1.0.0",
    documentation: "/api/health",
  });
});

app.get("/healthcheck", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
  });
});

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
    await connect();

    app.listen(PORT, () => {
      logger.info(`========================================`);
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
      logger.info(`API URL: http://localhost:${PORT}/api`);
      logger.info(`Uploads: http://localhost:${PORT}/uploads`);
      logger.info(`Health Check: http://localhost:${PORT}/healthcheck`);
      logger.info(`Allowed Frontend: ${FRONTEND_URL}`);
      logger.info(`========================================`);
    });
  } catch (error: unknown) {
    logger.error({ error }, "Failed to start server");
    process.exit(1);
  }
};

// Unhandleds/Signals
process.on("unhandledRejection", (err: Error) => {
  logger.error({ err }, "Unhandled Promise Rejection");
  process.exit(1);
});
process.on("uncaughtException", (err: Error) => {
  logger.error({ err }, "Uncaught Exception");
  process.exit(1);
});
process.on("SIGTERM", () => {
  logger.info("SIGTERM received. Shutting down gracefully...");
  process.exit(0);
});

startServer();
