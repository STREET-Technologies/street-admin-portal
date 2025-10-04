# Backend Integration Guide

This document explains how the STREET admin portal integrates with the backend API.

## Current Backend Status

The `street-backend` repo is a NestJS application that:
- Runs on port **8080** (default: `process.env.PORT || 8080`)
- Has global prefix `/v1`
- Uses JWT Bearer authentication (`@UseGuards(JwtAuthGuard)`)
- Swagger documentation at `http://localhost:8080/api`

## Admin Portal Endpoints

The admin portal uses dedicated admin endpoints that **do not require authentication** (for internal admin use only).

### ✅ Implemented Admin Endpoints

#### User Endpoints

**GET** `/v1/admin/users/:userId`
- Get user details by ID
- Returns: User object with basic info
- No authentication required

**PATCH** `/v1/admin/users/:userId`
- Update user information
- Body: `{ firstName?, lastName?, email?, phone?, language?, profileImage? }`
- Returns: `{ message: string, data: User }`
- No authentication required

**GET** `/v1/admin/users/:userId/addresses`
- Get all saved addresses for a user
- Returns: `UserAddress[]`
- No authentication required

**PATCH** `/v1/admin/users/:userId/addresses/:addressId`
- Update a user's address
- Body: `UpdateUserAddressDto` (all fields optional):
  ```typescript
  {
    label?: string;
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
    countryCode?: string;
    latitude?: number;
    longitude?: number;
    isDefault?: boolean;
  }
  ```
- Returns: Updated `UserAddress` object
- Note: Latitude/longitude are stored as PostgreSQL decimals (returned as strings), but must be sent as numbers
- No authentication required

**GET** `/v1/admin/users/:userId/orders`
- Get all orders for a user
- Query params: `?limit=10&page=1`
- Returns: `{ message: string, data: { orders: Order[], total: number, page: number, limit: number } }`
- Includes: `vendor` relation and `orderItems` with full Shopify metadata
- No authentication required

#### Vendor/Retailer Endpoints

**GET** `/v1/admin/vendors/:vendorId`
- Get vendor details by ID
- Returns: Vendor object
- No authentication required

**PATCH** `/v1/admin/vendors/:vendorId`
- Update vendor information
- Returns: `{ statusCode, timestamp, path, message, data: Vendor }`
- No authentication required

#### Referral Code Endpoints

**POST** `/v1/admin/referral-codes`
- Create a new referral code
- Body: `CreateReferralCodeDto`
- Returns: Created referral code object
- No authentication required

#### Search Endpoints

The admin portal currently uses direct entity search by ID, email, or phone. Search is handled client-side in the frontend by querying users, vendors, and couriers separately.

## Setup

### 1. Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Update `.env` with your configuration:

```env
# Backend API URL (port 8080, prefix /v1)
VITE_API_BASE_URL=http://localhost:8080/v1
```

### 2. Production Configuration

For production deployment:

```env
VITE_API_BASE_URL=https://api.street.london/v1
```

## Data Types

See `src/types/index.ts` for complete TypeScript definitions.

### User

```typescript
interface User extends BaseEntity {
  totalOrders: number;
  totalSpent: number;
  ssoProvider?: string;
}

interface BaseEntity {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  status: string;
  joinDate: string;
  deviceId: string;
  uid: string;
}
```

### Retailer

```typescript
interface Retailer extends BaseEntity {
  totalOrders: number;
  totalRevenue: number;
  address: string;
  postcode?: string;
  contact: string;
  category: string;
  pocManager?: string;
  signedUpBy?: string;
  posSystem?: string;
  commissionRate?: string;
  owner?: string;
}
```

### Courier

```typescript
interface Courier extends BaseEntity {
  totalDeliveries: number;
  averageRating: number;
}
```

### UserAddress

```typescript
interface UserAddress {
  id: string;
  userId: string;
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  countryCode: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Order

```typescript
interface Order {
  id: string;
  orderId: string;
  totalAmount: string | number;
  subtotal: string | number;
  status: string;
  shippingAddress?: any;
  paymentStatus: string;
  paymentMethod: string;
  stuartJobId?: string | null;
  deliveryDetails?: any;
  createdAt: string;
  updatedAt: string;
  vendor?: {
    id: string;
    storeName: string;
    logo?: string;
  };
  orderItems?: OrderItem[];
}
```

### OrderItem

```typescript
interface OrderItem {
  id: string;
  productId: string;
  variantId: string;
  quantity: number;
  price: string | number;
  totalPrice: string | number;
  metadata?: {
    id: string;
    sku: string;
    price: string;
    title: string;
    images: Array<{
      id: number;
      src: string;
      width: number;
      height: number;
      altText: string;
      position: number;
    }>;
    productId: string;
    productName: string;
    optionValues: Array<{
      id: string;
      value: string;
      option: {
        id: string;
        name: string;
      };
    }>;
    packingState: {
      status: string;
      packedAt: string;
      bagNumber: number;
    };
    inventoryQuantity: number;
  };
  createdAt: string;
  updatedAt: string;
}
```

### ReferralCode

```typescript
interface ReferralCode {
  id: string;
  code: string;
  status: ReferralCodeStatus;
  expiryDate: string;
  creditAmount?: number;
  freeDeliveries?: number;
  createdBy: string;
  belongsTo: string;
  usedBy?: string;
  usedDate?: string;
  createdDate: string;
}
```

## Testing with Backend

1. Make sure your backend is running:
   ```bash
   # In the street-backend repo
   docker-compose up
   ```

2. Update `.env`:
   ```env
   VITE_API_BASE_URL=http://localhost:8080/v1
   ```

3. Start the admin portal:
   ```bash
   npm run dev
   ```

4. Test the functionality:
   - Search for users, retailers, or couriers by ID, email, or phone
   - View user details with addresses and orders
   - Edit user addresses
   - View order details with product images and variants
   - Create referral codes

## API Service

The API service is located at `src/services/api.ts` and provides:

- Centralized API calls with error handling
- Type-safe request/response handling
- Easy to extend for new endpoints
- Automatic data transformation (e.g., lat/lng strings to numbers)

### Available Methods

```typescript
// User operations
static async getUser(userId: string): Promise<BackendUser>
static async updateUser(userId: string, data: Partial<User>): Promise<User>

