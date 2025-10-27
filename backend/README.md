# OneCDC Backend API

Complete backend implementation for the OneCDC application - A CDC voucher-accepting shop finder and review platform.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript (strict mode)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcrypt
- **File Upload**: Multer
- **Rate Limiting**: express-rate-limit
- **Logging**: Pino
- **Validation**: express-validator

## Project Structure

```
backend/
├── src/
│   ├── models/              # Mongoose models
│   │   ├── User.ts          # User model with discriminators (Shopper, Owner, Admin)
│   │   ├── Shop.ts          # Shop model with geospatial indexing
│   │   ├── Catalogue.ts     # Catalogue with items and reviews
│   │   ├── ShoppingCart.ts  # Shopping cart model
│   │   ├── Report.ts        # Report model
│   │   ├── ModerationLog.ts # Moderation log model
│   │   └── index.ts         # Model exports
│   ├── controllers/         # Request handlers
│   │   ├── authController.ts
│   │   ├── searchController.ts
│   │   ├── shopperController.ts
│   │   ├── cartController.ts
│   │   ├── reviewController.ts
│   │   ├── shopController.ts
│   │   ├── reportController.ts
│   │   ├── ownerController.ts
│   │   └── adminController.ts
│   ├── routes/              # API routes
│   │   ├── auth.ts
│   │   ├── search.ts
│   │   ├── cart.ts
│   │   ├── reviews.ts
│   │   ├── owner.ts
│   │   ├── reports.ts
│   │   ├── admin.ts
│   │   └── index.ts
│   ├── services/            # Business logic
│   │   ├── authService.ts   # ✓ Username + Password / Google OAuth2
│   │   ├── searchService.ts # ✓ Search & ranking algorithms
│   │   ├── cartService.ts   # Cart management
│   │   ├── shopService.ts   # Shop CRUD operations
│   │   ├── reviewService.ts # Review management
│   │   ├── reportService.ts # Report handling
│   │   ├── moderationService.ts # ✓ Moderation logic
│   │   └── mapsService.ts   # Google Maps integration
│   ├── middleware/          # Express middleware
│   │   ├── auth.ts          # ✓ JWT authentication & authorization
│   │   ├── rateLimiter.ts   # ✓ Rate limiting
│   │   ├── errorHandler.ts  # ✓ Centralized error handling
│   │   ├── validator.ts     # ✓ Request validation
│   │   ├── upload.ts        # ✓ File upload handling
│   │   └── index.ts         # ✓ Middleware exports
│   ├── utils/               # Helper functions
│   │   ├── jwt.ts           # ✓ JWT utilities
│   │   ├── password.ts      # ✓ Password hashing
│   │   ├── distance.ts      # ✓ Haversine formula
│   │   ├── validators.ts    # ✓ Input validators
│   │   ├── logger.ts        # ✓ Pino logger
│   │   ├── connect.ts       # ✓ MongoDB connection
│   │   └── seed.ts          # Database seeding script
│   ├── types/               # TypeScript definitions
│   │   └── index.ts         # ✓ All type definitions
│   └── index.ts             # Application entry point
├── uploads/                 # File uploads directory
├── .env.example             # ✓ Environment variables template
├── tsconfig.json            # ✓ TypeScript configuration
├── package.json             # ✓ Dependencies and scripts
└── README.md                # ✓ This file

Legend: ✓ = Created, blank = To be implemented
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Generate `JWT_SECRET` key using: 
```
# 32 bytes (256 bits) hex secret
openssl rand -hex 32
# put the output into .env
```

Create `/backend/.env` file:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI="mongodb+srv://kchen031_db_user:c0TUOXEcXo1eRLwn@cluster0.yg9wbmw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-change-in-production (copy from above)
JWT_EXPIRE=7d

# CORS
FRONTEND_URL=http://localhost:5173the 

# Google Client ID
GOOGLE_CLIENT_ID=528326458371-5ljkvl01018ful5opd5b579fbbsbet8i.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=...

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Warning Thresholds 
SHOPPER_WARNING_THRESHOLD=3
OWNER_REPORT_THRESHOLD=5

# File size limit
MAX_FILE_SIZE=5242880

# Default Location (Singapore)
DEFAULT_LAT=1.3521
DEFAULT_LNG=103.8198

# Google Maps API (not implemented yet)
# GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

### 3. Create Uploads Directory

```bash
mkdir uploads
```

### 4. Seed Database (Required for First-Time Setup)

```bash
# Comprehensive seed with shops, items, reviews, users
npm run seed:frontend

