# Technology Stack

**Analysis Date:** 2026-02-09

## Languages

**Primary:**
- TypeScript 5.5.3 - All application code (`package.json`, `tsconfig.json`)

**Secondary:**
- JavaScript - Config files (`eslint.config.js`, `postcss.config.js`)
- CSS (Tailwind) - Styling (`src/index.css`, `tailwind.config.ts`)

## Runtime

**Environment:**
- Node.js (no version locked, no `.nvmrc`)
- Browser runtime (React SPA, client-side rendered)

**Package Manager:**
- npm
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- React 18.3.1 - UI framework (`package.json`)
- React Router 6.26.2 - Client-side routing (`src/App.tsx`)

**Testing:**
- None installed (no Jest, Vitest, or Testing Library)

**Build/Dev:**
- Vite 5.4.1 - Bundler and dev server (`vite.config.ts`)
- @vitejs/plugin-react-swc 3.5.0 - Fast JSX compilation
- TypeScript 5.5.3 - Type checking
- PostCSS 8.4.47 + Autoprefixer 10.4.20 (`postcss.config.js`)

## Key Dependencies

**Critical:**
- @tanstack/react-query 5.56.2 - Data fetching and caching (`src/App.tsx`)
- react-hook-form 7.53.0 + @hookform/resolvers 3.9.0 - Form state management
- zod 3.23.8 - Schema validation
- next-themes 0.3.0 - Theme management (light/dark mode)

**UI:**
- shadcn/ui (30+ @radix-ui/* packages) - Headless UI component library (`src/components/ui/`)
- Tailwind CSS 3.4.11 - Utility-first styling (`tailwind.config.ts`)
- class-variance-authority 0.7.1 - Component styling variants
- clsx 2.1.1 + tailwind-merge 2.5.2 - Class name utilities (`src/lib/utils.ts`)
- lucide-react 0.462.0 - Icon library
- recharts 2.12.7 - Charting library
- sonner 1.5.0 - Toast notifications (`src/components/ui/sonner.tsx`)
- date-fns 3.6.0 - Date utilities

**Infrastructure:**
- Native Fetch API - HTTP client (no axios) (`src/services/api.ts`)

## Configuration

**Environment:**
- `.env.example` - Template with `VITE_API_URL`, `VITE_PORT`
- `.env.production` - Production config (`VITE_API_URL=https://streetadmin.tech/v1`)
- Additional undocumented env vars: `VITE_DEV_BYPASS_AUTH`, `VITE_USE_MOCK_DATA`

**Build:**
- `vite.config.ts` - Dev server port 8081, React SWC plugin, path alias
- `tsconfig.json` + `tsconfig.app.json` + `tsconfig.node.json` - TypeScript (ES2020, strict: false)
- `tailwind.config.ts` - Theme extensions, custom fonts (Hanson, Barlow)
- `eslint.config.js` - ESLint 9 with typescript-eslint, react-hooks, react-refresh
- `components.json` - shadcn/ui configuration
- Path alias: `@/*` -> `./src/*`

## Platform Requirements

**Development:**
- Any platform with Node.js
- No external dependencies (no Docker, no local DB)

**Production:**
- Vercel (indicated by `.vercelignore`)
- Static SPA deployment

---

*Stack analysis: 2026-02-09*
*Update after major dependency changes*
