# Architecture

**Analysis Date:** 2026-02-09

## Pattern Overview

**Overall:** Component-Driven Single Page Application (SPA)

**Key Characteristics:**
- Client-side rendered React dashboard
- Service layer abstraction for backend API
- Mock data toggle for development without backend
- Google OAuth authentication with JWT tokens

## Layers

**Presentation Layer (Components):**
- Purpose: UI rendering, user interaction, local state
- Contains: React components, shadcn/ui primitives
- Location: `src/components/`, `src/components/ui/`, `src/components/user-tabs/`, `src/components/settings/`
- Depends on: Services, Types, Utils
- Used by: Pages

**Page Layer (Routes):**
- Purpose: Route-level components, authentication gate
- Contains: Route handlers, auth checks
- Location: `src/pages/Index.tsx`, `src/pages/NotFound.tsx`
- Depends on: Components
- Used by: Router in `src/App.tsx`

**Service Layer (Business Logic):**
- Purpose: API communication, data transformation, search logic
- Contains: ApiService (HTTP client + entity mapping), SearchService (query routing + mock data)
- Location: `src/services/api.ts`, `src/services/searchService.ts`
- Depends on: Types, native fetch
- Used by: Components

**Type Layer (Domain Model):**
- Purpose: TypeScript interfaces for all entities
- Contains: User, Retailer, Courier, Order, Invoice, Note, ReferralCode, etc.
- Location: `src/types/index.ts`
- Depends on: Nothing
- Used by: All layers

**Utility Layer:**
- Purpose: Shared helpers and constants
- Contains: Status colors, date formatting, class merging, static config
- Location: `src/utils/statusUtils.ts`, `src/lib/utils.ts`, `src/constants/index.ts`
- Depends on: Nothing
- Used by: Components, Services

## Data Flow

**Search Flow:**

1. User enters query in SearchBar (`src/components/SearchBar.tsx`)
2. AdminDashboard.handleSearch calls SearchService.search (`src/components/AdminDashboard.tsx`)
3. SearchService routes to mock data or ApiService (`src/services/searchService.ts`)
4. ApiService makes fetch call with Bearer token (`src/services/api.ts`)
5. ApiService transforms backend response to frontend types
6. Results stored in AdminDashboard state, rendered in UserCard (`src/components/UserCard.tsx`)
7. Detail tabs (Orders, Addresses, Notes) lazy-load via ApiService

**Authentication Flow:**

1. Page load checks localStorage for `access_token` (`src/pages/Index.tsx`)
2. Token validated via `GET /auth/me`
3. If valid: show AdminDashboard; if invalid: show Login
4. Login redirects to Google OAuth via backend (`src/components/Login.tsx`)
5. Backend redirects back with tokens in URL hash
6. Tokens stored in localStorage
7. Logout clears localStorage and calls `POST /auth/logout`

**State Management:**
- TanStack React Query for server data caching (`src/App.tsx`)
- React useState/useEffect for local component state
- localStorage for auth token persistence
- No global state management library (no Redux, Zustand, etc.)

## Key Abstractions

**ApiService:**
- Purpose: Centralized backend HTTP client with data transformation
- Location: `src/services/api.ts`
- Pattern: Static class methods, adapter pattern for entity mapping
- Methods: getUser, searchUsers, updateUser, getVendor, searchVendors, updateVendor, getNotes, createNote, getReferralCodes, etc.

**SearchService:**
- Purpose: Unified search across entity types with mock data fallback
- Location: `src/services/searchService.ts`
- Pattern: Static class with environment-based routing (mock vs API)

**Entity Tabs:**
- Purpose: Tabbed detail views for users/retailers
- Location: `src/components/user-tabs/` (OverviewTab, OrdersTab, NotesTab, AccountTab, ReferralsTab)
- Pattern: Each tab lazy-loads its own data via ApiService

**UI Component Library:**
- Purpose: Consistent, accessible UI primitives
- Location: `src/components/ui/` (60+ shadcn/ui components)
- Pattern: Radix UI headless primitives + Tailwind styling + CVA variants

## Entry Points

**Application Entry:**
- Location: `src/main.tsx`
- Triggers: Browser page load
- Responsibilities: ReactDOM.createRoot, render App

**App Component:**
- Location: `src/App.tsx`
- Triggers: Application mount
- Responsibilities: QueryClientProvider, TooltipProvider, BrowserRouter, route definitions

**Auth Gate:**
- Location: `src/pages/Index.tsx`
- Triggers: Route match for "/"
- Responsibilities: Token validation, login/dashboard routing

## Error Handling

**Strategy:** Console logging with minimal user feedback

**Patterns:**
- ApiService: try/catch with console.error, throws on HTTP errors (`src/services/api.ts`)
- Components: .catch() with console.error (addresses, devices, notes load silently fail)
- Toast notifications for user-facing errors in form submissions (sonner)
- No global error boundary

## Cross-Cutting Concerns

**Logging:**
- Console.log/console.error throughout (~38 statements across 13 files)
- No structured logging framework

**Validation:**
- Zod schemas for form validation (via react-hook-form resolvers)
- Minimal input validation in some components

**Authentication:**
- Bearer token from localStorage on every API request
- Token validation on page load
- Google OAuth for initial authentication

**Theming:**
- next-themes for light/dark mode
- CSS custom properties (HSL) in `src/index.css`
- Custom fonts: Hanson (brand), Barlow (body)

---

*Architecture analysis: 2026-02-09*
*Update when major patterns change*
