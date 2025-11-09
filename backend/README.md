# OneCDC Backend API

Express.js + TypeScript + MongoDB backend API for the OneCDC platform - A CDC voucher shop finder and review platform for Singapore.Complete backend implementation for the OneCDC application - A CDC voucher-accepting shop finder and review platform.

## Table of Contents## Tech Stack

- [Tech Stack](#tech-stack)- **Runtime**: Node.js

- [Project Structure](#project-structure)- **Framework**: Express.js

- [Getting Started](#getting-started)- **Language**: TypeScript (strict mode)

- [API Documentation](#api-documentation)- **Database**: MongoDB with Mongoose ODM

- [Database Models](#database-models)- **Authentication**: JWT with bcrypt

- [Authentication](#authentication)- **File Upload**: Multer

- [File Upload](#file-upload)- **Rate Limiting**: express-rate-limit

- [Error Handling](#error-handling)- **Logging**: Pino

- [Development](#development)- **Validation**: express-validator

## Tech Stack## Project Structure

### Core Technologies```

- **Runtime:** Node.js 18+backend/

- **Framework:** Express.js 4.x├── src/

- **Language:** TypeScript 5.x│ ├── models/ # Mongoose models

- **Database:** MongoDB with Mongoose 8.x ODM│ │ ├── User.ts # User model with discriminators (Shopper, Owner, Admin)

│ │ ├── Shop.ts # Shop model with geospatial indexing

### Authentication & Security│ │ ├── Catalogue.ts # Catalogue with items and reviews

- **JWT:** JSON Web Tokens for stateless authentication│ │ ├── ShoppingCart.ts # Shopping cart model

- **bcrypt:** Password hashing and verification│ │ ├── Report.ts # Report model

- **express-validator:** Request validation middleware│ │ ├── ModerationLog.ts # Moderation log model

- **CORS:** Cross-Origin Resource Sharing support│ │ └── index.ts # Model exports

│ ├── controllers/ # Request handlers

### External Services│ │ ├── authController.ts

- **Google Maps API:** Directions and Places integration│ │ ├── searchController.ts

- **Multer:** File upload handling for images│ │ ├── shopperController.ts

- **Axios:** HTTP client for external API calls│ │ ├── cartController.ts

│ │ ├── reviewController.ts

### Development Tools│ │ ├── shopController.ts

- **ts-node-dev:** TypeScript development with hot reload│ │ ├── reportController.ts

- **ESLint:** Code linting│ │ ├── ownerController.ts

- **Prettier:** Code formatting│ │ └── adminController.ts

│ ├── routes/ # API routes

## Project Structure│ │ ├── auth.ts

│ │ ├── search.ts

```````│ │   ├── cart.ts

backend/│   │   ├── reviews.ts

├── src/│   │   ├── owner.ts

│   ├── controllers/         # Request handlers│   │   ├── reports.ts

│   │   ├── authController.ts│   │   ├── admin.ts

│   │   ├── shopController.ts│   │   └── index.ts

│   │   ├── cartController.ts│   ├── services/            # Business logic

│   │   ├── reviewController.ts│   │   ├── authService.ts   # ✓ Username + Password / Google OAuth2

│   │   ├── searchController.ts│   │   ├── searchService.ts # ✓ Search & ranking algorithms

│   │   ├── ownerController.ts│   │   ├── cartService.ts   # Cart management

│   │   └── adminController.ts│   │   ├── shopService.ts   # Shop CRUD operations

│   ││   │   ├── reviewService.ts # Review management

│   ├── models/              # Mongoose schemas│   │   ├── reportService.ts # Report handling

│   │   ├── User.ts│   │   ├── moderationService.ts # ✓ Moderation logic

│   │   ├── Shop.ts│   │   └── mapsService.ts   # Google Maps integration

│   │   ├── Catalogue.ts│   ├── middleware/          # Express middleware

│   │   ├── Item.ts│   │   ├── auth.ts          # ✓ JWT authentication & authorization

│   │   ├── Review.ts│   │   ├── rateLimiter.ts   # ✓ Rate limiting

│   │   ├── ShoppingCart.ts│   │   ├── errorHandler.ts  # ✓ Centralized error handling

│   │   ├── Report.ts│   │   ├── validator.ts     # ✓ Request validation

│   │   └── ModerationLog.ts│   │   ├── upload.ts        # ✓ File upload handling

│   ││   │   └── index.ts         # ✓ Middleware exports

│   ├── routes/              # API routes│   ├── utils/               # Helper functions

│   │   ├── auth.ts          # Authentication endpoints│   │   ├── jwt.ts           # ✓ JWT utilities

│   │   ├── shops.ts         # Shop CRUD operations│   │   ├── password.ts      # ✓ Password hashing

│   │   ├── cart.ts          # Shopping cart & route│   │   ├── distance.ts      # ✓ Haversine formula

│   │   ├── reviews.ts       # Review management│   │   ├── validators.ts    # ✓ Input validators

│   │   ├── search.ts        # Search functionality│   │   ├── logger.ts        # ✓ Pino logger

│   │   ├── owner.ts         # Owner-specific routes│   │   ├── connect.ts       # ✓ MongoDB connection

│   │   ├── admin.ts         # Admin moderation│   │   └── seed.ts          # Database seeding script

│   │   └── api-v2.ts        # Unified API endpoints│   ├── types/               # TypeScript definitions

│   ││   │   └── index.ts         # ✓ All type definitions

│   ├── services/            # Business logic layer│   └── index.ts             # Application entry point

│   │   ├── authService.ts├── uploads/                 # File uploads directory

│   │   ├── shopService.ts├── .env.example             # ✓ Environment variables template

│   │   ├── cartService.ts├── tsconfig.json            # ✓ TypeScript configuration

│   │   ├── searchService.ts├── package.json             # ✓ Dependencies and scripts

│   │   └── routeService.ts└── README.md                # ✓ This file

│   │

│   ├── middleware/          # Express middlewareLegend: ✓ = Created, blank = To be implemented

│   │   ├── auth.ts          # JWT authentication```

│   │   ├── authorize.ts     # Role-based authorization

│   │   ├── errorHandler.ts  # Global error handling## Setup Instructions

│   │   ├── validate.ts      # Request validation

│   │   └── upload.ts        # File upload configuration### 1. Install Dependencies

│   │

│   ├── types/               # TypeScript type definitions```bash

│   │   └── index.ts         # Shared types & interfacescd backend

│   │npm install

│   ├── utils/               # Utility functions```

│   │   ├── logger.ts        # Logging utilities

│   │   ├── email.ts         # Email service### 2. Configure Environment Variables

│   │   └── helpers.ts       # Helper functions

│   │Generate `JWT_SECRET` key using:

│   └── index.ts             # Application entry point```

│# 32 bytes (256 bits) hex secret

├── uploads/                 # Uploaded images directoryopenssl rand -hex 32

├── .env                     # Environment variables (create this)# put the output into .env

├── .env.example             # Environment template```

├── package.json             # Dependencies and scripts

├── tsconfig.json            # TypeScript configurationCreate `/backend/.env` file:

└── README.md                # This file

``````env

# Server Configuration

## ⚡ Getting StartedPORT=5000

NODE_ENV=development

### Prerequisites

# Database

- **Node.js** 18 or higher MONGODB_URI=your cluster connection string

- **npm** 9 or higher

- **MongoDB** Atlas account (or local MongoDB)# JWT Configuration

- **Google Maps API key** (for directions and places)JWT_SECRET=your-super-secret-jwt-key-min-32-characters-change-in-production (copy from above)

JWT_EXPIRE=7d

### Installation

# CORS

1. **Navigate to backend directory**FRONTEND_URL=http://localhost:5173

   ```bash

   cd backend# Google Client ID

   ```GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

GOOGLE_CLIENT_SECRET=...

2. **Install dependencies**

   ```bash# Rate Limiting

   npm installRATE_LIMIT_WINDOW_MS=900000

   ```RATE_LIMIT_MAX_REQUESTS=100



3. **Create environment file**# Warning Thresholds

   ```bashSHOPPER_WARNING_THRESHOLD=3

   cp .env.example .envOWNER_REPORT_THRESHOLD=5

```````

# File size limit

4. **Configure environment variables** (see Configuration section)MAX_FILE_SIZE=5242880

5. **Start development server**# Default Location (Singapore)

   ```bashDEFAULT_LAT=1.3521

   npm run devDEFAULT_LNG=103.8198

   ```

# Google Maps API (not implemented yet)

Server runs on `http://localhost:5000`# GOOGLE_MAPS_API_KEY=your-google-maps-api-key

````

### Configuration

### 3. Create Uploads Directory

Create `.env` file in the backend directory:

```bash

```envmkdir uploads

# Server Configuration```

PORT=5000

NODE_ENV=development### 4. Seed Database (Required for First-Time Setup)



# Database```bash

MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/onecdc?retryWrites=true&w=majority# Comprehensive seed with shops, items, reviews, users

npm run seed:frontend

# Authentication

JWT_SECRET=your_secure_jwt_secret_key_here# Alternative basic seed

JWT_EXPIRES_IN=7dnpm run seed

````

# Google OAuth (Optional)

GOOGLE_CLIENT_ID=your_google_client_id### 5. Run Development Server

GOOGLE_CLIENT_SECRET=your_google_client_secret

````bash

# Email Configuration (Optional)npm run dev

EMAIL_HOST=smtp.gmail.com```

EMAIL_PORT=587

EMAIL_USER=your_email@gmail.comThe server will start on `http://localhost:5000`

EMAIL_PASS=your_app_password

### 6. Build for Production

# Google Maps API

GOOGLE_MAPS_API_KEY=your_google_maps_api_key```bash

npm run build

# Frontend URL (for CORS)npm start

FRONTEND_URL=http://localhost:5173```

````

## API Endpoints

**Generate JWT Secret:**

```bash### Authentication Routes (`/api/auth`)

node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

````| Method | Endpoint | Description | Auth | Rate Limit |

|--------|----------|-------------|------|------------|

### Available Scripts| POST | `/register/shopper` | Register new shopper (UC #6-1) | No | 5/15min |

| POST | `/register/owner` | Register new owner (UC #6-2) | No | 5/15min |

```bash| POST | `/login` | Login with email/password (UC #6-3) | No | 5/15min |

# Development| POST | `/google` | Login/Register with Google OAuth | No | 5/15min |

npm run dev          # Start with hot reload (ts-node-dev)| POST | `/logout` | Logout | Yes | No |

| GET | `/verify` | Verify JWT token | Yes | No |

# Production| GET | `/profile` | Get user profile | Yes | No |

npm run build        # Compile TypeScript to JavaScript| PUT | `/profile` | Update user profile | Yes | 10/15min |

npm start            # Run compiled JavaScript| POST | `/change-password` | Change password | Yes | 5/15min |



# Code Quality### Search Routes (`/api/search`)

npm run lint         # Run ESLint

npm run format       # Format code with Prettier| Method | Endpoint | Description | Auth | Rate Limit |

|--------|----------|-------------|------|------------|

# Testing| GET | `/items` | Search for items (UC #1-1) | Optional | 100/15min |

npm test             # Run tests (when implemented)| GET | `/shops` | Search for shops (UC #1-2) | Optional | 100/15min |

```| GET | `/shops/:id` | Get shop details | Optional | 100/15min |

| GET | `/shops/:id/catalogue` | Get shop catalogue | Optional | 100/15min |

## API Documentation

**Query Parameters for `/items` and `/shops`:**

### Base URL- `query`: Search text

- `category`: Shop category filter

```- `availability`: Item availability filter

http://localhost:5000/api- `ownerVerified`: Verified shops only

```- `openNow`: Currently open shops

- `lat`, `lng`: User location

### Authentication- `maxDistance`: Maximum distance in km

- `sortBy`: relevance | distance | name_asc | name_desc | rating

Protected routes require JWT token in the Authorization header:- `page`: Page number (default: 1)

- `limit`: Items per page (default: 20)

````

Authorization: Bearer <jwt_token>### Cart Routes (`/api/cart`) - Registered Shopper Only

````

| Method | Endpoint | Description | Auth | Rate Limit |

### Response Format|--------|----------|-------------|------|------------|

| GET | `/` | Get current cart | Shopper | 100/15min |

All API responses follow this format:| POST | `/add` | Add shop to cart (UC #2-1) | Shopper | 100/15min |

| DELETE | `/remove/:shopId` | Remove shop from cart | Shopper | 100/15min |

**Success:**| POST | `/generate-route` | Generate most efficient route (UC #2-2) | Shopper | 10/15min |

```json

{### Review Routes (`/api/reviews`) - Registered Shopper Only

  "success": true,

  "data": { ... },| Method | Endpoint | Description | Auth | Rate Limit |

  "message": "Operation successful"|--------|----------|-------------|------|------------|

}| POST | `/` | Submit review (UC #2-3) | Shopper | 5/1hour |

```| GET | `/item/:itemId` | Get reviews for item | Optional | 100/15min |

| PUT | `/:id` | Update own review | Shopper | 10/15min |

**Error:**| DELETE | `/:id` | Delete own review | Shopper | 10/15min |

```json

{### Shop Management Routes (`/api/owner`) - Owner Only

  "success": false,

  "error": "Error message",| Method | Endpoint | Description | Auth | Rate Limit |

  "statusCode": 400|--------|----------|-------------|------|------------|

}| GET | `/shops` | Get owner's shops | Owner | 100/15min |

```| POST | `/shops` | Create new shop | Owner | 10/15min |

| PUT | `/shops/:id` | Update shop page (UC #3-1) | Owner | 100/15min |

### API Endpoints| POST | `/shops/:id/catalogue` | Add catalogue item (UC #3-2) | Owner | 100/15min |

| PUT | `/shops/:id/catalogue/:itemId` | Update catalogue item (UC #3-3) | Owner | 100/15min |

#### Authentication (`/api/auth`)| DELETE | `/shops/:id/catalogue/:itemId` | Delete catalogue item | Owner | 100/15min |



| Method | Endpoint | Description | Auth Required |### Report Routes (`/api/reports`) - Registered Users Only

|--------|----------|-------------|---------------|

| POST | `/auth/register` | Register new user | No || Method | Endpoint | Description | Auth | Rate Limit |

| POST | `/auth/login` | Login user | No ||--------|----------|-------------|------|------------|

| POST | `/auth/logout` | Logout user | Yes || POST | `/review` | Report a review (UC #4-1) | User | 10/1hour |

| GET | `/auth/me` | Get current user profile | Yes || POST | `/shop` | Report a shop (UC #4-2) | User | 10/1hour |

| PUT | `/auth/update-profile` | Update user profile | Yes |

| POST | `/auth/forgot-password` | Request password reset | No |### Admin Routes (`/api/admin`) - Admin Only

| POST | `/auth/reset-password` | Reset password with token | No |

| POST | `/auth/verify-email` | Verify email address | No || Method | Endpoint | Description | Auth | Rate Limit |

|--------|----------|-------------|------|------------|

**Register User Example:**| GET | `/reports/reviews` | Get reported reviews | Admin | No |

```bash| GET | `/reports/shops` | Get reported shops | Admin | No |

POST /api/auth/register| POST | `/moderate/review/:id` | Moderate review (UC #5-1) | Admin | No |

Content-Type: application/json| POST | `/moderate/shop/:id` | Moderate shop (UC #5-2) | Admin | No |

| GET | `/users` | Get users with warnings | Admin | No |

{| DELETE | `/users/:id` | Remove user (UC #5-3) | Admin | No |

  "email": "user@example.com",| GET | `/logs` | Get moderation logs | Admin | No |

  "password": "SecurePass123!",

  "name": "John Doe",## Authentication

  "role": "registered_shopper",

  "phone": "+65 9123 4567"### JWT Token

}

```Include JWT token in Authorization header:



**Login Example:**```

```bashAuthorization: Bearer <token>

POST /api/auth/login```

Content-Type: application/json

### User Roles

{

  "email": "user@example.com",- **guest**: Can search and view (no authentication required)

  "password": "SecurePass123!"- **registered_shopper**: Full shopper features + cart

}- **owner**: Manage shops and catalogues

```- **admin**: Moderation capabilities



#### Shops (`/api/shops`)## Request/Response Examples



| Method | Endpoint | Description | Auth Required | Role |### Register Shopper

|--------|----------|-------------|---------------|------|

| GET | `/shops` | Get all shops (with filters) | No | - |**Request:**

| GET | `/shops/:id` | Get shop by ID | No | - |```bash

| POST | `/shops` | Create new shop | Yes | Owner |POST /api/auth/register/shopper

| PUT | `/shops/:id` | Update shop | Yes | Owner |Content-Type: application/json

| DELETE | `/shops/:id` | Delete shop | Yes | Owner/Admin |

| GET | `/shops/:id/catalogue` | Get shop catalogue | No | - |{

  "email": "john@example.com",

**Query Parameters for GET /shops:**  "password": "SecurePass123",

- `category` - Filter by shop category  "name": "John Doe",

- `ownerVerified` - Filter by verification status (true/false)  "phone": "91234567",

- `openNow` - Filter shops currently open (true/false)  "nric": "S1234567D",

- `lat` & `lng` - Geolocation coordinates for distance sorting  "address": "123 Marine Parade, Singapore"

- `maxDistance` - Maximum distance in kilometers}

- `page` & `limit` - Pagination parameters```



**Create Shop Example:****Response:**

```bash```json

POST /api/shops{

Authorization: Bearer <token>  "success": true,

Content-Type: multipart/form-data  "data": {

    "user": {

{      "_id": "...",

  "name": "My CDC Shop",      "email": "john@example.com",

  "description": "A friendly neighborhood shop",      "name": "John Doe",

  "address": "123 Main St, Singapore",      "role": "registered_shopper"

  "phone": "+65 6123 4567",    },

  "category": "grocery",    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

  "location": {  }

    "lat": 1.3521,}

    "lng": 103.8198```

  },

  "operatingHours": [### Login with Google OAuth

    {

      "dayOfWeek": 1,**Request:**

      "openTime": "09:00",```bash

      "closeTime": "18:00",POST /api/auth/google

      "isClosed": falseContent-Type: application/json

    }

  ],{

  "images": [<file>]  "credential": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjU5N...",

}  "role": "registered_shopper"

```}

````

#### Search (`/api/search`)

**Response:**

| Method | Endpoint | Description | Auth Required |```json

|--------|----------|-------------|---------------|{

| GET | `/search/shops` | Search shops by name/category/location | No | "success": true,

| GET | `/search/items` | Search items across all shops | No | "data": {

| GET | `/search/nearby` | Find nearby shops | No | "user": {

| GET | `/search/shops/:id/catalogue` | Get shop catalogue details | No | "\_id": "...",

      "email": "user@gmail.com",

**Search Shops Example:** "name": "John Doe",

````bash "role": "registered_shopper"

GET /api/search/shops?query=grocery&lat=1.3521&lng=103.8198&maxDistance=5    },

```    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

  }

#### Shopping Cart (`/api/cart`)}

````

| Method | Endpoint | Description | Auth Required | Role |

|--------|----------|-------------|---------------|------|### Search Items

| GET | `/cart` | Get user's cart | Yes | Shopper |

| POST | `/cart/add` | Add shop to cart | Yes | Shopper |**Request:**

| DELETE | `/cart/remove/:shopId` | Remove shop from cart | Yes | Shopper |```bash

| DELETE | `/cart/clear` | Clear entire cart | Yes | Shopper |GET /api/search/items?query=rice&category=grocery&availability=true&sortBy=distance&lat=1.3016&lng=103.9056

| POST | `/cart/generate-route` | Generate optimal shopping route | Yes | Shopper |```

**Add to Cart Example:\*\***Response:\*\*

`bash`json

POST /api/cart/add{

Authorization: Bearer <token> "success": true,

Content-Type: application/json "data": {

    "results": [

{ {

"shopId": "shop_id_here" "shopId": "...",

} "shopName": "FairPrice Marine Parade",

````"shopAddress": "...",

        "shopCategory": "grocery",

**Generate Route Example:**        "distance": 0.5,

```bash        "item": {

POST /api/cart/generate-route          "name": "Jasmine Rice 5kg",

Authorization: Bearer <token>          "description": "Premium quality jasmine rice",

Content-Type: application/json          "price": 12.50,

          "availability": true,

{          "cdcVoucherAccepted": true

  "origin": {        }

    "lat": 1.3521,      }

    "lng": 103.8198    ],

  },    "pagination": {

  "mode": "walking",      "page": 1,

  "shopIds": ["shop_id_1", "shop_id_2", "shop_id_3"]      "limit": 20,

}      "total": 45,

```      "pages": 3

    }

**Response:**  }

```json}

{```

  "success": true,

  "data": {### Submit Review

    "totalDistance": 2.5,

    "totalDuration": 30,**Request:**

    "optimizedOrder": [```bash

      {POST /api/reviews

        "shopId": "shop_id_2",Authorization: Bearer <token>

        "shopName": "Shop B",Content-Type: application/json

        "lat": 1.3522,

        "lng": 103.8200{

      },  "itemId": "...",

      ...  "catalogueId": "...",

    ],  "rating": 5,

    "polyline": "encoded_polyline_string",  "comment": "Great quality rice!",

    "mode": "walking"  "availability": true

  }}

}```

````

**Response:**

#### Reviews (`/api/reviews`)```json

{

| Method | Endpoint | Description | Auth Required | Role | "success": true,

|--------|----------|-------------|---------------|------| "message": "Review submitted successfully",

| GET | `/reviews` | Get all reviews (with filters) | No | - | "data": {

| GET | `/reviews/:id` | Get review by ID | No | - | "reviewId": "..."

| POST | `/reviews` | Create review | Yes | Shopper | }

| PUT | `/reviews/:id` | Update own review | Yes | Shopper |}

| DELETE | `/reviews/:id` | Delete own review | Yes | Shopper |```

| POST | `/reviews/:id/report` | Report inappropriate review | Yes | Shopper |

## Error Handling

**Create Review Example:**

````bashAll errors follow this format:

POST /api/reviews

Authorization: Bearer <token>```json

Content-Type: application/json{

  "success": false,

{  "message": "Error message",

  "itemId": "item_id_here",  "errors": ["Detailed error 1", "Detailed error 2"]

  "rating": 5,}

  "comment": "Excellent product!",```

  "availability": true

}### HTTP Status Codes

````

- `200`: Success

#### Items/Catalogue (`/api/items`)- `201`: Created

- `400`: Bad Request (validation errors)

| Method | Endpoint | Description | Auth Required | Role |- `401`: Unauthorized (not authenticated)

|--------|----------|-------------|---------------|------|- `403`: Forbidden (insufficient permissions)

| GET | `/items` | Get all items | No | - |- `404`: Not Found

| GET | `/items/:id` | Get item by ID | No | - |- `409`: Conflict (duplicate entry)

| POST | `/items` | Create item | Yes | Owner |- `429`: Too Many Requests (rate limited)

| PUT | `/items/:id` | Update item | Yes | Owner |- `500`: Internal Server Error

| DELETE | `/items/:id` | Delete item | Yes | Owner |

| GET | `/items/:id/reviews` | Get item reviews | No | - |## Database Models

#### Owner Routes (`/api/owner`)### User Hierarchy (Discriminator Pattern)

| Method | Endpoint | Description | Auth Required | Role |```

|--------|----------|-------------|---------------|------|User (Base)

| GET | `/owner/shops` | Get owner's shops | Yes | Owner |├── RegisteredShopper

| GET | `/owner/shops/:id/stats` | Get shop statistics | Yes | Owner |├── Owner

| PUT | `/owner/shops/:id/verify` | Verify shop ownership | Yes | Owner |└── Admin

| GET | `/owner/catalogue/:shopId` | Get shop catalogue items | Yes | Owner |```

#### Admin Routes (`/api/admin`)### Key Features

| Method | Endpoint | Description | Auth Required | Role |- **Geospatial Indexing**: Shops have 2dsphere index for location-based queries

|--------|----------|-------------|---------------|------|- **Text Indexing**: Shops and items have text indexes for full-text search

| GET | `/admin/users` | Get all users | Yes | Admin |- **Soft Deletes**: Users and shops marked as inactive instead of deletion

| GET | `/admin/reports` | Get all reports | Yes | Admin |- **Audit Trail**: All moderation actions logged with timestamps

| POST | `/admin/users/:id/warn` | Issue warning to user | Yes | Admin |- **Warning System**: Automatic tracking of warnings per user

| POST | `/admin/users/:id/ban` | Ban user | Yes | Admin |

| DELETE | `/admin/reviews/:id` | Delete review | Yes | Admin |## Thresholds & Limits

| DELETE | `/admin/shops/:id` | Delete shop | Yes | Admin |

| GET | `/admin/logs` | Get moderation logs | Yes | Admin |- **Shopper Warning Threshold**: 3 warnings → eligible for removal

- **Owner Report Threshold**: 5 reports → eligible for removal

## Database Models- **Review Rate Limit**: 5 reviews per hour

- **Report Rate Limit**: 10 reports per hour

### User Model- **Max Images per Shop**: 10

- **Max Images per Item**: 5

````typescript- **Max Photos per Review**: 5

interface IUser {- **Max File Size**: 5MB per image

  email: string;

  passwordHash: string;## External API Integrations

  role: "guest" | "registered_shopper" | "owner" | "admin";

  name: string;### Singpass API (Mock)

  phone?: string;

  isActive: boolean;Used for shopper registration verification. Currently implemented as mock.

  emailVerified: boolean;

  emailVerifiedAt: Date | null;**Production Integration:**

  warnings: IWarning[];- Endpoint: Set `SINGPASS_API_URL` in `.env`

  createdAt: Date;- Authentication: API key required

  updatedAt: Date;- Verification: NRIC validation

}

```### Corppass API (Mock)



### Shop ModelUsed for owner registration verification. Currently implemented as mock.



```typescript**Production Integration:**

interface IShop {- Endpoint: Set `CORPPASS_API_URL` in `.env`

  name: string;- Authentication: API key required

  description: string;- Verification: UEN validation

  address: string;

  location: {### Google Maps API

    type: "Point";

    coordinates: [number, number]; // [lng, lat]Used for route optimization (Most Efficient Route generation).

  };

  phone: string;**Setup:**

  category: ShopCategory;1. Get API key from Google Cloud Console

  images: string[];2. Enable Directions API and Distance Matrix API

  operatingHours: IOperatingHours[];3. Set `GOOGLE_MAPS_API_KEY` in `.env`

  owner: ObjectId;

  catalogue?: ObjectId;## Development

  verifiedByOwner: boolean;

  reportCount: number;### Running Tests

  warnings: number;

  isActive: boolean;```bash

}npm test

````

### Operating Hours### Linting

`typescript`bash

interface IOperatingHours {npm run lint

dayOfWeek: number; // 0-6 (Sunday-Saturday)```

openTime: string; // HH:mm format

closeTime: string; // HH:mm format### Database Seeding

isClosed: boolean;

}The seed scripts populate the database with sample data:

````

**`npm run seed:frontend` (Recommended)**

### Catalogue ModelCreates:

- Sample shops with geolocation data (Marine Parade area)

```typescript- Complete catalogues with items and pricing

interface ICatalogue {- Sample reviews with ratings

  shop: ObjectId;- Test user accounts (check console output for credentials)

  items: ObjectId[]; // Array of Item references

  createdAt: Date;**`npm run seed` (Alternative)**

  updatedAt: Date;Creates:

}- 1 admin user

```- 5 registered shoppers

- 3 shop owners with their shops

### Item Model- Sample catalogues with items

- Sample reviews and ratings

```typescript

interface IItem {```bash

  catalogue: ObjectId;# Use the frontend seed for immediate testing

  name: string;npm run seed:frontend

  description: string;

  price?: number;# Or use the basic seed

  availability: boolean;npm run seed

  images: string[];```

  category?: string;

  cdcVoucherAccepted: boolean;## Deployment

  lastUpdatedBy: ObjectId;

  reviews: ObjectId[];### Environment Variables for Production

}

````

NODE_ENV=production

### ShoppingCart ModelPORT=5000

MONGODB_URI=<production-mongodb-uri>

````typescriptJWT_SECRET=<strong-random-secret>

interface IShoppingCart {GOOGLE_MAPS_API_KEY=<your-key>

  shopper: ObjectId;FRONTEND_URL=<your-frontend-url>

  items: ICartItem[];```

  createdAt: Date;

  updatedAt: Date;### Build and Start

}

```bash

interface ICartItem {npm run build

  shop: ObjectId;npm start

  itemTags: string[];```

  addedAt: Date;

}## Security Considerations

````

1. **Password Security**: bcrypt with 10 salt rounds

### Review Model2. **JWT Secret**: Use strong random string (32+ characters)

3. **Rate Limiting**: Prevents abuse and DDoS

````typescript4. **Input Validation**: All inputs validated before processing

interface IReview {5. **File Upload Security**: Type and size restrictions

  shopper: ObjectId;6. **CORS**: Configured for specific frontend origin

  item: string;7. **SQL/NoSQL Injection**: Mongoose provides protection

  catalogue: ObjectId;8. **XSS Protection**: Input sanitization implemented

  shop: ObjectId;

  description: string;## Logging

  availability: boolean;

  images: string[];All operations are logged using Pino:

  warnings: number;

  reportCount: number;- **Info**: Successful operations

  isActive: boolean;- **Warn**: Warning thresholds reached

}- **Error**: Errors and exceptions

```- **Debug**: Development debugging (dev mode only)



## AuthenticationLogs include:

- Timestamps

### JWT Authentication- Request URLs and methods

- User actions

- **Token Expiry:** 7 days (configurable via JWT_EXPIRES_IN)- Error stack traces

- **Token Payload:** Includes user ID, email, and role

- **Protected Routes:** Verified via `authenticate` middleware## Troubleshooting

- **Token Storage:** Client-side (localStorage/sessionStorage)

### MongoDB Connection Issues

**Token Format:**

```json**Error: "MongooseServerSelectionError: connect ECONNREFUSED"**

{- Check MongoDB Atlas connection string in `.env`

  "id": "user_id",- Verify your IP address is whitelisted in MongoDB Atlas

  "email": "user@example.com",- Ensure network security settings allow outbound connections

  "role": "registered_shopper",- Test connection: `mongosh "your-connection-string"`

  "iat": 1234567890,

  "exp": 1234567890**Error: "Authentication failed"**

}- Verify MongoDB username and password in connection string

```- Check database user has proper permissions

- Ensure password is URL-encoded if it contains special characters

### Role-Based Authorization

### Port Already in Use

**User Roles:**

- `guest` - Unauthenticated users (can search and view)**Error: "EADDRINUSE: address already in use :::5000"**

- `registered_shopper` - Can create reviews, use cart, generate routes```bash

- `owner` - Can manage shops and catalogues# Find process using port 5000

- `admin` - Can moderate content and manage userslsof -ti:5000



**Authorization Middleware:**# Kill the process

```typescriptlsof -ti:5000 | xargs kill -9

// Require specific role```

authorize(UserRole.OWNER)

### JWT Token Issues

// Require one of multiple roles

authorize(UserRole.OWNER, UserRole.ADMIN)**Error: "jwt malformed" or "invalid signature"**

```- Ensure `JWT_SECRET` is set and matches between environments

- JWT_SECRET must be at least 32 characters

### Password Security- Check token is being sent in Authorization header as "Bearer <token>"



- **Hashing:** bcrypt with salt rounds: 10### Google OAuth Not Working

- **Validation:** Minimum 8 characters, mix of letters, numbers

- **Reset Tokens:** Secure random tokens with expiry**Error: "Invalid Google token"**

- Verify `GOOGLE_CLIENT_ID` matches the one from Google Console

## File Upload- Check Google Console has correct authorized JavaScript origins

- Ensure credentials are for OAuth 2.0 Web Application type

Images are handled using Multer middleware:- Frontend must send valid Google credential token



**Configuration:**### Rate Limiting Issues

- **Storage:** Local disk in `uploads/` directory

- **File Types:** JPEG, PNG, GIF**Error: "Too many requests"**

- **Max File Size:** 5MB per file- Default: 100 requests per 15 minutes

- **Max Files:** 5 files per request- Adjust `RATE_LIMIT_MAX_REQUESTS` and `RATE_LIMIT_WINDOW_MS` in `.env`

- **Naming:** `timestamp-randomstring.ext`- Clear rate limit cache by restarting server



**Usage Example:**### File Upload Errors

```typescript

router.post('/shops', **Error: "File too large" or "Invalid file type"**

  authenticate,- Max file size: 5MB per file

  authorize(UserRole.OWNER),- Allowed types: JPEG, PNG, GIF

  upload.array('images', 5),- Check `uploads/` directory exists and has write permissions

  createShop

);### CORS Errors from Frontend

````

**Error: "CORS policy: No 'Access-Control-Allow-Origin' header"**

**File URL Format:**- Verify `FRONTEND_URL` in backend `.env` matches frontend URL

```- Check frontend is running on port 5173 (or update FRONTEND_URL)

http://localhost:5000/uploads/1699999999999-abc123.jpg- Restart backend after changing CORS settings

```

### Database Not Seeding

## ⚠️ Error Handling

**Error: "Duplicate key error" when seeding**

### Global Error Handler- Database already has data with same IDs

- Drop database and re-seed:

All errors are caught and formatted consistently:```bash

# In MongoDB Atlas or mongosh

**Error Response:**db.dropDatabase()

````json

{# Then re-seed

  "success": false,npm run seed:frontend

  "error": "Detailed error message",```

  "statusCode": 400,

  "stack": "..." // Only in development mode### TypeScript Compilation Errors

}

```**Error: Type checking failed**

```bash

### Custom Error Class# Clear build cache

rm -rf dist/

```typescript

class AppError extends Error {# Reinstall dependencies

  statusCode: number;rm -rf node_modules package-lock.json

  constructor(message: string, statusCode: number) {npm install

    super(message);

    this.statusCode = statusCode;# Rebuild

  }npm run build

}```



// Usage### Environment Variables Not Loading

throw new AppError('Resource not found', 404);

throw new AppError('Unauthorized access', 401);**Error: "undefined" for environment variables**

```- Ensure `.env` file exists in backend root directory

- Check `.env` file has no syntax errors

### Validation Errors- Verify `dotenv` is loaded before accessing `process.env`

- Restart server after changing `.env`

Request validation errors from express-validator:

### Server Crashes on Startup

```json

{**Check logs for specific errors:**

  "success": false,```bash

  "errors": [# Run with verbose logging

    {NODE_ENV=development npm run dev

      "field": "email",```

      "message": "Invalid email format"

    },Common causes:

    {- Missing environment variables

      "field": "password",- MongoDB connection failure

      "message": "Password must be at least 8 characters"- Port already in use

    }- Syntax errors in code

  ]

}## Support

````

For issues or questions:

## Development1. Check this README and troubleshooting section

2. Review server logs for error details

### Project Architecture3. Verify all environment variables are set correctly

4. Check MongoDB Atlas connection and network settings

**Layered Architecture:**5. Ensure frontend `.env.local` matches backend configuration

1. **Routes Layer:** Define endpoints and middleware6. Review API endpoint documentation above

2. **Controller Layer:** Handle requests, validate input

3. **Service Layer:** Business logic and data processing
4. **Model Layer:** Database interactions via Mongoose

**Separation of Concerns:**

- Controllers: HTTP logic only
- Services: Business logic, reusable across controllers
- Models: Data structure and validation
- Middleware: Cross-cutting concerns (auth, logging, errors)

### Code Style Guidelines

- Use TypeScript strict mode
- Follow ESLint configuration
- Use async/await over callbacks
- Add JSDoc comments for complex functions
- Keep functions small and focused
- Use meaningful variable names

### Best Practices

✅ **Do:**

- Validate all user input
- Use environment variables for configuration
- Log errors appropriately
- Handle async errors with try-catch or asyncHandler
- Return consistent API responses
- Use HTTP status codes correctly
- Keep routes thin, services thick

❌ **Don't:**

- Store secrets in code
- Return sensitive data (e.g., password hashes)
- Allow SQL/NoSQL injection
- Ignore error handling
- Use synchronous operations in request handlers

### MongoDB Best Practices

- Use indexes for frequently queried fields
- Use geospatial indexes for location queries
- Validate data with Mongoose schemas
- Use transactions for multi-document operations
- Limit returned fields with `.select()`
- Use lean() for read-only queries

## Troubleshooting

### Common Issues

**MongoDB Connection Error:**

```
MongooseServerSelectionError: connect ECONNREFUSED
```

**Solution:**

- Check MONGODB_URI is correct
- Verify IP whitelist in MongoDB Atlas (use 0.0.0.0/0 for dev)
- Ensure network connectivity

**JWT Verification Failed:**

```
JsonWebTokenError: jwt malformed
```

**Solution:**

- Check JWT_SECRET matches across environments
- Verify token is sent in `Authorization: Bearer <token>` format
- Check token hasn't expired

**File Upload Fails:**

```
MulterError: File too large
```

**Solution:**

- Check file size is < 5MB
- Verify file type is image (JPEG/PNG/GIF)
- Ensure `uploads/` directory exists and is writable

**CORS Error in Frontend:**

```
Access to fetch has been blocked by CORS policy
```

**Solution:**

- Check FRONTEND_URL in `.env` matches your frontend URL
- Verify CORS middleware is properly configured
- Check credentials are included in frontend requests

### Debug Mode

Enable detailed logging in development:

```env
NODE_ENV=development
DEBUG=*
```

### Health Check

Test if server is running:

```bash
GET http://localhost:5000/api/health
```

Expected response:

```json
{
  "success": true,
  "message": "API is healthy",
  "timestamp": "2024-11-09T12:00:00.000Z"
}
```

## Production Deployment

### Pre-Deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong JWT_SECRET (32+ characters)
- [ ] Configure production MongoDB URI
- [ ] Set proper CORS origins
- [ ] Enable HTTPS
- [ ] Set up environment variables on hosting platform
- [ ] Configure logging service
- [ ] Set up monitoring and alerts
- [ ] Test all critical endpoints
- [ ] Enable rate limiting

### Build for Production

```bash
npm run build
```

Compiled files will be in `/dist` directory.

### Recommended Hosting Platforms

- **Heroku** - Easy Git-based deployment
- **Railway** - Modern platform with MongoDB integration
- **Render** - Simple deployment with free tier
- **DigitalOcean App Platform** - More control
- **AWS/Google Cloud** - Enterprise scale

### Environment Variables on Hosting

Make sure to set all required environment variables on your hosting platform's dashboard.

## Support & Contributing

### Reporting Issues

Found a bug? Please open an issue on GitHub with:

- Description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Environment details (Node version, OS, etc.)

### Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

**OneCDC Backend API** | Built with ❤️ in Singapore 🇸🇬
