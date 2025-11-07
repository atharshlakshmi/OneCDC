# OneCDC

A comprehensive web application that helps users discover and manage Community Development Council (CDC) voucher-accepting shops in Singapore. Users can search for shops and items, read reviews, plan shopping routes, and owners can manage their shop catalogues.

## Features Overview

### For All Users (Guest & Registered)
- Search for shops by name, category, location, or operating hours
- Search for items across all shops
- View shop details, operating hours, and contact information
- Browse shop catalogues with item availability and prices
- Read item reviews and ratings
- Geolocation-based search with distance sorting
- Interactive map integration

### For Registered Shoppers
- All guest features plus:
- Add shops to shopping cart
- Generate most efficient route through selected shops
- Submit reviews and ratings for items
- Edit or delete own reviews
- Report inappropriate reviews or shops
- Profile management

### For Shop Owners
- Manage shop information (details, hours, contact)
- Create and update shop catalogues
- Add, edit, or remove items from catalogue
- Update item availability and pricing
- View reviews for your items
- Profile management

### For Administrators
- Moderate reported reviews and shops
- Issue warnings to users
- Remove inappropriate content
- Ban users who exceed warning thresholds
- View moderation logs and system analytics

## Project Structure

```
OneCDC/
├── backend/          # Express.js + MongoDB + TypeScript API
├── frontend/         # React + Vite + TypeScript application
├── package.json      # Root-level dependencies
└── README.md         # This file
```

## Tech Stack

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Language:** TypeScript (strict mode)
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT + bcrypt, Google OAuth 2.0
- **Email:** Nodemailer
- **File Upload:** Multer
- **Rate Limiting:** express-rate-limit
- **Logging:** Pino
- **Validation:** express-validator, Zod

### Frontend
- **Framework:** React 19
- **Build Tool:** Vite
- **Language:** TypeScript
- **Routing:** React Router v7
- **Styling:** Tailwind CSS v4
- **UI Components:** Radix UI
- **Icons:** Lucide React, React Icons
- **HTTP Client:** Axios, Fetch API
- **Notifications:** Sonner (toast notifications)

## Quick Start

### Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- **MongoDB Atlas account** (or local MongoDB)
- **Google Maps API key** (for route generation)
- **Google OAuth 2.0 credentials** (for Google Sign-In)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd OneCDC
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Configuration

#### 1. Backend Configuration

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

#### 2. Frontend Configuration

Create `/frontend/.env.local` file:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_ENV=development
VITE_GOOGLE_CLIENT_ID=528326458371-5ljkvl01018ful5opd5b579fbbsbet8i.apps.googleusercontent.com
```

### Database Setup

Seed the database with sample data:

```bash
cd backend
npm run seed:frontend
```

This creates:
- Sample shops with geolocation data
- Items in each shop catalogue
- Sample reviews with ratings
- Test user accounts (shopper, owner, admin)

### Running the Application

#### Start Backend (Terminal 1)
```bash
cd backend
npm run dev
```
Backend runs on: `http://localhost:5000`

#### Start Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```
Frontend runs on: `http://localhost:5173`

### Accessing the Application

1. Open browser to `http://localhost:5173`
2. You'll see the home page with search functionality
3. Try these test accounts (if seeded):
   - **Shopper:** Check seeded user credentials
   - **Owner:** Check seeded owner credentials
   - **Admin:** Check seeded admin credentials

## User Guide

### Guest Users (No Login Required)

**Search for Shops:**
1. Navigate to "Store Search" from footer menu
2. Use search bar or filters (category, open now, etc.)
3. Click on a shop to view details
4. Switch to "Catalogue" tab to see items

**Search for Items:**
1. Navigate to "Item Search" from footer menu
2. Search by item name or category
3. Results show item details and which shop carries it
4. Click to view full item details and reviews

### Registered Shoppers

**Creating an Account:**
1. Click "Sign Up" on login page
2. Choose "Register as Shopper"
3. Fill in details or use "Sign in with Google"
4. Verify email if required

**Using Shopping Cart:**
1. Browse shops and add to cart using "Add Shop to Cart" button
2. Click shopping cart icon in navbar
3. View all shops in cart
4. Generate most efficient route to visit all shops
5. Remove shops as needed

**Submitting Reviews:**
1. Navigate to an item page
2. Click "Review Item" button
3. Rate 1-5 stars and write comment
4. Indicate if item is currently available
5. Submit review

**Managing Reviews:**
1. Go to Profile > See Reviews
2. View all your submitted reviews
3. Click "Edit" to update review
4. Click "Delete" to remove review

