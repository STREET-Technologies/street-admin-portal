# Admin Portal Google SSO Implementation Summary

## ✅ What Was Implemented

### Backend Changes

1. **New Admin Role**
   - Added `Role.ADMIN` to `src/core/enums/role.enum.ts`

2. **Admin Google OAuth Strategy**
   - Created `src/modules/v1/auth/strategies/google-admin.strategy.ts`
   - Separate strategy with callback URL: `http://localhost:8080/v1/auth/admin/google/callback`
   - Uses same Google credentials but different route

3. **Admin Auth Service**
   - Added `handleAdminGoogleLogin()` method to `auth.service.ts`
   - Email whitelist: `['tech@street.london']`
   - Creates users with `Role.ADMIN`
   - Returns JWT tokens with admin role

4. **Admin Auth Guard**
   - Created `src/core/guards/admin-auth.guard.ts`
   - Validates JWT token (from cookie or Authorization header)
   - Enforces `Role.ADMIN` requirement
   - Protects all admin routes

5. **Admin Routes Protection**
   - Updated `admin.controller.ts` with `@UseGuards(AdminAuthGuard)`
   - All `/v1/admin/*` endpoints now require admin authentication

6. **Auth Endpoints**
   - `GET /v1/auth/admin/google` - Initiates admin Google OAuth flow
   - `GET /v1/auth/admin/google/callback` - Handles OAuth callback

### Frontend Changes

1. **Login Component**
   - Replaced email/password form with Google SSO button
   - Redirects to `/v1/auth/admin/google` on click
   - Handles OAuth callback with `?auth=success` param
   - Calls `/v1/auth/me` to validate session

2. **Index Page**
   - Added auth state persistence check on mount
   - Calls `/v1/auth/me` to restore session
   - Implements logout with `/v1/auth/logout` POST

3. **Environment Configuration**
   - Created `.env` with `VITE_API_URL=http://localhost:8080/v1`

## 🔐 Security Features

- **Email Whitelist**: Only authorized emails can become admins
- **Role-Based Access Control**: JWT payload includes admin role
- **Protected Routes**: All admin endpoints require authentication
- **HttpOnly Cookies**: Tokens stored securely
- **Token Expiry**:
  - Access token: 15 minutes
  - Refresh token: 7 days

## 📋 Next Steps

### 1. Google Cloud Console Setup
Add the admin callback URL to your OAuth client:
```
http://localhost:8080/v1/auth/admin/google/callback
```

**Instructions:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **APIs & Services** → **Credentials**
3. Find OAuth client: `836633886553-pitc897972c44gj556mn5ddg706sclvg.apps.googleusercontent.com`
4. Click **Edit**
5. Add to **Authorized redirect URIs**: `http://localhost:8080/v1/auth/admin/google/callback`
6. Save

### 2. Start the Services

**Backend:**
```bash
cd /d/git_repo/dev-backend-docker
docker-compose up backend
```

**Admin Portal:**
```bash
cd /d/git_repo/street-admin-portal
npm run dev
```

### 3. Test Authentication

1. Navigate to `http://localhost:5174`
2. Click "Sign in with Google"
3. Sign in with `tech@street.london`
4. Should redirect back and display dashboard

## 🐛 Troubleshooting

### Redirect URI Mismatch
- Ensure callback URL in Google Cloud Console matches exactly: `http://localhost:8080/v1/auth/admin/google/callback`

### Unauthorized Admin Access
- Verify email is whitelisted in `auth.service.ts` → `handleAdminGoogleLogin()`
- Currently whitelisted: `tech@street.london`

### CORS Issues
- Backend CORS is configured to allow credentials from all origins (`origin: true`)
- Frontend uses `credentials: 'include'` in all fetch requests

### Cookies Not Set
- Check browser dev tools → Application → Cookies
- Should see `access_token` and `refresh_token` cookies from `localhost`

## 📝 Files Modified/Created

### Backend
- ✅ `src/core/enums/role.enum.ts` - Added ADMIN role
- ✅ `src/core/guards/admin-auth.guard.ts` - Created admin guard
- ✅ `src/modules/v1/auth/strategies/google-admin.strategy.ts` - Created strategy
- ✅ `src/modules/v1/auth/auth.module.ts` - Added GoogleAdminStrategy provider
- ✅ `src/modules/v1/auth/services/auth.service.ts` - Added handleAdminGoogleLogin()
- ✅ `src/modules/v1/auth/controllers/auth.controller.ts` - Added admin routes
- ✅ `src/modules/v1/admin/admin.module.ts` - Added JwtModule and guard provider
- ✅ `src/modules/v1/admin/admin.controller.ts` - Added @UseGuards(AdminAuthGuard)

### Frontend
- ✅ `src/components/Login.tsx` - Replaced with Google SSO
- ✅ `src/pages/Index.tsx` - Added auth state management
- ✅ `.env` - Created with API URL
- ✅ `GOOGLE_SSO_SETUP.md` - Setup documentation
- ✅ `AUTH_IMPLEMENTATION_SUMMARY.md` - This file

## 🚀 Production Deployment

When deploying to production:

1. Update Google Cloud Console with production callback URL:
   ```
   https://your-domain.com/v1/auth/admin/google/callback
   ```

2. Update backend `.env`:
   ```
   GOOGLE_CALLBACK_URL=https://your-domain.com/v1/auth/admin/google/callback
   ```

3. Update admin portal `.env`:
   ```
   VITE_API_URL=https://your-api-domain.com/v1
   ```

4. Update redirect URL in `auth.controller.ts`:
   ```typescript
   res.redirect('https://admin.your-domain.com?auth=success');
   ```

5. Set `secure: true` for cookies in production

## 👥 Adding More Admins

To authorize additional admin users, update the whitelist in:

**File:** `street-backend/src/modules/v1/auth/services/auth.service.ts`

```typescript
async handleAdminGoogleLogin(googleProfile: any): Promise<...> {
  // Update this array:
  const authorizedAdminEmails = [
    'tech@street.london',
    'another-admin@street.london',  // Add here
  ];
  // ...
}
```
