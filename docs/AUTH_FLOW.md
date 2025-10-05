# Admin Portal Authentication Flow

## 🔐 Complete Authentication Sequence

```
┌─────────────────┐
│   Admin User    │
│  (tech@street)  │
└────────┬────────┘
         │
         │ 1. Opens admin portal
         ▼
┌─────────────────────────────────┐
│   Admin Portal (Frontend)        │
│   http://localhost:5174          │
│                                  │
│   - Shows "Sign in with Google"  │
│   - On click → redirects to:     │
│   /v1/auth/admin/google          │
└────────┬────────────────────────┘
         │
         │ 2. Redirects to backend
         ▼
┌─────────────────────────────────┐
│   Backend API                    │
│   http://localhost:8080          │
│                                  │
│   GET /v1/auth/admin/google      │
│   - Uses GoogleAdminStrategy     │
│   - Redirects to Google OAuth    │
└────────┬────────────────────────┘
         │
         │ 3. Redirects to Google
         ▼
┌─────────────────────────────────┐
│   Google OAuth                   │
│   accounts.google.com            │
│                                  │
│   - User signs in with Google    │
│   - Grants permissions           │
│   - Redirects back to callback   │
└────────┬────────────────────────┘
         │
         │ 4. OAuth callback with auth code
         ▼
┌─────────────────────────────────────────────────┐
│   Backend API                                    │
│   /v1/auth/admin/google/callback                │
│                                                  │
│   GoogleAdminStrategy.validate():                │
│   ✓ Gets user profile from Google               │
│   ✓ Extracts email, name, etc.                  │
│                                                  │
│   AuthService.handleAdminGoogleLogin():          │
│   ✓ Checks email against whitelist              │
│     - tech@street.london ✓                      │
│     - other emails ✗ (401 Unauthorized)         │
│   ✓ Creates/finds user with Role.ADMIN          │
│   ✓ Generates JWT access token (15 min)         │
│   ✓ Generates JWT refresh token (7 days)        │
│   ✓ Sets httpOnly cookies                       │
│   ✓ Redirects to admin portal                   │
└────────┬────────────────────────────────────────┘
         │
         │ 5. Redirects with auth=success
         ▼
┌─────────────────────────────────────────────┐
│   Admin Portal (Frontend)                    │
│   http://localhost:5174?auth=success         │
│                                              │
│   - Detects auth=success param              │
│   - Calls GET /v1/auth/me                   │
│     (cookies sent automatically)             │
│                                              │
│   Backend validates JWT from cookie:         │
│   ✓ Token valid                              │
│   ✓ Returns user data                        │
│                                              │
│   - Sets isLoggedIn = true                   │
│   - Displays AdminDashboard                  │
└─────────────────────────────────────────────┘

```

## 🛡️ Protected Route Access

```
┌─────────────────┐
│   Admin User    │
│  (logged in)    │
└────────┬────────┘
         │
         │ Makes API request
         ▼
┌─────────────────────────────────────────────┐
│   Frontend                                   │
│                                              │
│   fetch('/v1/admin/vendors', {              │
│     credentials: 'include'  // Send cookies  │
│   })                                         │
└────────┬────────────────────────────────────┘
         │
         │ Request with cookies
         ▼
┌─────────────────────────────────────────────────┐
│   Backend: AdminAuthGuard                        │
│   @UseGuards(AdminAuthGuard)                     │
│                                                  │
│   1. Extract token from:                         │
│      - Cookie: access_token                      │
│      - OR Header: Authorization: Bearer <token>  │
│                                                  │
│   2. Verify JWT:                                 │
│      ✓ Signature valid                           │
│      ✓ Not expired                               │
│      ✓ Payload.role === 'admin'                  │
│                                                  │
│   3. If valid:                                   │
│      → Allow request                             │
│      → Controller handles request                │
│                                                  │
│   4. If invalid:                                 │
│      → 401 Unauthorized                          │
│      → Frontend redirects to login               │
└─────────────────────────────────────────────────┘

```

## 🔄 Token Refresh Flow

