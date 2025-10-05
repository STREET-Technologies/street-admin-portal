# STREET Admin Portal

A modern, feature-rich admin portal for managing the STREET platform - users, retailers, couriers, orders, and referral codes.

![STREET Admin Portal](https://img.shields.io/badge/STREET-Admin%20Portal-purple)
![React](https://img.shields.io/badge/React-18.3-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)
![Vite](https://img.shields.io/badge/Vite-5.4-purple)

## 🚀 Features

### User Management
- **Smart Search**: Search users, retailers, and couriers by ID, email, or phone
- **User Profiles**: View detailed user information with metrics and order history
- **Address Management**: View and edit user addresses with inline editing
- **Order History**: View complete order history with product images and variant details

### Retailer Management
- View retailer profiles with revenue metrics
- Track total orders and average order value
- Manage retailer information and status

### Courier Management
- View courier profiles with delivery statistics
- Track average ratings and completion rates
- Monitor courier performance

### Referral Code Management
- Create and manage referral codes
- Track code usage and status
- View code details (credit amount, free deliveries, expiry dates)

### Order Management
- View detailed order information with product images
- Display order items with variant details (size, color, etc.)
- Filter orders by status (delivered, cancelled, etc.)
- View order metadata from Shopify integration

## 🛠️ Tech Stack

- **Frontend Framework**: React 18.3 with TypeScript
- **Build Tool**: Vite 5.4
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Icons**: Lucide React
- **Backend Integration**: NestJS REST API
- **Database**: PostgreSQL (via backend)

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/STREET-Technologies/street-admin-portal.git
cd street-admin-portal
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
echo "VITE_API_URL=http://localhost:8080/v1" > .env
```

4. **[IMPORTANT]** Set up Google OAuth callback:
   - See [QUICK_START.md](QUICK_START.md) for Google Cloud Console setup
   - Add callback URL: `http://localhost:8080/v1/auth/admin/google/callback`

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📁 Project Structure

```
street-admin-portal/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── AdminDashboard.tsx
│   │   ├── SearchBar.tsx
│   │   ├── UserCard.tsx
│   │   ├── OrdersDialog.tsx
│   │   └── MetricsCards.tsx
│   ├── services/           # API services
│   │   ├── api.ts         # Backend API integration
│   │   └── searchService.ts
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   └── App.tsx            # Main application component
├── docs/                  # Documentation
├── public/               # Static assets
└── package.json
```

## 🔌 Backend Integration

The admin portal integrates with a NestJS backend API. See [BACKEND_INTEGRATION.md](docs/BACKEND_INTEGRATION.md) for detailed API documentation.

### Key Endpoints

- `GET /admin/users/:userId` - Get user details
- `GET /admin/users/:userId/addresses` - Get user addresses
- `PATCH /admin/users/:userId/addresses/:addressId` - Update address
- `GET /admin/users/:userId/orders` - Get user orders
- `GET /admin/vendors/:vendorId` - Get vendor details
- `POST /admin/referral-codes` - Create referral code

## 🎨 UI Components

The portal uses [shadcn/ui](https://ui.shadcn.com/) for consistent, accessible UI components:

- **Dialog**: Modal dialogs for orders and details
- **Card**: Information cards for metrics and profiles
- **Badge**: Status indicators
- **Button**: Action buttons
- **Input**: Form inputs
- **ScrollArea**: Scrollable content areas

## 📝 Key Features

### Address Management
- View all saved addresses for a user
- Edit addresses inline with save/cancel functionality
- Set default addresses
- Full address validation with lat/lng support

### Order Display
- Rich order details with product images
- Variant information (size, color, etc.) from Shopify metadata
- Order status tracking
- Delivery information
- Order item breakdown with prices

### Metrics Dashboard
- Total orders/deliveries
- Revenue/spending analytics
- Average order value calculations
- Time-based metrics (days since joined)

## 🔒 Security

- **Google SSO Authentication**: Secure admin login via Google OAuth
- **Email Whitelist**: Only authorized emails can access admin portal
- **Role-Based Access Control**: Admin role required for all protected routes
- **JWT Tokens**: Access and refresh tokens with httpOnly cookies
- **Protected API Routes**: All admin endpoints require authentication
- CORS configured for allowed origins
- Input validation via class-validator
- UUID-based entity identification

### Authentication
The admin portal uses Google Single Sign-On (SSO) for authentication. Only whitelisted Google accounts can access the portal.

**Quick Start:**
```bash
# See QUICK_START.md for setup instructions
npm run dev
```

**Documentation:**
- [Quick Start Guide](QUICK_START.md) - Get up and running in 5 minutes
- [Authentication Flow](AUTH_FLOW.md) - Visual flow diagrams
- [Google SSO Setup](GOOGLE_SSO_SETUP.md) - Detailed setup instructions
- [Implementation Summary](AUTH_IMPLEMENTATION_SUMMARY.md) - Technical details

## 🧪 Testing

See [TESTING.md](TESTING.md) for testing guidelines and procedures.

## 📚 Documentation

### Getting Started
- [🚀 Quick Start Guide](QUICK_START.md) - Get up and running in 5 minutes
- [📦 Production Deployment](PRODUCTION_DEPLOYMENT.md) - Deploy to Vercel (streetadmin.tech)
- [✅ Deploy Checklist](DEPLOY_CHECKLIST.md) - Quick deployment checklist

### Authentication
- [🔐 Google SSO Setup](docs/GOOGLE_SSO_SETUP.md) - Detailed OAuth configuration
- [📊 Authentication Flow](docs/AUTH_FLOW.md) - Visual flow diagrams and sequence
- [📝 Implementation Summary](docs/AUTH_IMPLEMENTATION_SUMMARY.md) - Technical implementation details

### Backend Integration
- [Backend Integration Guide](docs/BACKEND_INTEGRATION.md)

## 🤝 Contributing

1. Create a feature branch (`git checkout -b feat/amazing-feature`)
2. Commit your changes (`git commit -m 'Add amazing feature'`)
3. Push to the branch (`git push origin feat/amazing-feature`)
4. Open a Pull Request

## 📄 License

This project is proprietary and confidential.

## 🏢 About STREET

STREET is a platform connecting users with local retailers and efficient delivery services.

---

Built with ❤️ by the STREET team