// User addresses
static async getUserAddresses(userId: string): Promise<UserAddress[]>
static async updateUserAddress(userId: string, addressId: string, data: Partial<UserAddress>): Promise<UserAddress>

// User orders
static async getUserOrders(userId: string, limit = 10, page = 1): Promise<OrdersResponse>

// Vendor operations
static async getVendor(vendorId: string): Promise<BackendVendor>
static async updateVendor(vendorId: string, data: Partial<Retailer>): Promise<Retailer>

// Referral codes
static async createReferralCode(data: any): Promise<ReferralCode>
```

### Example Usage

```typescript
import { ApiService } from '@/services/api';

// Get user with addresses
const user = await ApiService.getUser('221b3c4c-f9fa-483f-aead-1174dd752521');
const addresses = await ApiService.getUserAddresses(user.id);

// Update an address
const updatedAddress = await ApiService.updateUserAddress(
  user.id,
  addressId,
  { label: 'Work', isDefault: true }
);

// Get user orders
const { data } = await ApiService.getUserOrders(user.id, 10, 1);
console.log(data.orders); // Array of orders with items and vendor info
```

## Search Implementation

The search service (`src/services/searchService.ts`) provides unified search across users, retailers, and couriers:

1. **Multi-entity search**: Searches users, retailers, and couriers in parallel
2. **Multi-field search**: Searches by ID, email, or phone
3. **Type-specific results**: Returns results with entity type identification
4. **Error handling**: Graceful handling of failed searches

## Important Notes

### Data Type Conversions

- **PostgreSQL Decimals**: Backend returns `latitude` and `longitude` as strings (PostgreSQL decimal type)
- **Frontend Handling**: API service automatically converts these to numbers before PATCH requests
- **Order Amounts**: `totalAmount`, `price`, and `totalPrice` can be strings or numbers - handle both

### Order Items Metadata

Order items contain rich Shopify product metadata including:
- Product name and images
- Variant options (size, color, etc.)
- Inventory information
- Packing state
- SKU and pricing

The frontend uses this metadata to display:
- Product thumbnails (48x48px)
- Product names from `metadata.productName`
- Variant details from `metadata.optionValues` (e.g., "Size: 10")

### Status Values

Common status values used across entities:

**EntityStatus**: `"active" | "inactive" | "pending" | "blocked" | "withdrawn" | "onboarding" | "online"`

**OrderStatus**: `"delivered" | "completed" | "pending" | "cancelled" | "in-progress"`

**ReferralCodeStatus**: `"active" | "expired" | "used" | "disabled"`

## Backend Implementation Details

### Admin Module Structure

The backend admin module is located at:
- Controller: `src/modules/v1/admin/admin.controller.ts`
- Module: `src/modules/v1/admin/admin.module.ts`

The module imports:
- `VendorsModule`
- `UsersModule`
- `UserAddressesModule`
- `OrdersModule`

And provides admin-specific endpoints without authentication guards.

### DTOs

**UpdateUserAddressDto** (`src/modules/v1/user-addresses/dtos/update-user-address.dto.ts`):
- All fields are optional (@IsOptional)
- Latitude/longitude must be numbers (@IsNumber)
- Used for PATCH `/admin/users/:userId/addresses/:addressId`

### Repository Methods

**OrdersRepository** (`src/modules/v1/orders/repositories/orders.repository.ts`):
- `getOrdersByUser()` includes `orderItems` and `vendor` relations
- Ordered by `createdAt DESC`
- Supports pagination with `limit` and `offset`

**UserAddressesRepository** (`src/modules/v1/user-addresses/repositories/user-addresses.repository.ts`):
- `getUserAddresses()` returns all addresses for a user
- `updateAddress()` updates and returns the updated address

## Security Notes

- Admin endpoints do not require authentication (internal use only)
- Should be protected by network-level security (VPN, IP whitelist, etc.)
- All operations should be logged for audit purposes
- Consider adding role-based access control for production use
- Validate all user inputs on the backend with DTOs and class-validator

## Future Enhancements

### Recommended Features

1. **Authentication**: Add admin user authentication with JWT
2. **Role-based Access**: Different permission levels (super admin, support, readonly)
3. **Audit Logging**: Track all admin actions with timestamps and user info
4. **Bulk Operations**: Update multiple entities at once
5. **Advanced Filtering**: Filter orders by date range, status, amount, etc.
6. **Export Functionality**: Export data to CSV/Excel
7. **Real-time Updates**: WebSocket support for live order updates
8. **Analytics Dashboard**: Aggregate statistics and charts

### Performance Optimizations

1. **Caching**: Add Redis caching for frequently accessed data
2. **Pagination**: Implement cursor-based pagination for large datasets
3. **Search Indexing**: Use Elasticsearch for full-text search
4. **Database Indexing**: Add indexes on commonly searched fields (email, phone, orderId)
