# Codebase Structure

**Analysis Date:** 2026-02-09

## Directory Layout

```
street-admin-portal/
├── src/                           # TypeScript React source code
│   ├── assets/                    # Static images (team photos, logos)
│   ├── components/                # React components
│   │   ├── ui/                    # shadcn/ui component library (60+ files)
│   │   ├── user-tabs/             # Entity detail tab components
│   │   └── settings/              # Settings-specific components
│   ├── constants/                 # Static configuration data
│   ├── data/                      # Mock data fixtures
│   ├── hooks/                     # Custom React hooks
│   ├── lib/                       # Library utilities
│   ├── pages/                     # Route page components
│   ├── services/                  # Business logic layer
│   ├── types/                     # TypeScript type definitions
│   └── utils/                     # Utility functions
├── public/                        # Static assets (logos, fonts)
│   ├── img/                       # Logo images
│   └── fonts/                     # Custom fonts (Hanson, Barlow)
├── docs/                          # Documentation
│   ├── api/                       # Backend integration docs
│   ├── architecture/              # Architecture docs
│   ├── deployment/                # Deployment guides
│   └── setup/                     # Setup instructions
└── [config files]                 # Root-level configuration
```

## Directory Purposes

**src/components/:**
- Purpose: All React components (feature and UI)
- Contains: Feature components (AdminDashboard, SearchBar, UserCard, Login) + subdirectories
- Key files: `AdminDashboard.tsx` (main container), `UserCard.tsx` (entity detail), `Login.tsx` (auth), `SearchBar.tsx` (search)
- Subdirectories: `ui/` (shadcn/ui), `user-tabs/` (entity detail tabs), `settings/` (settings panels)

**src/components/ui/:**
- Purpose: shadcn/ui component library
- Contains: 60+ headless UI components (button, card, dialog, table, tabs, input, select, etc.)
- Key files: All lowercase kebab-case (`button.tsx`, `card.tsx`, `dialog.tsx`)

**src/components/user-tabs/:**
- Purpose: Tabbed detail views for entities
- Contains: `OverviewTab.tsx`, `OrdersTab.tsx`, `NotesTab.tsx`, `ReferralsTab.tsx`, `AccountTab.tsx`

**src/services/:**
- Purpose: Backend API communication and business logic
- Contains: `api.ts` (HTTP client + data transformation), `searchService.ts` (search routing + mock data)

**src/types/:**
- Purpose: All TypeScript domain model interfaces
- Contains: Single `index.ts` with User, Retailer, Courier, Order, Invoice, Note, ReferralCode, etc.

**src/constants/:**
- Purpose: Static configuration data
- Contains: Single `index.ts` with POS_SYSTEMS, RETAIL_CATEGORIES, status options, TEAM_MEMBERS

**src/utils/:**
- Purpose: Pure utility functions
- Contains: `statusUtils.ts` (getStatusColor, getPriorityColor, getInitials, formatDate)

**src/hooks/:**
- Purpose: Custom React hooks
- Contains: `use-mobile.tsx` (breakpoint detection), `use-toast.ts` (toast notifications)

**src/data/:**
- Purpose: Mock data for development/demo mode
- Contains: `mockData.ts` (mock users, retailers, couriers, orders)

**docs/:**
- Purpose: Developer documentation
- Contains: API integration docs, auth flow docs, deployment guides, setup instructions

## Key File Locations

**Entry Points:**
- `src/main.tsx` - ReactDOM entry point
- `src/App.tsx` - Root component with Router and providers
- `src/pages/Index.tsx` - Auth gate and dashboard routing
- `index.html` - HTML entry point

**Configuration:**
- `vite.config.ts` - Vite bundler config (port 8081, React SWC, path alias)
- `tsconfig.json` + `tsconfig.app.json` + `tsconfig.node.json` - TypeScript config
- `tailwind.config.ts` - Tailwind theme (custom fonts, colors)
- `eslint.config.js` - Linting rules
- `postcss.config.js` - PostCSS with Tailwind + Autoprefixer
- `components.json` - shadcn/ui configuration
- `.env.example` / `.env.production` - Environment variables

**Core Logic:**
- `src/services/api.ts` (461 lines) - All backend HTTP communication + data transformation
- `src/services/searchService.ts` (205 lines) - Search logic + mock data toggle
- `src/types/index.ts` (156 lines) - Complete domain model

**Feature Components:**
- `src/components/AdminDashboard.tsx` (124 lines) - Main dashboard container
- `src/components/UserCard.tsx` - Entity detail card with tabbed interface
- `src/components/SearchBar.tsx` - Entity search with suggestions
- `src/components/user-tabs/OverviewTab.tsx` (595 lines) - Largest tab, editable profile fields

**Testing:**
- No test files exist in the codebase

**Documentation:**
- `docs/api/backend-integration.md` - Backend API docs
- `docs/architecture/auth-flow.md` - Auth flow documentation
- `docs/deployment/deploy-to-vercel.md` - Deployment guide
- `docs/setup/quick-start.md` - Quick start guide

## Naming Conventions

**Files:**
- PascalCase.tsx for React components (`AdminDashboard.tsx`, `UserCard.tsx`, `SearchBar.tsx`)
- lowercase.tsx for shadcn/ui components (`button.tsx`, `card.tsx`, `dialog.tsx`)
- camelCase.ts for services and utilities (`api.ts`, `searchService.ts`, `statusUtils.ts`)
- kebab-case for hooks (`use-mobile.tsx`, `use-toast.ts`)

**Directories:**
- kebab-case for feature directories (`user-tabs`, `settings`)
- lowercase for utility directories (`utils`, `lib`, `hooks`, `types`)

**Special Patterns:**
- `index.ts` for barrel exports in types and constants
- `*.d.ts` for type declarations (`vite-env.d.ts`)

## Where to Add New Code

**New Feature Component:**
- Primary code: `src/components/`
- Sub-components: `src/components/{feature-name}/` if complex
- Types: `src/types/index.ts`

**New Entity Tab:**
- Implementation: `src/components/user-tabs/{TabName}Tab.tsx`
- Wire up in: `src/components/UserCard.tsx`

**New API Endpoint:**
- Add method to: `src/services/api.ts`
- Add types to: `src/types/index.ts`

**New UI Component:**
- shadcn/ui: `npx shadcn-ui add {component}` -> `src/components/ui/`
- Custom: `src/components/ui/{component}.tsx`

**New Page/Route:**
- Page: `src/pages/{PageName}.tsx`
- Route: Add to `src/App.tsx`

**Utilities:**
- Shared helpers: `src/utils/`
- Constants: `src/constants/index.ts`

## Special Directories

**src/components/ui/:**
- Purpose: shadcn/ui generated components
- Source: Generated via `npx shadcn-ui add`
- Committed: Yes (customized after generation)

**public/:**
- Purpose: Static assets served as-is
- Contains: Logos (`public/img/`), fonts (`public/fonts/`)
- Committed: Yes

**docs/:**
- Purpose: Developer documentation (categorized subfolders)
- Committed: Yes

---

*Structure analysis: 2026-02-09*
*Update when directory structure changes*