**Reporting Content:**
- **Report Review:** Click "Report" on any review
- **Report Shop:** Click "Report Shop" on shop details page
- Provide reason for report
- Admins will moderate the report

### Shop Owners

**Registering as Owner:**
1. Click "Sign Up" on login page
2. Choose "Register as Owner"
3. Provide business details (UEN, business name)
4. Verify business credentials

**Managing Shop Details:**
1. Navigate to your shop page
2. Click "Edit Shop Details"
3. Update:
   - Shop name and description
   - Operating hours
   - Contact number
   - Address (geocoded automatically)
   - Category
4. Save changes

**Managing Catalogue:**
1. Go to shop page > Catalogue tab
2. Click "Add New Item" to create items
3. For each item specify:
   - Item name and description
   - Price
   - Availability status
   - Whether CDC vouchers are accepted
4. Edit or delete items as needed

### Administrators

**Moderating Reports:**
1. Login with admin account
2. Navigate to Admin Dashboard
3. View reported reviews and shops
4. For each report:
   - Review content and context
   - Issue warning to user
   - Remove content if necessary
   - Dismiss report if unfounded

**Managing Users:**
1. View users with warnings
2. Remove users who exceed thresholds
3. Review moderation logs

## API Endpoints

Base URL: `http://localhost:5000/api`

### Authentication
- `POST /auth/register/shopper` - Register new shopper
- `POST /auth/register/owner` - Register new owner
- `POST /auth/login` - Login with email/password
- `POST /auth/google` - Google OAuth login
- `POST /auth/logout` - Logout
- `GET /auth/profile` - Get user profile

### Search
- `GET /search/items` - Search items with filters
- `GET /search/shops` - Search shops with filters

### Cart (Shoppers Only)
- `GET /cart` - Get cart items
- `POST /cart/add` - Add shop to cart
- `DELETE /cart/remove/:shopId` - Remove shop
- `POST /cart/generate-route` - Generate optimal route

### Reviews (Registered Users)
- `POST /reviews` - Submit review
- `GET /reviews/item/:itemId` - Get item reviews
- `PUT /reviews/:id` - Update own review
- `DELETE /reviews/:id` - Delete own review

### Owner Routes
- `GET /owner/shops` - Get owner's shops
- `POST /owner/shops` - Create new shop
- `PUT /owner/shops/:id` - Update shop
- `POST /owner/shops/:id/catalogue` - Add catalogue item
- `PUT /owner/shops/:id/catalogue/:itemId` - Update item
- `DELETE /owner/shops/:id/catalogue/:itemId` - Delete item

### Reports
- `POST /reports/review` - Report a review
- `POST /reports/shop` - Report a shop

### Admin Routes
- `GET /admin/reports/reviews` - Get reported reviews
- `GET /admin/reports/shops` - Get reported shops
- `POST /admin/moderate/review/:id` - Moderate review
- `POST /admin/moderate/shop/:id` - Moderate shop
- `GET /admin/users` - Get users with warnings
- `DELETE /admin/users/:id` - Remove user


## Troubleshooting

### Backend won't start
- Verify `MONGODB_URI` in `.env` is correct
- Check MongoDB Atlas IP whitelist includes your IP
- Ensure port 5000 is not in use: `lsof -ti:5000`
- Verify Node.js version: `node -v` (should be 18+)

### Frontend shows errors
- Verify backend is running on port 5000
- Check `VITE_API_BASE_URL` in `.env.local`
- Clear browser cache and localStorage
- Check browser console for specific errors

### Google Sign-In not working
- Verify `GOOGLE_CLIENT_ID` matches in both backend and frontend .env files
- Ensure `http://localhost:5173` is added to authorized origins in Google Console
- Check that credentials are for OAuth 2.0 Web Application type

### Search returns no results
- Ensure database is seeded: `npm run seed:frontend`
- Check that shops have geolocation coordinates
- Verify location permissions in browser

### Port conflicts
```bash
# Kill port 5000 (backend)
lsof -ti:5000 | xargs kill -9

# Kill port 5173 (frontend)
lsof -ti:5173 | xargs kill -9
```

## Security Considerations

- All passwords hashed with bcrypt (10 salt rounds)
- JWT tokens with expiration (7 days default)
- Rate limiting on all routes to prevent abuse
- Input validation and sanitization
- CORS configured for specific frontend origin
- File upload restrictions (type and size)
- Role-based access control (RBAC)

## License

This project is for the NTU module SC2006 Software Engineering.

## Support

For detailed API documentation, see `/backend/README.md`
For frontend architecture details, see `/frontend/README.md`
