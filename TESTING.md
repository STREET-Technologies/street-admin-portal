# Testing the Admin Portal with Backend

## Quick Start

1. **Start the backend** (if not already running):
   ```bash
   cd D:/git_repo/dev-backend-docker
   docker-compose up
   ```

2. **Get an auth token**:
   - Open `test-vendor-login.html` in your browser
   - Use vendor credentials OR phone OTP to get a token
   - Token will be automatically saved to localStorage

3. **Configure admin portal** for real backend:
   ```bash
   cd D:/git_repo/street-god-mode
   ```

   Update `.env.local`:
   ```env
   VITE_USE_MOCK_DATA=false
   VITE_API_BASE_URL=http://localhost:8080/v1
   ```

4. **Start admin portal**:
   ```bash
   npm run dev
   ```

5. **Test vendor search**:
   - Click on "Retailer" tab
   - Search by vendor store name
   - Should display your 2 vendors from the database!

## What's Working Now

✅ **Backend Integration:**
- API service with data transformers
- Converts backend `Vendor` entity to frontend `Retailer` type
- Converts backend `User` entity to frontend `User` type
- JWT Bearer authentication

✅ **Data Mapping:**
- `storeName` → `name`
- `logo` → `avatar`
- `isOnline` → `status` (active/inactive)
- `createdAt` → `joinDate`
- `vendorCategory` → `category`

✅ **Endpoints Working:**
- `GET /v1/vendors` - List vendors
- `GET /v1/vendors/:id` - Get vendor details
- `PATCH /v1/vendors/:id` - Update vendor
- `PATCH /v1/users/:id` - Update user

## Known Limitations

⚠️ **Missing Backend Data:**
- `totalOrders` - Set to 0 (needs backend calculation)
- `totalRevenue` - Set to 0 (needs backend calculation)
- `owner` - Empty (not in backend)
- `deviceId` for users - Empty (not in backend)

⚠️ **Missing Endpoints:**
- `GET /v1/users/:id` - Get single user
- `GET /v1/users?search=query` - Search users
- All courier endpoints

## Troubleshooting

### "Unauthorized" errors
- Make sure you've logged in via `test-vendor-login.html`
- Check browser console for token in localStorage: `localStorage.getItem('auth_token')`

### Vendors not showing
- Check browser console for API errors
- Verify `VITE_USE_MOCK_DATA=false` in `.env.local`
- Verify backend is running: `curl http://localhost:8080/v1/vendors`

### Backend not starting
- Check for merge conflicts in code
- View logs: `docker logs street-backend --tail 50`
- Restart: `docker-compose restart backend`

## Testing Checklist

- [ ] Backend running on port 8080
- [ ] Swagger accessible at http://localhost:8080/api
- [ ] Got auth token via vendor login
- [ ] Admin portal running on dev server
- [ ] Can search for vendors by name
- [ ] Vendor details display correctly
- [ ] Can update vendor information
