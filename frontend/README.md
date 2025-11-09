# OneCDC Frontend

React-based frontend application for OneCDC - A CDC voucher shop finder and review platform for Singapore.

## Tech Stack

- **Framework:** React 19
- **Build Tool:** Vite 7
- **Language:** TypeScript
- **Routing:** React Router v7
- **Styling:** Tailwind CSS v4 with Tailwind Animate
- **UI Components:** Radix UI (Tabs, Select, Slot)
- **Icons:** Lucide React, React Icons, React Feather
- **HTTP Client:** Axios + Fetch API
- **Notifications:** Sonner (toast notifications)
- **State Management:** React Context API + Custom Hooks

## Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Shadcn-style UI components
│   │   ├── Footer.tsx      # Bottom navigation with role-based links
│   │   ├── Layout.tsx      # Page layout wrapper
│   │   ├── NavBar.tsx      # Top navigation with auth
│   │   ├── PageHeader.tsx  # Page title component
│   │   ├── RegisterForm.tsx # Registration form component
│   │   └── SearchBar.tsx   # Search input component
│   ├── pages/              # Page components
│   │   ├── AuthUI/         # Authentication pages
│   │   │   ├── LogIn.tsx
│   │   │   └── Register.tsx
│   │   ├── ShopperUI/      # Shopper-specific pages
│   │   │   ├── AddReview.tsx
│   │   │   ├── EditReport.tsx
│   │   │   ├── EditReview.tsx
│   │   │   ├── ItemSearch.tsx
│   │   │   ├── ReportReview.tsx
│   │   │   ├── ReportShop.tsx
│   │   │   ├── SeeReviews.tsx
│   │   │   ├── StoreSearch.tsx
│   │   │   ├── ViewCart.tsx
│   │   │   ├── ViewItem.tsx
│   │   │   └── ViewShop.tsx
│   │   ├── OwnerUI/        # Owner-specific pages
│   │   │   ├── AddItem.tsx
│   │   │   ├── EditItem.tsx
│   │   │   ├── EditShop.tsx
│   │   │   └── MyItems.tsx
│   │   ├── AdminUI/        # Admin-specific pages (if implemented)
│   │   ├── Home.tsx        # Landing page
│   │   └── Profile.tsx     # User profile management
│   ├── context/            # React Context providers
│   │   └── AuthContext.tsx # Authentication state management
│   ├── hooks/              # Custom React hooks
│   │   ├── useApi.ts       # Data fetching with state
│   │   ├── useFormValidation.ts # Form validation utilities
│   │   ├── useLocalStorage.ts   # localStorage sync hook
│   │   └── index.ts        # Hook exports
│   ├── lib/                # Utility libraries
│   │   ├── api.ts          # API client configuration
│   │   ├── constants.ts    # App-wide constants
│   │   ├── errorHandler.ts # Error handling utilities
│   │   ├── storage.ts      # Type-safe storage wrappers
│   │   ├── types.ts        # TypeScript type definitions
│   │   └── utils.ts        # General utilities
│   ├── data/               # Mock data (development)
│   │   └── mockData.ts
│   ├── App.tsx             # Main app component with routing
│   ├── main.tsx            # Application entry point
│   ├── index.css           # Global styles
│   └── vite-env.d.ts       # Vite type definitions
├── public/                 # Static assets
├── .env.local              # Environment variables (create this)
├── .env.example            # Environment variable template
├── index.html              # HTML entry point
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── tsconfig.app.json       # App-specific TS config
├── tsconfig.node.json      # Node-specific TS config
├── vite.config.ts          # Vite configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── postcss.config.js       # PostCSS configuration
└── README.md               # This file
```

## Key Features

### Architecture Patterns

**Custom Hooks:**

- `useApi()` - Data fetching with loading/error states
- `useApiMutation()` - Data mutations with state management
- `useFormValidation()` - Reusable form validation
- `useLocalStorage()` - State synchronized with localStorage

**Centralized Utilities:**

- `lib/constants.ts` - All configuration constants (no magic strings/numbers)
- `lib/storage.ts` - Type-safe localStorage/sessionStorage wrappers
- `lib/errorHandler.ts` - Standardized error handling
- `lib/types.ts` - Comprehensive TypeScript interfaces

**State Management:**

- AuthContext for global authentication state
- Local state with hooks for component-specific data
- localStorage for cart and session persistence

**UI Patterns:**

- Radix UI for accessible, unstyled components
- Tailwind CSS for utility-first styling
- Sonner for non-blocking toast notifications
- React Router for client-side routing

### Role-Based UI

The application adapts based on user role:

**Guest Users:**

- Search functionality (stores and items)
- View shops and catalogues
- Read reviews
- No authentication required

**Registered Shoppers:**

- All guest features
- Shopping cart (stored in localStorage)
- Submit and manage reviews
- Report shops and reviews
- Profile management

**Shop Owners:**

- Manage shop details
- CRUD operations on catalogue items
- View reviews on their items
- Profile management

**Admins:**

- Moderate reported content
- Manage users
- View moderation logs

## Setup Instructions

### Prerequisites

- Node.js 18 or higher
- npm 9 or higher
- Backend API running on `http://localhost:5000`

