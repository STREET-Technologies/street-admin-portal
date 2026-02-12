# Codebase Structure

**Analysis Date:** 2026-02-09 (updated after 01-01 scaffold)

## Directory Layout

```
street-admin-portal/
├── src/                           # TypeScript React source code
│   ├── app/                       # Application shell
│   │   ├── layout/                # Layout components (sidebar, header)
│   │   └── routes/                # TanStack Router file-based routes
│   │       └── __root.tsx         # Root route
│   ├── features/                  # Feature-first domain modules
│   │   ├── auth/                  # Authentication
│   │   │   ├── components/
│   │   │   ├── context/
│   │   │   ├── hooks/
│   │   │   └── api/
│   │   ├── users/                 # User management
│   │   │   ├── components/
│   │   │   └── api/
│   │   ├── retailers/             # Retailer management
│   │   │   ├── components/
│   │   │   └── api/
│   │   ├── couriers/              # Courier management
│   │   │   ├── components/
│   │   │   └── api/
│   │   ├── orders/                # Order management
│   │   │   ├── components/
│   │   │   └── api/
│   │   ├── notes/                 # Notes system
│   │   │   ├── components/
│   │   │   └── api/
│   │   ├── referrals/             # Referral system
│   │   │   ├── components/
│   │   │   └── api/
│   │   └── settings/              # Settings
│   │       └── components/
│   ├── components/                # Shared components
│   │   ├── ui/                    # shadcn/ui component library (20 files)
│   │   └── shared/                # Custom shared components
│   ├── lib/                       # Library utilities
│   │   └── utils.ts               # cn() class merge utility
│   ├── hooks/                     # Shared React hooks
│   │   └── use-mobile.ts          # Mobile breakpoint detection
│   ├── types/                     # Shared TypeScript types
│   ├── constants/                 # Static configuration data
│   ├── routeTree.gen.ts           # Auto-generated (TanStack Router)
│   ├── main.tsx                   # React 18 entry point
│   ├── index.css                  # Tailwind v4 CSS-first config + theme
│   └── vite-env.d.ts              # Vite type declarations
├── public/                        # Static assets (logos, fonts)
│   ├── img/                       # Logo images
│   └── fonts/                     # Custom fonts (Hanson, Barlow)
└── [config files]                 # Root-level configuration
```

## Directory Purposes

**src/app/routes/:**
- Purpose: TanStack Router file-based route definitions
- Contains: `__root.tsx` (root layout route), future route files
- Pattern: File name = URL path (e.g., `users.tsx` = `/users`)

**src/app/layout/:**
- Purpose: Application shell layout components
- Will contain: Sidebar, header, breadcrumbs

**src/features/{domain}/:**
- Purpose: Feature-first domain modules (each domain is self-contained)
- Pattern: Each feature has `components/`, `api/`, and optionally `hooks/`, `context/`
- Currently: 8 domains scaffolded with .gitkeep files

**src/components/ui/:**
- Purpose: shadcn/ui generated components
- Contains: 20 components (button, card, sidebar, tabs, form, dialog, etc.)
- Source: Generated via `npx shadcn@latest add`

**src/components/shared/:**
- Purpose: Custom shared components used across features
- Currently: Empty (will be populated in later plans)

**src/lib/:**
- Purpose: Library utilities and configuration
- Contains: `utils.ts` (cn() class merge utility)

## Key File Locations

**Entry Points:**
- `src/main.tsx` - React 18 createRoot entry point (placeholder)
- `src/app/routes/__root.tsx` - TanStack Router root route
- `src/routeTree.gen.ts` - Auto-generated route tree (do not edit)
- `index.html` - HTML entry point

**Configuration:**
- `vite.config.ts` - Vite 6 with React SWC + Tailwind v4 + TanStack Router plugins
- `tsconfig.json` + `tsconfig.app.json` + `tsconfig.node.json` - TypeScript (strict: true)
- `src/index.css` - Tailwind v4 CSS-first theme config (@theme inline)
- `eslint.config.js` - Linting rules
- `components.json` - shadcn/ui configuration
- `.env.example` / `.env.production` - Environment variables

**Testing:**
- No test files exist in the codebase

## Naming Conventions

**Files:**
- PascalCase.tsx for React components
- lowercase.tsx for shadcn/ui components (`button.tsx`, `card.tsx`)
- camelCase.ts for services and utilities
- kebab-case for hooks (`use-mobile.ts`)

**Directories:**
- kebab-case for feature directories
- lowercase for utility directories (`lib`, `hooks`, `types`)

**Special Patterns:**
- `*.d.ts` for type declarations (`vite-env.d.ts`)
- `*.gen.ts` for auto-generated files (do not edit manually)

## Where to Add New Code

**New Feature Module:**
- Create: `src/features/{domain}/{components,api}/`
- Types: `src/features/{domain}/types.ts` or `src/types/`

**New Route:**
- File: `src/app/routes/{route-name}.tsx`
- Route tree auto-updates via TanStack Router plugin

**New API Endpoint:**
- Add to: `src/features/{domain}/api/`
- Shared client: `src/lib/api-client.ts` (to be created)

**New UI Component:**
- shadcn/ui: `npx shadcn@latest add {component}` -> `src/components/ui/`
- Custom shared: `src/components/shared/{component}.tsx`

**Layout Components:**
- Add to: `src/app/layout/`

---

*Structure analysis: 2026-02-09*
*Updated: 2026-02-09 (01-01 scaffold)*
*Update when directory structure changes*
