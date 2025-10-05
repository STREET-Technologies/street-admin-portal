# Deploy Admin Portal to Vercel

Quick guide to deploy `streetadmin.tech` to production on Vercel.

## Prerequisites

- Vercel account
- Google OAuth credentials configured
- Production backend deployed

## Step 1: Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Find your OAuth 2.0 Client ID
3. Add these to **Authorized redirect URIs**:
   ```
   https://streetadmin.tech/v1/auth/admin/google/callback
   ```
4. Add to **Authorized JavaScript origins**:
   ```
   https://streetadmin.tech
   ```
5. Save

## Step 2: Deploy to Vercel

### Via Dashboard (Recommended)

1. Go to https://vercel.com/new
2. Import `street-admin-portal` repo
3. Configure:
   - **Framework**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variable:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://streetadmin.tech/v1`
5. Click **Deploy**

### Via CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd /d/git_repo/street-admin-portal
vercel login
vercel --prod

# Set environment variable
vercel env add VITE_API_URL production
# Enter: https://streetadmin.tech/v1
```

## Step 3: Configure Domain

1. In Vercel → **Settings** → **Domains**
2. Add: `streetadmin.tech`
3. Update DNS records as shown by Vercel
4. Wait for SSL certificate (automatic)

## Step 4: Update Backend

Your production backend needs these environment variables:

```env
NODE_ENV=production
ADMIN_PORTAL_URL=https://streetadmin.tech
GOOGLE_CALLBACK_URL=https://streetadmin.tech/v1/auth/admin/google/callback
```

Restart your backend after adding these.

## Step 5: Test

1. Visit `https://streetadmin.tech`
2. Click "Sign in with Google"
3. Login with authorized admin email
4. Verify dashboard loads and API calls work

## Troubleshooting

**Error: redirect_uri_mismatch**
- Check Google OAuth callback URL matches exactly

**Error: 401 Unauthorized**
- Verify backend has `NODE_ENV=production`
- Check cookies are being set (DevTools → Application → Cookies)

**CORS errors**
- Backend CORS must allow `https://streetadmin.tech`
- Must have `credentials: true`

## Environment Variables

| Variable | Value | Where |
|----------|-------|-------|
| `VITE_API_URL` | `https://streetadmin.tech/v1` | Vercel |
| `NODE_ENV` | `production` | Backend |
| `ADMIN_PORTAL_URL` | `https://streetadmin.tech` | Backend |
| `GOOGLE_CALLBACK_URL` | `https://streetadmin.tech/v1/auth/admin/google/callback` | Backend |

## Notes

- Vercel auto-deploys on push to `main`
- Preview deployments for PRs
- SSL certificates automatic
- Rollback via Vercel dashboard

That's it! Your admin portal should be live at `https://streetadmin.tech` 🚀
