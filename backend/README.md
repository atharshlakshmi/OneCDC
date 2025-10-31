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
│   │   ├── cartController.ts
│   │   ├── reviewController.ts
│   │   ├── shopController.ts
│   │   ├── reportController.ts
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
│   │   ├── authService.ts   # ✓ Singpass/Corppass integration (mock)
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

Copy `.env.example` to `.env` and update with your values:

```bash
cp .env.example .env
```

Required environment variables:
- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: Secret key for JWT signing
- `GOOGLE_MAPS_API_KEY`: Google Maps API key (for route generation)

### 3. Create Uploads Directory

```bash
mkdir uploads
```

### 4. Seed Database (Optional)

```bash
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
| POST | `/login` | Login (UC #6-3) | No | 5/15min |
| POST | `/logout` | Logout | Yes | No |
| GET | `/verify` | Verify JWT token | Yes | No |
| GET | `/profile` | Get user profile | Yes | No |

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

The seed script creates:
- 1 admin user
- 5 shoppers
- 3 owners with shops
- Sample catalogues with items
- Sample reviews

```bash
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

## Support

For issues or questions:
1. Check this README
2. Review API endpoint documentation
3. Check server logs
4. Contact development team

## License

ISC
