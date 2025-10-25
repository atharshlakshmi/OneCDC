# OneCDC

A web application that helps users discover and manage Community Development Council (CDC) participating shops and items.

## Project Structure

```
OneCDC/
├── backend/          # Express.js + MongoDB backend API
├── frontend/         # React + Vite frontend application
└── README.md         # This file
```

## Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **MongoDB Atlas account** (or local MongoDB installation)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd OneCDC
   ```

2. **Set up Backend**
   ```bash
   cd backend
   npm install
   ```

3. **Set up Frontend**
   ```bash
   cd ../frontend
   npm install
   ```

### Configuration

1. **Backend Configuration**

   Create or verify `/backend/.env` with your MongoDB connection string:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Database
   MONGODB_URI="your-mongodb-connection-string"

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=7d

   # CORS
   FRONTEND_URL=http://localhost:5173

   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100

   # Default Location (Marine Parade, Singapore)
   DEFAULT_LAT=1.3016
   DEFAULT_LNG=103.9056
   ```

2. **Frontend Configuration**

   Create or verify `/frontend/.env.local`:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   VITE_APP_ENV=development
   ```

### Running the Application

#### Option 1: Run Both Services Manually

1. **Start Backend** (Terminal 1)
   ```bash
   cd backend
   npm run dev
   ```
   Backend runs on `http://localhost:5000`

2. **Start Frontend** (Terminal 2)
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend runs on `http://localhost:5173`

#### Option 2: Use Package Scripts

From the root directory, you can use:
```bash
# Install all dependencies
npm run install:all

# Run both backend and frontend
npm run dev
```

### Initial Data Setup

Before using the application, seed the database with sample data:

```bash
cd backend
npm run seed:frontend
```

This creates:
- 3 sample shops (Tech Haven, Gadget World, Office Supplies Co.)
- Items for each shop
- Sample reviews
- A default owner account

### Accessing the Application

1. Open your browser to `http://localhost:5173`
2. You should see the home page with 3 shops loaded from the API
3. Click on any shop to view details
4. Click on items to see reviews

## Development

### Backend Development

```bash
cd backend
npm run dev        # Start dev server with hot reload
npm run build      # Compile TypeScript
npm run lint       # Run ESLint
```

### Frontend Development

```bash
cd frontend
npm run dev        # Start dev server
npm run build      # Build for production
npm run preview    # Preview production build
```

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### Health Check
```
GET /api/health
```

#### Shops
```
GET /api/shops              # Get all shops
GET /api/shops/:id          # Get shop by ID
```

#### Items
```
GET /api/items              # Get all items
GET /api/items/:id          # Get item by ID
GET /api/items/:id/reviews  # Get reviews for an item
```

## Tech Stack

### Backend
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** MongoDB (Mongoose ODM)
- **Authentication:** JWT
- **Logging:** Pino
- **Rate Limiting:** express-rate-limit
- **File Upload:** Multer

### Frontend
- **Framework:** React 19
- **Build Tool:** Vite
- **Language:** TypeScript
- **Routing:** React Router v7
- **Styling:** Tailwind CSS
- **HTTP Client:** Fetch API

## Troubleshooting

### Backend won't start
- Verify MongoDB connection string in `.env`
- Check if port 5000 is available: `lsof -ti:5000`
- Ensure Node.js version is 18+

### Frontend shows "Loading..." forever
- Verify backend is running on port 5000
- Check CORS configuration in backend `.env`
- Verify `VITE_API_BASE_URL` in frontend `.env.local`
- Check browser console for errors

### Database connection errors
- Verify MongoDB Atlas IP whitelist includes your IP
- Check MongoDB connection string format
- Ensure database user has proper permissions

### Port conflicts
Kill processes on occupied ports:
```bash
# Kill port 5000 (backend)
lsof -ti:5000 | xargs kill -9

# Kill port 5173 (frontend)
lsof -ti:5173 | xargs kill -9
```

## Project Status

### Completed Features
- ✅ MongoDB database schema with discriminator pattern
- ✅ User authentication system (Shoppers, Owners, Admins)
- ✅ Shop and catalogue management
- ✅ Review and rating system
- ✅ Geospatial search capabilities
- ✅ Frontend-backend API integration
- ✅ Rate limiting and security middleware

### Frontend Features
- ✅ Browse shops
- ✅ View shop details
- ✅ View items and prices
- ✅ Read reviews
- ✅ Shopping cart (localStorage)

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

This project is for educational purposes.