### Installation

1. **Install dependencies**

   ```bash
   cd frontend
   npm install
   ```

2. **Configure environment variables**

   Create `.env.local` file:

   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   VITE_APP_ENV=development
   VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
   ```

3. **Start development server**

   ```bash
   npm run dev
   ```

   Application runs on `http://localhost:5173`

## Available Scripts

### Development

```bash
npm run dev        # Start Vite dev server with HMR
```

### Production Build

```bash
npm run build      # TypeScript compile + Vite build
npm run preview    # Preview production build locally
```

### Code Quality

```bash
npm run lint       # Run ESLint on TypeScript files
```

## Environment Variables

Create `.env.local` file with:

```env
# Backend API URL (required)
VITE_API_BASE_URL=http://localhost:5000/api

# Environment (optional, defaults to development)
VITE_APP_ENV=development

# Google OAuth Client ID (required for Google Sign-In)
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

**Important:** All environment variables must start with `VITE_` to be exposed to the client.

## Key Components

### Authentication Components

**`context/AuthContext.tsx`**

- Manages global authentication state
- Provides `user`, `isAuthed`, `login`, `logout`, `updateUser`
- Persists auth token and user data to localStorage
- Used throughout app via `useAuth()` hook

**`pages/AuthUI/LogIn.tsx`**

- Email/password login
- Google OAuth login
- Redirects to intended page after login

**`pages/AuthUI/Register.tsx`**

- Separate registration for shoppers and owners
- Email/password registration
- Google OAuth registration
- Form validation with error feedback

### Navigation Components

**`components/NavBar.tsx`**

- OneCDC logo linking to home
- Shopping cart icon (shoppers only)
- Logout button (authenticated users)

**`components/Footer.tsx`**

- Role-based navigation
- Shoppers/Guests: Toggle between Store Search and Item Search
- All users: Home button (center, floating)
- All users: Profile link
- Adapts links based on user role

### Search Components

**`pages/ShopperUI/StoreSearch.tsx`**

- Search shops by name, category, location
- Filter by operating hours, verified status
- Distance-based sorting with geolocation
- Results displayed as clickable cards

**`pages/ShopperUI/ItemSearch.tsx`**

- Search items across all shops
- Filter by availability, category
- Shows which shop carries each item
- Geolocation-based distance sorting

### Shop & Item Views

**`pages/ShopperUI/ViewShop.tsx`**

- Tabbed interface: Details and Catalogue
- Shop information (address, hours, contact)
- Add shop to cart (shoppers only)
- Report shop functionality
- Edit shop details (owners only)

**`pages/ShopperUI/ViewItem.tsx`**

- Tabbed interface: Details and Reviews
- Item information and pricing
- Review item button (shoppers only)
- Edit/Delete item (owners only)
- Report review functionality

### Review Components

**`pages/ShopperUI/AddReview.tsx`**

- Star rating (1-5)
- Comment text area
- Availability toggle
- Form validation

**`pages/ShopperUI/SeeReviews.tsx`**

- List all user's reviews
- Edit and delete options
- Navigation to reviewed items

### Cart Components

**`pages/ShopperUI/ViewCart.tsx`**

- List all shops in cart
- Remove shops from cart
- Generate optimal route button
- Cart persisted in localStorage

### Owner Components

**`pages/OwnerUI/EditShop.tsx`**

- Update shop details
- Operating hours management
- Contact information

**`pages/OwnerUI/AddItem.tsx` / `EditItem.tsx`**

- CRUD operations on catalogue items
- Price and availability management
- CDC voucher acceptance flag

## Utilities Reference

### API Client (`lib/api.ts`)

```typescript
import { apiFetch, authHeaders, API_BASE } from "@/lib/api";