```
┌─────────────────┐
│   Admin User    │
└────────┬────────┘
         │
         │ Access token expired (after 15 min)
         ▼
┌─────────────────────────────────┐
│   Frontend                       │
│                                  │
│   - API call fails (401)         │
│   - Calls POST /v1/auth/refresh  │
│     (refresh_token cookie sent)  │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│   Backend: AuthService.refreshAccessToken│
│                                          │
│   ✓ Verify refresh token                │
│   ✓ Check against stored token           │
│   ✓ Generate new access token            │
│   ✓ Generate new refresh token           │
│   ✓ Update cookies                       │
│   ✓ Return tokens                        │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│   Frontend                       │
│                                  │
│   - Receives new tokens          │
│   - Retries original request     │
└──────────────────────────────────┘

```

## 🚪 Logout Flow

```
┌─────────────────┐
│   Admin User    │
└────────┬────────┘
         │
         │ Clicks "Logout"
         ▼
┌─────────────────────────────────┐
│   Frontend                       │
│                                  │
│   - POST /v1/auth/logout         │
│     (credentials: 'include')     │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│   Backend                        │
│                                  │
│   - Clear access_token cookie    │
│   - Clear refresh_token cookie   │
│   - Return success               │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│   Frontend                       │
│                                  │
│   - setIsLoggedIn(false)         │
│   - Clear user state             │
│   - Show login page              │
└──────────────────────────────────┘

```

## 📊 JWT Token Payload

### Access Token
```json
{
  "sub": "user-uuid-here",
  "phone": "+447123456789",
  "role": "admin",
  "email": "tech@street.london",
  "iat": 1633024800,
  "exp": 1633025700
}
```

### Refresh Token
```json
{
  "sub": "user-uuid-here",
  "phone": "+447123456789",
  "role": "admin",
  "email": "tech@street.london",
  "iat": 1633024800,
  "exp": 1633629600
}
```

## 🔑 Key Security Points

1. **Email Whitelist**
   - Only `tech@street.london` can become admin
   - Enforced in `handleAdminGoogleLogin()`

2. **Role Validation**
   - AdminAuthGuard checks `payload.role === 'admin'`
   - Regular users with `role: 'user'` are rejected

3. **HttpOnly Cookies**
   - Tokens stored in httpOnly cookies (not accessible via JavaScript)
   - Prevents XSS attacks

4. **CORS Configured**
   - Backend allows credentials from all origins (dev mode)
   - Should be restricted in production

5. **Token Expiry**
   - Access token: 15 minutes (short-lived)
   - Refresh token: 7 days (long-lived)
   - Minimizes attack window

6. **Separate OAuth Strategy**
   - Admin uses `google-admin` strategy
   - Separate callback URL
   - Isolated from user authentication

## 🔍 Request Examples

### Login Flow
```bash
# Step 1: User clicks login button
# Frontend redirects to:
http://localhost:8080/v1/auth/admin/google

# Step 2: Backend redirects to Google
https://accounts.google.com/o/oauth2/v2/auth?client_id=...

# Step 3: Google redirects back to:
http://localhost:8080/v1/auth/admin/google/callback?code=...

# Step 4: Backend redirects to admin portal
http://localhost:5174?auth=success

# Cookies set:
# - access_token=eyJhbGc...
# - refresh_token=eyJhbGc...
```

### Protected API Call
```bash
# With cookies:
curl http://localhost:8080/v1/admin/vendors \
  -H "Cookie: access_token=eyJhbGc..." \
  -H "Cookie: refresh_token=eyJhbGc..."

# With Bearer token:
curl http://localhost:8080/v1/admin/vendors \
  -H "Authorization: Bearer eyJhbGc..."
```

### Refresh Token
```bash
curl -X POST http://localhost:8080/v1/auth/refresh \
  -H "Cookie: refresh_token=eyJhbGc..."
```

### Logout
```bash
curl -X POST http://localhost:8080/v1/auth/logout \
  -H "Cookie: access_token=eyJhbGc..." \
  -H "Cookie: refresh_token=eyJhbGc..."
```
