# Quick Start Guide - Admin Portal Google SSO

## Prerequisites
- ✅ Backend is configured with Google OAuth credentials
- ⚠️ **ACTION REQUIRED**: Add admin callback URL to Google Cloud Console

## Step 1: Configure Google Cloud Console

1. Go to [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials)
2. Find OAuth 2.0 Client: `836633886553-pitc897972c44gj556mn5ddg706sclvg.apps.googleusercontent.com`
3. Click **Edit**
4. Under **Authorized redirect URIs**, add:
   ```
   http://localhost:8080/v1/auth/admin/google/callback
   ```
5. Click **Save**

## Step 2: Start Backend

```bash
cd /d/git_repo/dev-backend-docker
docker-compose up backend
```

Wait for: `The server is running on 8080 port: http://localhost:8080/api`

## Step 3: Start Admin Portal

```bash
cd /d/git_repo/street-admin-portal
npm run dev
```

Open browser to: `http://localhost:8081`

## Step 4: Test Login

1. Click **"Sign in with Google"**
2. Sign in with: `tech@street.london`
3. You should be redirected back and see the admin dashboard

## Troubleshooting

### Error: "Redirect URI mismatch"
**Solution:** Go back to Step 1 and verify the callback URL is added correctly

### Error: "Unauthorized admin access"
**Solution:** Make sure you're signing in with `tech@street.london` (whitelisted email)

### Cookies not set / Not staying logged in
**Solution:**
- Check browser cookies (DevTools → Application → Cookies)
- Should see `access_token` and `refresh_token` from `localhost`
- Try clearing all cookies and logging in again

### Backend not responding
**Solution:**
```bash
cd /d/git_repo/dev-backend-docker
docker-compose down
docker-compose up backend
```

## Adding More Admin Users

Edit: `street-backend/src/modules/v1/auth/services/auth.service.ts`

Find the `handleAdminGoogleLogin` method and update:
```typescript
const authorizedAdminEmails = [
  'tech@street.london',
  'your-new-admin@street.london'  // Add here
];
```

Restart backend after changes.

## API Endpoints

### Auth Endpoints
- `GET http://localhost:8080/v1/auth/admin/google` - Start Google SSO
- `GET http://localhost:8080/v1/auth/admin/google/callback` - OAuth callback
- `GET http://localhost:8080/v1/auth/me` - Get current user
- `POST http://localhost:8080/v1/auth/logout` - Logout

### Protected Admin Endpoints (require authentication)
- `GET http://localhost:8080/v1/admin/vendors`
- `GET http://localhost:8080/v1/admin/users`
- `GET http://localhost:8080/v1/admin/users/:userId`
- `PATCH http://localhost:8080/v1/admin/users/:userId`

## Testing Protected Routes

**Using curl:**
```bash
# This will fail (401 Unauthorized)
curl http://localhost:8080/v1/admin/vendors

# After logging in via browser, copy the access_token cookie value and:
curl -H "Authorization: Bearer <your-access-token>" http://localhost:8080/v1/admin/vendors
```

**Using browser DevTools:**
1. Log in via admin portal
2. Open DevTools → Console
3. Run:
```javascript
fetch('http://localhost:8080/v1/admin/vendors', {
  credentials: 'include'
}).then(r => r.json()).then(console.log)
```

## What's Next?

- ✅ Google SSO is working
- ✅ Admin routes are protected
- ✅ Email whitelist is enforced
- 📋 Consider adding refresh token rotation for enhanced security
- 📋 Implement audit logging for admin actions
- 📋 Add role-based permissions (if you need granular admin roles)

## Documentation

- **Setup Guide**: `GOOGLE_SSO_SETUP.md`
- **Implementation Summary**: `AUTH_IMPLEMENTATION_SUMMARY.md`
- **This Guide**: `QUICK_START.md`