// GET request
const data = await apiFetch("/search/shops?query=grocery");

// POST with authentication
const response = await apiFetch("/reviews", {
  method: "POST",
  headers: authHeaders(),
  body: JSON.stringify({ rating: 5, comment: "Great!" }),
});
```

### Storage Utilities (`lib/storage.ts`)

```typescript
import { authStorage, cartStorage } from "@/lib/storage";

// Auth storage
const token = authStorage.getToken();
authStorage.setToken("new-token");
const user = authStorage.getUserData<User>();
authStorage.setUserData(userData);
authStorage.clearAll();

// Cart storage
const cart = cartStorage.getCart<Shop[]>();
cartStorage.setCart(updatedCart);
cartStorage.clearCart();
```

### Error Handling (`lib/errorHandler.ts`)

```typescript
import { handleError, getErrorMessage } from "@/lib/errorHandler";

try {
  // API call
} catch (error) {
  handleError(error); // Shows toast with error message
  console.error(getErrorMessage(error)); // Get string message
}
```

### Constants (`lib/constants.ts`)

```typescript
import { PASSWORD_MIN_LENGTH, EMAIL_REGEX, USER_ROLES, DEFAULT_LOCATION } from "@/lib/constants";

// Use in validation
if (password.length < PASSWORD_MIN_LENGTH) {
  setError(`Password must be at least ${PASSWORD_MIN_LENGTH} characters`);
}

// Role checking
if (user?.role === USER_ROLES.REGISTERED_SHOPPER) {
  // Shopper-specific logic
}
```

## Styling Guidelines

### Tailwind CSS

The project uses Tailwind CSS v4 with custom configurations:

**Common Patterns:**

```tsx
// Card
<div className="rounded-2xl bg-white shadow-lg p-8">

// Button (primary)
<button className="bg-blue-900 text-white hover:bg-blue-800 px-4 py-2 rounded">

// Button (secondary)
<button className="border border-gray-300 hover:bg-gray-100 px-4 py-2 rounded">

// Input
<input className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />

// Responsive container
<div className="w-full max-w-md mx-auto">
```

### Radix UI Components

Unstyled, accessible components from `@radix-ui`:

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

<Tabs defaultValue="details">
  <TabsList className="w-full">
    <TabsTrigger value="details">Details</TabsTrigger>
    <TabsTrigger value="reviews">Reviews</TabsTrigger>
  </TabsList>
  <TabsContent value="details">...</TabsContent>
  <TabsContent value="reviews">...</TabsContent>
</Tabs>;
```

## Common Issues & Solutions

### Issue: API calls failing with CORS errors

**Solution:**

- Ensure backend is running on port 5000
- Check `FRONTEND_URL` in backend `.env` is `http://localhost:5173`
- Verify `VITE_API_BASE_URL` in frontend `.env.local`

### Issue: Google Sign-In button not appearing

**Solution:**

- Verify `VITE_GOOGLE_CLIENT_ID` is set in `.env.local`
- Check Google Console has `http://localhost:5173` in authorized origins
- Ensure Google client ID matches between frontend and backend

### Issue: Search results not showing

**Solution:**

- Check backend is seeded with data: `cd backend && npm run seed:frontend`
- Verify browser location permissions are granted
- Check browser console for API errors

### Issue: localStorage not persisting

**Solution:**

- Check browser settings allow localStorage
- Verify not in private/incognito mode
- Clear browser cache and reload

### Issue: TypeScript errors after pulling changes

**Solution:**

```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```
