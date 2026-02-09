# External Integrations

**Analysis Date:** 2026-02-09

## APIs & External Services

**Street Backend (NestJS) - Primary API:**
- Purpose: All admin operations (user/vendor management, orders, notes, referrals)
- Base URL: `VITE_API_URL` env var (default: `http://localhost:8080/v1`)
- Production: `https://streetadmin.tech/v1` (staging environment)
- Client: Native Fetch API with Bearer token auth - `src/services/api.ts`
- Endpoints used:
  - `GET /auth/me` - Token validation
  - `POST /auth/logout` - Session termination
  - `GET/PATCH /admin/users/:userId` - User management
  - `GET /admin/users/:userId/addresses` - User addresses
  - `PATCH /admin/users/:userId/addresses/:addressId` - Update address
  - `GET /admin/users/:userId/orders` - User orders
  - `GET /admin/users/:userId/devices` - User devices
  - `GET/PATCH /admin/vendors/:vendorId` - Vendor management
  - `GET /admin/vendors/:vendorId/orders` - Vendor orders
  - `GET/POST /admin/notes/:entityType/:entityId` - Admin notes
  - `GET/POST /referrals/admin/codes` - Referral code management
  - `PATCH /referrals/admin/codes/:codeId/status` - Code status updates
  - `GET /admin/users?search=query&limit=10` - User search
  - `GET /admin/vendors?name=query&limit=10` - Vendor search

**Payment Processing:**
- Not applicable (handled by backend, no direct Stripe integration)

**Email/SMS:**
- Not applicable (handled by backend)

## Data Storage

**Databases:**
- Not applicable (backend manages PostgreSQL)

**File Storage:**
- Not applicable

**Caching:**
- TanStack React Query - Client-side data caching (`src/App.tsx`)
- localStorage - Token persistence (`access_token`, `refresh_token`)

## Authentication & Identity

**Auth Provider:**
- Google OAuth 2.0 - Admin SSO authentication
- OAuth callback: Backend handles OAuth flow, redirects with tokens in URL hash
- Implementation: `src/components/Login.tsx`, `src/services/api.ts`
- Token storage: localStorage (`access_token`, `refresh_token`)
- Session validation: `GET /auth/me` on page load (`src/pages/Index.tsx`)
- Email whitelist enforced by backend

**Dev Bypass Mode:**
- `VITE_DEV_BYPASS_AUTH=true` enables mock authentication - `src/components/Login.tsx`
- Sets fake tokens for local development without backend

## Monitoring & Observability

**Error Tracking:**
- Not detected (no Sentry, Rollbar, or similar)

**Analytics:**
- Not detected (no Google Analytics, Mixpanel, or similar)

**Logs:**
- Console logging only (console.error, console.log across ~13 files)

## CI/CD & Deployment

**Hosting:**
- Vercel - Static SPA deployment (`.vercelignore` present)
- Documentation: `docs/deployment/deploy-to-vercel.md`

**CI Pipeline:**
- Not detected (no GitHub Actions workflows)

## Environment Configuration

**Development:**
- Required env vars: `VITE_API_URL` (default: `http://localhost:8080/v1`)
- Optional env vars: `VITE_DEV_BYPASS_AUTH`, `VITE_USE_MOCK_DATA`, `VITE_PORT`
- Template: `.env.example`
- Mock data mode available via `VITE_USE_MOCK_DATA` - `src/services/searchService.ts`

**Production:**
- Config: `.env.production` (`VITE_API_URL=https://streetadmin.tech/v1`)
- Secrets: None client-side (all auth handled via backend OAuth flow)

## Webhooks & Callbacks

**Incoming:**
- Not applicable (frontend SPA, no webhook endpoints)

**Outgoing:**
- Not applicable

## Data Transformations

Backend-to-frontend entity mapping in `src/services/api.ts`:
- `BackendVendor` -> `Retailer` (field renaming, status mapping)
- `BackendUser` -> `User` (name splitting, image handling)
- Several fields hardcoded as placeholders (totalOrders, totalRevenue, commissionRate)

---

*Integration audit: 2026-02-09*
*Update when adding/removing external services*