# Alternative basic seed
npm run seed
```

### 5. Run Development Server

```bash
npm run dev
```

The server will start on `http://localhost:5000`

### 6. Build for Production

```bash
npm run build
npm start
```

## API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Auth | Rate Limit |
|--------|----------|-------------|------|------------|
| POST | `/register/shopper` | Register new shopper (UC #6-1) | No | 5/15min |
| POST | `/register/owner` | Register new owner (UC #6-2) | No | 5/15min |
| POST | `/login` | Login with email/password (UC #6-3) | No | 5/15min |
| POST | `/google` | Login/Register with Google OAuth | No | 5/15min |
| POST | `/logout` | Logout | Yes | No |
| GET | `/verify` | Verify JWT token | Yes | No |
| GET | `/profile` | Get user profile | Yes | No |
| PUT | `/profile` | Update user profile | Yes | 10/15min |
| POST | `/change-password` | Change password | Yes | 5/15min |

### Search Routes (`/api/search`)

| Method | Endpoint | Description | Auth | Rate Limit |
|--------|----------|-------------|------|------------|
| GET | `/items` | Search for items (UC #1-1) | Optional | 100/15min |
| GET | `/shops` | Search for shops (UC #1-2) | Optional | 100/15min |
| GET | `/shops/:id` | Get shop details | Optional | 100/15min |
| GET | `/shops/:id/catalogue` | Get shop catalogue | Optional | 100/15min |

**Query Parameters for `/items` and `/shops`:**
- `query`: Search text
- `category`: Shop category filter
- `availability`: Item availability filter
- `ownerVerified`: Verified shops only
- `openNow`: Currently open shops
- `lat`, `lng`: User location
- `maxDistance`: Maximum distance in km
- `sortBy`: relevance | distance | name_asc | name_desc | rating
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

### Cart Routes (`/api/cart`) - Registered Shopper Only

| Method | Endpoint | Description | Auth | Rate Limit |
|--------|----------|-------------|------|------------|
| GET | `/` | Get current cart | Shopper | 100/15min |
| POST | `/add` | Add shop to cart (UC #2-1) | Shopper | 100/15min |
| DELETE | `/remove/:shopId` | Remove shop from cart | Shopper | 100/15min |
| POST | `/generate-route` | Generate most efficient route (UC #2-2) | Shopper | 10/15min |

### Review Routes (`/api/reviews`) - Registered Shopper Only

| Method | Endpoint | Description | Auth | Rate Limit |
|--------|----------|-------------|------|------------|
| POST | `/` | Submit review (UC #2-3) | Shopper | 5/1hour |
| GET | `/item/:itemId` | Get reviews for item | Optional | 100/15min |
| PUT | `/:id` | Update own review | Shopper | 10/15min |
| DELETE | `/:id` | Delete own review | Shopper | 10/15min |

### Shop Management Routes (`/api/owner`) - Owner Only

| Method | Endpoint | Description | Auth | Rate Limit |
|--------|----------|-------------|------|------------|
| GET | `/shops` | Get owner's shops | Owner | 100/15min |
| POST | `/shops` | Create new shop | Owner | 10/15min |
| PUT | `/shops/:id` | Update shop page (UC #3-1) | Owner | 100/15min |
| POST | `/shops/:id/catalogue` | Add catalogue item (UC #3-2) | Owner | 100/15min |
| PUT | `/shops/:id/catalogue/:itemId` | Update catalogue item (UC #3-3) | Owner | 100/15min |
| DELETE | `/shops/:id/catalogue/:itemId` | Delete catalogue item | Owner | 100/15min |

### Report Routes (`/api/reports`) - Registered Users Only

| Method | Endpoint | Description | Auth | Rate Limit |
|--------|----------|-------------|------|------------|
| POST | `/review` | Report a review (UC #4-1) | User | 10/1hour |
| POST | `/shop` | Report a shop (UC #4-2) | User | 10/1hour |

### Admin Routes (`/api/admin`) - Admin Only

| Method | Endpoint | Description | Auth | Rate Limit |
|--------|----------|-------------|------|------------|
| GET | `/reports/reviews` | Get reported reviews | Admin | No |
| GET | `/reports/shops` | Get reported shops | Admin | No |
| POST | `/moderate/review/:id` | Moderate review (UC #5-1) | Admin | No |
| POST | `/moderate/shop/:id` | Moderate shop (UC #5-2) | Admin | No |
| GET | `/users` | Get users with warnings | Admin | No |
| DELETE | `/users/:id` | Remove user (UC #5-3) | Admin | No |
| GET | `/logs` | Get moderation logs | Admin | No |

## Authentication

### JWT Token

Include JWT token in Authorization header:

```
Authorization: Bearer <token>
```

### User Roles

- **guest**: Can search and view (no authentication required)
- **registered_shopper**: Full shopper features + cart
- **owner**: Manage shops and catalogues
- **admin**: Moderation capabilities

## Request/Response Examples

### Register Shopper

**Request:**
```bash
POST /api/auth/register/shopper
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123",
  "name": "John Doe",
  "phone": "91234567",
  "nric": "S1234567D",
  "address": "123 Marine Parade, Singapore"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "...",
      "email": "john@example.com",
      "name": "John Doe",
      "role": "registered_shopper"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login with Google OAuth

**Request:**
```bash
POST /api/auth/google
Content-Type: application/json

{
  "credential": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjU5N...",
  "role": "registered_shopper"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "...",
      "email": "user@gmail.com",
      "name": "John Doe",
      "role": "registered_shopper"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Search Items

**Request:**
```bash
GET /api/search/items?query=rice&category=grocery&availability=true&sortBy=distance&lat=1.3016&lng=103.9056
```

**Response:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "shopId": "...",
        "shopName": "FairPrice Marine Parade",
        "shopAddress": "...",
        "shopCategory": "grocery",
        "distance": 0.5,
        "item": {
          "name": "Jasmine Rice 5kg",
          "description": "Premium quality jasmine rice",
          "price": 12.50,
          "availability": true,
          "cdcVoucherAccepted": true
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "pages": 3
    }
  }
}
```

### Submit Review

**Request:**
```bash
POST /api/reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "itemId": "...",
  "catalogueId": "...",
  "rating": 5,
  "comment": "Great quality rice!",
  "availability": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Review submitted successfully",
  "data": {
    "reviewId": "..."
  }
}
```

## Error Handling

All errors follow this format:

```json
{
  "success": false,
  "message": "Error message",
  "errors": ["Detailed error 1", "Detailed error 2"]
}
```

### HTTP Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (not authenticated)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `409`: Conflict (duplicate entry)
- `429`: Too Many Requests (rate limited)
- `500`: Internal Server Error

## Database Models

### User Hierarchy (Discriminator Pattern)

```
User (Base)
├── RegisteredShopper
├── Owner
└── Admin
```

### Key Features

- **Geospatial Indexing**: Shops have 2dsphere index for location-based queries
- **Text Indexing**: Shops and items have text indexes for full-text search
- **Soft Deletes**: Users and shops marked as inactive instead of deletion
- **Audit Trail**: All moderation actions logged with timestamps
- **Warning System**: Automatic tracking of warnings per user

## Thresholds & Limits

- **Shopper Warning Threshold**: 3 warnings → eligible for removal
- **Owner Report Threshold**: 5 reports → eligible for removal
- **Review Rate Limit**: 5 reviews per hour
- **Report Rate Limit**: 10 reports per hour
- **Max Images per Shop**: 10
- **Max Images per Item**: 5
- **Max Photos per Review**: 5
- **Max File Size**: 5MB per image

## External API Integrations

### Singpass API (Mock)

Used for shopper registration verification. Currently implemented as mock.

**Production Integration:**
- Endpoint: Set `SINGPASS_API_URL` in `.env`
- Authentication: API key required
- Verification: NRIC validation

### Corppass API (Mock)

Used for owner registration verification. Currently implemented as mock.

**Production Integration:**
- Endpoint: Set `CORPPASS_API_URL` in `.env`
- Authentication: API key required
- Verification: UEN validation

### Google Maps API

Used for route optimization (Most Efficient Route generation).

**Setup:**
1. Get API key from Google Cloud Console
2. Enable Directions API and Distance Matrix API
3. Set `GOOGLE_MAPS_API_KEY` in `.env`

## Development

### Running Tests

```bash
npm test
```

### Linting

```bash
npm run lint
```

### Database Seeding

The seed scripts populate the database with sample data:

**`npm run seed:frontend` (Recommended)**
Creates:
- Sample shops with geolocation data (Marine Parade area)
- Complete catalogues with items and pricing
- Sample reviews with ratings
- Test user accounts (check console output for credentials)

**`npm run seed` (Alternative)**
Creates:
- 1 admin user
- 5 registered shoppers
- 3 shop owners with their shops
- Sample catalogues with items
- Sample reviews and ratings

```bash
# Use the frontend seed for immediate testing
npm run seed:frontend

# Or use the basic seed
npm run seed
```

## Deployment

### Environment Variables for Production

```
NODE_ENV=production
PORT=5000
MONGODB_URI=<production-mongodb-uri>
JWT_SECRET=<strong-random-secret>
GOOGLE_MAPS_API_KEY=<your-key>
FRONTEND_URL=<your-frontend-url>
```

### Build and Start

```bash
npm run build
npm start
```

## Security Considerations

1. **Password Security**: bcrypt with 10 salt rounds
2. **JWT Secret**: Use strong random string (32+ characters)
3. **Rate Limiting**: Prevents abuse and DDoS
4. **Input Validation**: All inputs validated before processing
5. **File Upload Security**: Type and size restrictions
6. **CORS**: Configured for specific frontend origin
7. **SQL/NoSQL Injection**: Mongoose provides protection
8. **XSS Protection**: Input sanitization implemented

## Logging

All operations are logged using Pino:

- **Info**: Successful operations
- **Warn**: Warning thresholds reached
- **Error**: Errors and exceptions
- **Debug**: Development debugging (dev mode only)

Logs include:
- Timestamps
- Request URLs and methods
- User actions
- Error stack traces

## Troubleshooting

### MongoDB Connection Issues

**Error: "MongooseServerSelectionError: connect ECONNREFUSED"**
- Check MongoDB Atlas connection string in `.env`
- Verify your IP address is whitelisted in MongoDB Atlas
- Ensure network security settings allow outbound connections
- Test connection: `mongosh "your-connection-string"`

**Error: "Authentication failed"**
- Verify MongoDB username and password in connection string
- Check database user has proper permissions
- Ensure password is URL-encoded if it contains special characters

### Port Already in Use

**Error: "EADDRINUSE: address already in use :::5000"**
```bash
# Find process using port 5000
lsof -ti:5000

# Kill the process
lsof -ti:5000 | xargs kill -9
```

### JWT Token Issues

**Error: "jwt malformed" or "invalid signature"**
- Ensure `JWT_SECRET` is set and matches between environments
- JWT_SECRET must be at least 32 characters
- Check token is being sent in Authorization header as "Bearer <token>"

### Google OAuth Not Working

**Error: "Invalid Google token"**
- Verify `GOOGLE_CLIENT_ID` matches the one from Google Console
- Check Google Console has correct authorized JavaScript origins
- Ensure credentials are for OAuth 2.0 Web Application type
- Frontend must send valid Google credential token

### Rate Limiting Issues

**Error: "Too many requests"**
- Default: 100 requests per 15 minutes
- Adjust `RATE_LIMIT_MAX_REQUESTS` and `RATE_LIMIT_WINDOW_MS` in `.env`
- Clear rate limit cache by restarting server

### File Upload Errors

**Error: "File too large" or "Invalid file type"**
- Max file size: 5MB per file
- Allowed types: JPEG, PNG, GIF
- Check `uploads/` directory exists and has write permissions

### CORS Errors from Frontend

**Error: "CORS policy: No 'Access-Control-Allow-Origin' header"**
- Verify `FRONTEND_URL` in backend `.env` matches frontend URL
- Check frontend is running on port 5173 (or update FRONTEND_URL)
- Restart backend after changing CORS settings

### Database Not Seeding

**Error: "Duplicate key error" when seeding**
- Database already has data with same IDs
- Drop database and re-seed:
```bash
# In MongoDB Atlas or mongosh
db.dropDatabase()

# Then re-seed
npm run seed:frontend
```

### TypeScript Compilation Errors

**Error: Type checking failed**
```bash
# Clear build cache
rm -rf dist/

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

### Environment Variables Not Loading

**Error: "undefined" for environment variables**
- Ensure `.env` file exists in backend root directory
- Check `.env` file has no syntax errors
- Verify `dotenv` is loaded before accessing `process.env`
- Restart server after changing `.env`

### Server Crashes on Startup

**Check logs for specific errors:**
```bash
# Run with verbose logging
NODE_ENV=development npm run dev
```

Common causes:
- Missing environment variables
- MongoDB connection failure
- Port already in use
- Syntax errors in code

## Support

For issues or questions:
1. Check this README and troubleshooting section
2. Review server logs for error details
3. Verify all environment variables are set correctly
4. Check MongoDB Atlas connection and network settings
5. Ensure frontend `.env.local` matches backend configuration
6. Review API endpoint documentation above

