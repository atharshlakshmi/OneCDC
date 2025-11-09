# OneCDC - CDC Voucher Shop Finder

Helps users discover and manage Community Development Council (CDC) voucher-accepting shops in Singapore. Users can search for shops and items, read reviews, plan optimal shopping routes, and shop owners can manage their catalogues.

![OneCDC Banner](https://via.placeholder.com/800x200/fbbf24/ffffff?text=OneCDC+-+Smart+Shopping+Made+Easy)

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Development](#development)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Future Plans](#future-plans)
- [Contributing](#contributing)
- [License](#license)

## Features

### For All Users (Guest & Registered)

- **Smart Search:** Search shops by name, category, location, or operating hours
- **Item Discovery:** Search for items across all shops with availability status
- **Shop Details:** View comprehensive shop information, hours, and contact details
- **Browse Catalogues:** Explore shop catalogues with real-time availability and pricing
- **Read Reviews:** Access item reviews and ratings from the community
- **Geolocation Search:** Distance-based search and sorting using your location
- **Interactive Maps:** Google Maps integration for shop locations

### For Registered Shoppers

All guest features, plus:

- **Shopping Cart:** Add multiple shops to your cart
- **Route Optimization:** Generate the most efficient route through selected shops (walking/driving)
- **Submit Reviews:** Rate and review items you've purchased
- **Manage Reviews:** Edit or delete your own reviews
- **Report Content:** Report inappropriate reviews or shops
- **Profile Management:** Manage your account and preferences

### For Shop Owners

- **Shop Management:** Update shop details, hours, and contact information
- **Catalogue Control:** Create and manage your shop's item catalogue
- **Item Management:** Add, edit, or remove items with prices and availability
- **View Reviews:** See what customers are saying about your items
- **Verification Status:** Display verified owner badge for credibility
- **Profile Management:** Manage business profile and settings

### For Administrators

- **Content Moderation:** Review and manage reported content
- **Issue Warnings:** Send warnings to users who violate policies
- **Remove Content:** Delete inappropriate reviews, shops, or items
- **User Management:** Ban users who exceed warning thresholds
- **Analytics Dashboard:** View system analytics and moderation logs
- **Moderation History:** Track all moderation actions

## Tech Stack

### Frontend

- **Framework:** React 19 with TypeScript
- **Build Tool:** Vite 7
- **Routing:** React Router v7
- **Styling:** Tailwind CSS v4 with Tailwind Animate
- **UI Components:** Radix UI (Tabs, Select, Slot) + Shadcn/ui
- **Icons:** Lucide React, React Icons, React Feather
- **HTTP Client:** Axios + Custom Fetch API wrapper
- **Notifications:** Sonner (toast notifications)
- **State Management:** React Context API + Custom Hooks

### Backend

- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens)
- **Validation:** Express Validator
- **Security:** bcrypt for password hashing, CORS
- **File Upload:** Multer for image handling
- **API Architecture:** RESTful API design

### External APIs

- **Google Maps JavaScript API** - Interactive map display
- **Google Places API** - Location search and autocomplete
- **Google Directions API** - Route planning with multiple transport modes

## Project Structure

```
OneCDC/
├── backend/                 # Express.js + MongoDB + TypeScript API
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Auth, validation, error handling
│   │   ├── types/          # TypeScript type definitions
│   │   ├── utils/          # Helper functions
│   │   └── index.ts        # Application entry point
│   ├── uploads/            # Uploaded images storage
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
├── frontend/               # React + Vite + TypeScript application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   │   ├── AuthUI/     # Authentication pages
│   │   │   ├── ShopperUI/  # Shopper-specific pages
│   │   │   ├── OwnerUI/    # Owner-specific pages
│   │   │   └── AdminUI/    # Admin-specific pages
│   │   ├── context/        # React Context providers
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utilities and API client
│   │   ├── App.tsx         # Main app with routing
│   │   └── main.tsx        # Application entry point
│   ├── public/             # Static assets
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── README.md
│
├── .gitignore
├── package.json            # Root package.json
└── README.md               # This file
```

````

## ⚡ Quick Start

### Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- **MongoDB** Atlas account (or local MongoDB)
- **Google Maps API key** (for maps and route generation)
- **Google OAuth 2.0 credentials** (optional, for Google Sign-In)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/atharshlakshmi/OneCDC.git
   cd onecdcTIMTEST
````

2. **Install dependencies for both frontend and backend**

   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

### Configuration

#### Backend Configuration

Create `backend/.env` file:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=your_mongodb_connection_string

# Authentication
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Google Maps API
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

**Generate JWT Secret:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### Frontend Configuration

Create `frontend/.env.local` file:

```env
# Backend API URL
VITE_API_BASE_URL=http://localhost:5000/api

# Environment
VITE_APP_ENV=development

# Google OAuth (Optional)
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### Running the Application

#### Option 1: Run Separately (Development)

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
```

Backend runs on `http://localhost:5000`

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

Frontend runs on `http://localhost:5173`

#### Option 2: Run Concurrently (from root)

```bash
npm install  # Install concurrently
npm run dev  # Runs both frontend and backend
```

### Access the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000/api
- **API Health Check:** http://localhost:5000/api/health

## Development

### Backend Development

```bash
cd backend

# Development with hot reload
npm run dev

# Build TypeScript
npm run build

# Run production build
npm start

# Run tests
npm test
```

### Frontend Development

```bash
cd frontend

# Development server with HMR
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Code Structure Guidelines

**Backend:**

- Controllers handle HTTP requests/responses
- Services contain business logic
- Models define database schemas
- Middleware handles auth, validation, errors
- Routes define API endpoints

**Frontend:**

- Components are reusable UI elements
- Pages are route-specific components
- Context manages global state
- Hooks provide reusable logic
- Lib contains utilities and API client

## API Documentation

### Authentication Endpoints

```
POST   /api/auth/register        # Register new user
POST   /api/auth/login           # Login user
POST   /api/auth/logout          # Logout user
GET    /api/auth/me              # Get current user
POST   /api/auth/google          # Google OAuth login
POST   /api/auth/forgot-password # Request password reset
POST   /api/auth/reset-password  # Reset password
```

### Shop Endpoints

```
GET    /api/shops                # Get all shops (with filters)
GET    /api/shops/:id            # Get shop by ID
POST   /api/shops                # Create shop (Owner only)
PUT    /api/shops/:id            # Update shop (Owner only)
DELETE /api/shops/:id            # Delete shop (Owner only)
GET    /api/shops/:id/catalogue  # Get shop catalogue
```

### Search Endpoints

```
GET    /api/search/shops         # Search shops
GET    /api/search/items         # Search items
GET    /api/search/nearby        # Search shops by location
```

### Cart & Route Endpoints

```
GET    /api/cart                 # Get user's cart
POST   /api/cart/add             # Add shop to cart
DELETE /api/cart/remove/:shopId  # Remove shop from cart
DELETE /api/cart/clear           # Clear cart
POST   /api/cart/generate-route  # Generate optimal route
```

### Review Endpoints

```
GET    /api/reviews              # Get all reviews
GET    /api/reviews/:id          # Get review by ID
POST   /api/reviews              # Create review
PUT    /api/reviews/:id          # Update review
DELETE /api/reviews/:id          # Delete review
POST   /api/reviews/:id/report   # Report review
```

For complete API documentation, see [backend/README.md](backend/README.md)

## Deployment

### Backend Deployment (Heroku/Railway/Render)

1. Set environment variables
2. Ensure MongoDB Atlas is accessible
3. Update `FRONTEND_URL` in environment
4. Deploy:
   ```bash
   git push heroku main
   ```

### Frontend Deployment (Vercel/Netlify)

1. Set `VITE_API_BASE_URL` to production API URL
2. Build and deploy:
   ```bash
   npm run build
   ```

### MongoDB Atlas Setup

1. Create cluster on MongoDB Atlas
2. Add IP whitelist (0.0.0.0/0 for development)
3. Create database user
4. Get connection string
5. Add to backend `.env`

## Future Plans

- **Mobile App:** Native iOS/Android apps (React Native)
- **Push Notifications:** Real-time alerts for deals and updates
- **Multi-Language Support:** Chinese, Malay, Tamil translations
- **Owner Analytics:** Dashboard with visitor stats and insights
- **Offline Mode:** Cache shop data for offline browsing

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before PR

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Singapore CDC for voucher program inspiration
- Google Maps Platform for location services
- MongoDB Atlas for database hosting
- Vercel/Netlify for frontend hosting
- All open-source contributors

---

**Built with ❤️ in Singapore**

**Repository:** [github.com/atharshlakshmi/OneCDC](https://github.com/atharshlakshmi/OneCDC)

# JWT Configuration

JWT_SECRET=your-super-secret-jwt-key-min-32-characters-change-in-production (copy from above)
JWT_EXPIRE=7d

# CORS

FRONTEND_URL=http://localhost:5173the

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

````

#### 2. Frontend Configuration

Create `/frontend/.env.local` file:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_ENV=development
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
````

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
