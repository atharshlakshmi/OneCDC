/**
 * Centralized Configuration
 * All environment variables and constants should be accessed through this file
 */

export const config = {
  // Server Configuration
  server: {
    port: parseInt(process.env.PORT || '5000', 10),
    env: process.env.NODE_ENV || 'development',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  },

  // Database Configuration
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/onecdc',
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  // Email Configuration
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    from: process.env.EMAIL_FROM || 'noreply@onecdc.sg',
  },

  // Email Token Configuration
  emailToken: {
    verificationExpiresIn: '24h',
    passwordResetExpiresIn: '30m',
  },

  // Google OAuth Configuration
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  },

  // Google Maps Configuration
  googleMaps: {
    apiKey: process.env.GOOGLE_MAPS_API_KEY,
  },

  // Rate Limiting Configuration
  rateLimiting: {
    general: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // 100 requests per window
    },
    auth: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // 5 attempts per window
    },
    review: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 10, // 10 reviews per window
    },
    report: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // 5 reports per window
    },
  },

  // Moderation Thresholds
  moderation: {
    shopper: {
      warningThreshold: parseInt(process.env.SHOPPER_WARNING_THRESHOLD || '3', 10),
    },
    owner: {
      reportThreshold: parseInt(process.env.OWNER_REPORT_THRESHOLD || '5', 10),
    },
  },

  // File Upload Configuration
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5MB default
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    maxPhotosPerReview: 5,
  },

  // Pagination Defaults
  pagination: {
    defaultPage: 1,
    defaultLimit: 20,
    maxLimit: 100,
  },

  // Search Configuration
  search: {
    defaultLocation: {
      lat: 1.3521, // Singapore default
      lng: 103.8198,
    },
    maxDistance: 50000, // 50km in meters
  },
} as const;

// Validation: Ensure critical env vars are set in production
if (config.server.env === 'production') {
  const requiredEnvVars = [
    'MONGO_URI',
    'JWT_SECRET',
    'EMAIL_HOST',
    'EMAIL_USER',
    'EMAIL_PASSWORD',
  ];

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
  }
}

export default config;
