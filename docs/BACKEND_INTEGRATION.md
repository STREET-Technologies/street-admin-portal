# Backend Integration Guide

This document explains how the STREET admin portal integrates with the backend API.

## Current Backend Status

The `street_backend` repo is a NestJS application that:
- Runs on port **8080** (default: `process.env.PORT || 8080`)
- Has global prefix `/v1`
- Uses JWT Bearer authentication (`@UseGuards(JwtAuthGuard)`)
- Swagger documentation at `http://localhost:8080/api`

### Available Endpoints (as of current implementation)

**✅ Currently Implemented:**
- `PATCH /v1/users/:id` - Update user information
  - Accepts: `{ firstName?, lastName?, email?, phone?, language?, profileImage? }`
  - Returns: `{ message: string, data: User }`
  - Auth: Required (JWT)

- `GET /v1/vendors` - List vendors with pagination and search
  - Query params: `?page=1&limit=20&name=searchterm`
  - Returns: `{ vendors: Vendor[], total: number, page: number, limit: number }`
  - Auth: Required (JWT)

- `GET /v1/vendors/:vendorId` - Get vendor details
  - Returns: Vendor object
  - Auth: Required (JWT)

- `PATCH /v1/vendors/:vendorId` - Update vendor information
  - Returns: `{ statusCode, timestamp, path, message, data: Vendor }`
  - Auth: Required (JWT)

**❌ Missing Endpoints (needed for full admin portal):**
- `GET /v1/users/:id` - Get single user by ID
- `GET /v1/users?search=query` - Search users by name/email/phone
- `GET /v1/users/suggestions?q=query` - User autocomplete
- `GET /v1/vendors/suggestions?q=query` - Vendor autocomplete
- All Courier endpoints (CRUD + search)

## Setup

### 1. Environment Configuration

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Update `.env.local` with your configuration:

```env
# Set to false to use real backend API
VITE_USE_MOCK_DATA=false

# Backend API URL (port 8080, prefix /v1)
VITE_API_BASE_URL=http://localhost:8080/v1
```

### 2. Production Configuration

For production deployment:

```env
VITE_USE_MOCK_DATA=false
VITE_API_BASE_URL=https://streetadmin.tech/v1
```

### 3. Backend Endpoint Details

#### User Endpoints

- **GET** `/api/users/search?q={query}` - Search for a user by name, email, phone, ID, or UID
  - Returns: `User` object or `404`

- **PATCH** `/api/users/{userId}` - Update user information
  - Body: Partial `User` object
  - Returns: Updated `User` object

- **GET** `/api/users/suggestions?q={query}` - Get autocomplete suggestions
  - Returns: `{ suggestions: string[] }` (max 5 suggestions)

#### Retailer Endpoints

- **GET** `/api/retailers/search?q={query}` - Search for a retailer
  - Returns: `Retailer` object or `404`

- **PATCH** `/api/retailers/{retailerId}` - Update retailer information
  - Body: Partial `Retailer` object
  - Returns: Updated `Retailer` object

- **GET** `/api/retailers/suggestions?q={query}` - Get autocomplete suggestions
  - Returns: `{ suggestions: string[] }` (max 5 suggestions)

#### Courier Endpoints

- **GET** `/api/couriers/search?q={query}` - Search for a courier
  - Returns: `Courier` object or `404`

- **PATCH** `/api/couriers/{courierId}` - Update courier information
  - Body: Partial `Courier` object
  - Returns: Updated `Courier` object

- **GET** `/api/couriers/suggestions?q={query}` - Get autocomplete suggestions
  - Returns: `{ suggestions: string[] }` (max 5 suggestions)

### 3. Data Types

See `src/types/index.ts` for complete TypeScript definitions.

#### User
```typescript
{
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  status: string;
  joinDate: string;
  deviceId: string;
  uid: string;
  totalOrders: number;
  totalSpent: number;
}
```

#### Retailer
```typescript
{
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  status: string;
  joinDate: string;
  deviceId: string;
  uid: string;
  totalOrders: number;
  totalRevenue: number;
  address: string;
  contact: string;
  category: string;
  pocManager?: string;
  signedUpBy?: string;
  posSystem?: string;
  commissionRate?: string;
  owner?: string;
}
```

#### Courier
```typescript
{
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  status: string;
  joinDate: string;
  deviceId: string;
  uid: string;
  totalDeliveries: number;
  averageRating: number;
}
```

## Testing with dev-backend-docker

1. Make sure your `dev-backend-docker` is running:
   ```bash
   # In the street_backend repo
   docker-compose up
   ```

2. Update `.env.local`:
   ```env
   VITE_USE_MOCK_DATA=false
   VITE_API_BASE_URL=http://localhost:8080/v1
   ```

3. **Important:** You need a valid JWT token for authentication
   - Store it in localStorage: `localStorage.setItem('auth_token', 'your-jwt-token')`
   - Or implement a login flow in the admin portal

4. Start the admin portal:
   ```bash
   npm run dev
   ```

5. Test the search functionality:
   - Vendor search should work (searches by name)
   - User search will need the missing endpoints to be implemented first

## Mock Data Mode

To test the UI without a backend:

```env
VITE_USE_MOCK_DATA=true
```

This will use the mock data from `src/data/mockData.ts` instead of making API calls.

## API Service

The API service is located at `src/services/api.ts` and provides:

- Centralized API calls with error handling
- Type-safe request/response handling
- Easy to extend for new endpoints

Example usage:
```typescript
import { ApiService } from '@/services/api';

// Get a user
const user = await ApiService.getUser('john@example.com');

// Update a user
const updatedUser = await ApiService.updateUser('user123', {
  status: 'active',
  name: 'John Updated'
});
```

## Search Implementation

The search implementation supports:

1. **Multi-field search**: Searches by name, email, phone, ID, or UID
2. **Autocomplete**: Real-time suggestions as you type
3. **Type-specific search**: Separate search for users, retailers, and couriers
4. **Fallback handling**: Falls back to mock data if API fails

## Recommendations for UI/UX Improvements

Current implementation is solid for an admin tool, but consider these enhancements:

### 1. Debounced Search
Add debouncing to autocomplete to reduce API calls:
```typescript
import { useDebouncedCallback } from 'use-debounce';

const debouncedSearch = useDebouncedCallback(
  (value) => handleInputChange(value),
  300
);
```

### 2. Recent Searches
Store recent searches in localStorage for quick access:
```typescript
const recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
```

### 3. Advanced Filters
Add filters for:
- Status (active, inactive, etc.)
- Date range (joined date)
- Sort options (name, recent activity, etc.)

### 4. Bulk Operations
For managing multiple entities at once

### 5. Export Functionality
Export search results to CSV/Excel

## Error Handling

The API service includes:
- Network error handling
- HTTP error status handling
- Fallback to mock data on error
- Console logging for debugging

## Security Notes

- API calls should include authentication headers
- Sensitive operations should require additional confirmation
- All access should be logged for audit purposes
