# OneCDC

A comprehensive web application that helps users discover and manage Community Development Council (CDC) voucher-accepting shops in Singapore. Users can search for shops and items, read reviews, plan shopping routes, and owners can manage their shop catalogues.

## Quick Start

### Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- **MongoDB Atlas account** (or local MongoDB)
- **Google Maps API key** (for route generation)
- **Google OAuth 2.0 credentials** (for Google Sign-In)

### Quick Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/softwarelab3/2006-STA1-52.git
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

### Backend Setup

1. Copy the example environment file:
   ```bash
   cd backend
   cp .env.example .env
   ```

2. Open the `.env` file and fill in your actual values using the instructions below.

### Backend Environment Variables

The `.env.example` file in the `backend/` directory contains all the required and optional variables. After copying it to `.env`, update the following variables with your actual credentials:

#### 1. MongoDB Configuration

```env
MONGODB_URI=mongodb://localhost:27017/onecdc
```

**How to get it:**
- **Local Development:** Install MongoDB locally and use the connection string above
- **MongoDB Atlas (Cloud):**
  1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
  2. Create a free account and sign in
  3. Create a new cluster (free tier available)
  4. Click "Connect" → "Connect your application"
  5. Copy the connection string (e.g., `mongodb+srv://username:password@cluster.mongodb.net/onecdc`) into `backend/.env`
  6. Replace `<password>` with your database user password
  7. Replace `<dbname>` with `onecdc` or your preferred database name

#### 2. JWT Secret

```env
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRE=7d
```

**How to get it:**
- Generate a random secure string (recommended: at least 32 characters)
- Use a password generator or run: `openssl rand -base64 32`

#### 3. Google OAuth Configuration

```env
GOOGLE_CLIENT_ID= ...
GOOGLE_CLIENT_SECRET= ...
```

**How to get it:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google+ API**:
   - Navigate to "APIs & Services" → "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - Configure the OAuth consent screen if prompted
   - Select "Web application" as application type
   - Add authorized JavaScript origins:
     - `http://localhost:5173` (frontend dev)
     - `http://localhost:5000` (backend dev)
   - Add authorized redirect URIs:
     - `http://localhost:5173/auth/google/callback`
     - `http://localhost:5000/api/auth/google/callback`
   - Click "Create"
5. Copy the **Client ID** and **Client Secret** into `backend/.env`

#### 4. Google Maps API Key

```env
GOOGLE_MAPS_API_KEY= ...
```

**How to get it:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Use the same project as your OAuth credentials (or create a new one)
3. Enable required APIs:
   - Navigate to "APIs & Services" → "Library"
   - Search for and enable:
     - **Maps JavaScript API**
     - **Places API**
     - **Geocoding API**
     - **Distance Matrix API**
4. Create API credentials:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy the generated API key
5. (Optional but recommended) Restrict the API key:
   - Click on the API key to edit
   - Under "API restrictions", select "Restrict key"
   - Select the APIs you enabled above
   - Under "Application restrictions", add your domain/localhost

#### 5. Hugging Face API (for search features)

```env
HF_TOKEN= ...
```

**How to get it:**
1. Go to [Hugging Face](https://huggingface.co/)
2. Create a free account and sign in
3. Go to [Settings → Access Tokens](https://huggingface.co/settings/tokens)
4. Click "New token"
5. Give it a name and select "read" permissions
6. Copy the token (starts with `hf_`)

#### Optional Variables

```env
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# JWT Configuration
JWT_EXPIRES_IN=7d

# Default Location (Singapore)
DEFAULT_LAT=1.3016
DEFAULT_LNG=103.9056

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
REVIEW_RATE_LIMIT_WINDOW_MS=3600000
REVIEW_RATE_LIMIT_MAX=5
REPORT_RATE_LIMIT_WINDOW_MS=3600000
REPORT_RATE_LIMIT_MAX=10

# File Upload
MAX_FILE_SIZE=5242880
MAX_FILES=5

# Thresholds
SHOPPER_WARNING_THRESHOLD=3
OWNER_REPORT_THRESHOLD=5
```

### Your .env File

After copying `backend/.env.example` to `backend/.env`, your file will contain all the variables listed above. Simply replace the placeholder values with your actual credentials following the instructions provided for each variable.

### Frontend Setup

1. Copy the example environment file:
   ```bash
   cd frontend
   cp .env.example .env
   ```

2. Open the `.env` file and fill in your actual values using the instructions below.

### Frontend Environment Variables

After copying `frontend/.env.example` to `frontend/.env`, you'll have:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID= ... # TO CHANGE
VITE_GOOGLE_MAPS_API_KEY= ... # TO CHANGE
```

Copy the **Client ID** and **Client Secret** from `backend/.env` into `frontend/.env` file 

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
