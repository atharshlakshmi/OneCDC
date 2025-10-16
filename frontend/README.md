# OneCDC Frontend

React + TypeScript + Vite frontend application for OneCDC - A CDC shop finder and review platform.

## Tech Stack

- **Framework**: React 19
- **Build Tool**: Vite
- **Language**: TypeScript
- **Routing**: React Router v7
- **Styling**: Tailwind CSS
- **HTTP Client**: Fetch API

## Prerequisites

- Node.js v18 or higher
- npm v9 or higher
- Backend API running (see `/backend/README.md`)

## Installation

```bash
cd frontend
npm install
```

## Configuration

Create `.env.local` in the frontend root:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_ENV=development
```

## Running the Application

### Development Mode
```bash
npm run dev
```
Application runs on `http://localhost:5173`

### Production Build
```bash
npm run build
npm run preview
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

## Project Structure

```
frontend/
├── src/
│   ├── pages/          # Page components
│   │   ├── App.tsx           # Home page (shop list)
│   │   ├── ViewShop.tsx      # Shop details page
│   │   ├── ViewItem.tsx      # Item details page
│   │   └── Cart.tsx          # Shopping cart page
│   ├── services/       # API services
│   │   └── api.ts            # API client
│   ├── types/          # TypeScript types
│   │   └── api.ts            # API response types
│   ├── App.css         # Global styles
│   └── main.tsx        # Application entry point
├── public/             # Static assets
├── .env.local          # Environment variables
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Features

### Current Features
- ✅ Browse all shops
- ✅ View shop details and catalogues
- ✅ View item details and prices
- ✅ Read item reviews
- ✅ Shopping cart (localStorage-based)
- ✅ Responsive design
- ✅ Loading states
- ✅ Error handling

### API Integration
The frontend fetches data from the backend API:
- `GET /api/shops` - List all shops
- `GET /api/shops/:id` - Get shop details
- `GET /api/items/:id` - Get item details
- `GET /api/items/:id/reviews` - Get item reviews

## API Service

The application uses a centralized API service (`src/services/api.ts`):

```typescript
import { api } from './services/api';

// Get all shops
const shops = await api.getAllShops();

// Get specific shop
const shop = await api.getShop(shopId);

// Get item reviews
const reviews = await api.getItemReviews(itemId);
```

### Error Handling
```typescript
try {
  const shops = await api.getAllShops();
} catch (error) {
  if (error instanceof ApiError) {
    console.error('API Error:', error.message);
  }
}
```

## Pages

### Home Page (`/`)
- Displays list of all shops
- Shows shop names and categories
- Links to shop details

### Shop Details (`/ViewShop/:id`)
- Shop information (address, contact, hours)
- Catalogue tab with items
- Add shop to cart

### Item Details (`/ViewItem/:id`)
- Item information (name, price)
- Reviews tab with ratings and comments

### Cart (`/Cart`)
- View selected shops
- Manage shopping list
- Navigate to selected shops

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:5000/api` |
| `VITE_APP_ENV` | Environment | `development` |

## Development

### Hot Module Replacement (HMR)
Vite provides instant HMR for React components. Changes are reflected immediately without full page reload.

### TypeScript
The project uses TypeScript for type safety. Types are defined in:
- `src/types/api.ts` - API response types
- Component props and state

### Styling
- Tailwind CSS for utility classes
- Global styles in `App.css`
- Responsive design with mobile-first approach

## Troubleshooting

### "Loading shops..." Forever
- Ensure backend is running on port 5000
- Check `VITE_API_BASE_URL` in `.env.local`
- Verify CORS is configured in backend
- Check browser console for errors

### API Errors
- Verify backend is running: `curl http://localhost:5000/api/health`
- Check network tab in browser DevTools
- Ensure backend database is seeded

### Build Errors
```bash
# Clean and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Port Already in Use
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Follow the existing code structure
2. Use TypeScript for all new files
3. Add proper type definitions
4. Test with backend API before committing
5. Follow React best practices (hooks, functional components)

## Future Enhancements

- User authentication UI
- Search and filters
- Interactive map for shop locations
- Review submission form
- Shop owner dashboard
- Admin moderation panel
- Real-time updates
- Progressive Web App (PWA) features

## License

Educational project for SC2006.
