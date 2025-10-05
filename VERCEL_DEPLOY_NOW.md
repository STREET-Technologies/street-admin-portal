# 🚀 Deploy to Vercel NOW - Quick Guide

Follow these steps to deploy the admin portal to `streetadmin.tech` right now!

## ⚡ Quick Steps (15 minutes)

### 1️⃣ Google OAuth Setup (5 min)

1. Go to: https://console.cloud.google.com/apis/credentials
2. Find OAuth client: `836633886553-pitc897972c44gj556mn5ddg706sclvg...`
3. Click **Edit**
4. Add to **Authorized redirect URIs**:
   ```
   https://streetadmin.tech/v1/auth/admin/google/callback
   ```
5. Add to **Authorized JavaScript origins**:
   ```
   https://streetadmin.tech
   ```
6. **Save**

### 2️⃣ Deploy to Vercel (5 min)

**Option A: Via Vercel Dashboard (Recommended)**

1. Go to: https://vercel.com/new
2. Import `street-admin-portal` repo
3. **Framework Preset**: Vite
4. **Build Command**: `npm run build`
5. **Output Directory**: `dist`
6. **Environment Variables**: Click "Add"
   - Name: `VITE_API_URL`
   - Value: `https://streetadmin.tech/v1`
7. Click **Deploy**

**Option B: Via CLI**

```bash
cd /d/git_repo/street-admin-portal

# Install Vercel CLI if needed
npm i -g vercel

# Login and deploy
vercel login
vercel --prod

# Add environment variable
vercel env add VITE_API_URL production
# Paste: https://streetadmin.tech/v1
```

### 3️⃣ Configure Domain (2 min)

1. In Vercel project → **Settings** → **Domains**
2. Add domain: `streetadmin.tech`
3. Vercel will show DNS records - add them to your registrar
4. Wait for DNS propagation (usually instant, max 48 hours)

### 4️⃣ Update Backend (3 min)

**Important:** Your production backend needs these env vars:

```env
NODE_ENV=production
ADMIN_PORTAL_URL=https://streetadmin.tech
GOOGLE_CALLBACK_URL=https://streetadmin.tech/v1/auth/admin/google/callback
```

Add these to your production backend `.env` and restart.

### 5️⃣ Test It! (2 min)

1. Go to: https://streetadmin.tech
2. Click "Sign in with Google"
3. Login with `tech@street.london`
4. ✅ You should see the admin dashboard!

---

## ⚠️ Common Issues

### Issue: "redirect_uri_mismatch"
✅ **Fix:** Complete Step 1 (Google OAuth setup)

### Issue: Blank page after deploy
✅ **Fix:** Check Vercel environment variable `VITE_API_URL` is set

### Issue: 401 on API calls
✅ **Fix:** Backend needs `NODE_ENV=production` and proper cookie settings

### Issue: Can't login
✅ **Fix:** Verify all 3 URLs match:
- Google OAuth callback
- Backend `GOOGLE_CALLBACK_URL`
- Actual callback URL: `https://streetadmin.tech/v1/auth/admin/google/callback`

---

## 📋 Deployment Checklist

- [ ] Google OAuth callback added
- [ ] Deployed to Vercel
- [ ] Environment variable set
- [ ] Domain configured
- [ ] Backend updated with production env vars
- [ ] Tested login
- [ ] Tested API calls

---

## 🆘 Need Help?

- **Detailed Guide**: See [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md)
- **Vercel Issues**: Check deployment logs in Vercel dashboard
- **Backend Issues**: Check backend logs and env vars

---

**Note:** The backend code already supports production! Just add the env vars and restart.
