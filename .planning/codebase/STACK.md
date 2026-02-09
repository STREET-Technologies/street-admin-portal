# Technology Stack

**Analysis Date:** 2026-02-09 (updated after 01-01 scaffold)

## Languages

**Primary:**
- TypeScript 5.7+ - All application code (`package.json`, `tsconfig.json`)

**Secondary:**
- JavaScript - Config files (`eslint.config.js`)
- CSS (Tailwind v4) - Styling (`src/index.css`, CSS-first config)

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
- TanStack Router 1.x - File-based client-side routing (`src/app/routes/`)

**Testing:**
- None installed (no Jest, Vitest, or Testing Library)

**Build/Dev:**
- Vite 6.4.x - Bundler and dev server (`vite.config.ts`)
- @vitejs/plugin-react-swc 4.x - Fast JSX compilation
- @tailwindcss/vite 4.x - Tailwind v4 Vite plugin
- @tanstack/router-plugin 1.x - Auto-generates route tree from file structure
- TypeScript 5.7+ - Type checking (strict mode)

## Key Dependencies

**Critical:**
- @tanstack/react-query 5.56.2 - Data fetching and caching
- @tanstack/react-router 1.x - File-based routing with type safety
- react-hook-form 7.53.0 + @hookform/resolvers 3.9.0 - Form state management
- zod 3.23.8 - Schema validation
- zustand 5.x - Client state management
- ky 1.x - HTTP client
- next-themes 0.3.0 - Theme management (light/dark mode)

**UI:**
- shadcn/ui (radix-ui) - Headless UI component library (`src/components/ui/`)
- Tailwind CSS 4.1+ - Utility-first styling (CSS-first config in `src/index.css`)
- tw-animate-css - Tailwind v4 animation utilities
- class-variance-authority 0.7.1 - Component styling variants
- clsx 2.1.1 + tailwind-merge 2.5.2 - Class name utilities (`src/lib/utils.ts`)
- lucide-react 0.462.0 - Icon library
- sonner 1.5.0 - Toast notifications (`src/components/ui/sonner.tsx`)
- date-fns 3.6.0 - Date utilities
- cmdk 1.0.0 - Command palette

## Configuration

**Environment:**
- `.env.example` - Template with `VITE_API_URL`, `VITE_PORT`, `VITE_DEV_BYPASS_AUTH`
- `.env.production` - Production config (`VITE_API_URL=https://streetadmin.tech/v1`)

**Build:**
- `vite.config.ts` - Dev server port 8081, React SWC + Tailwind v4 + TanStack Router plugins, path alias
- `tsconfig.json` + `tsconfig.app.json` + `tsconfig.node.json` - TypeScript (ES2020, strict: true)
- `eslint.config.js` - ESLint 9 with typescript-eslint, react-hooks, react-refresh
- `components.json` - shadcn/ui configuration (new-york style, Tailwind v4)
- `src/index.css` - Tailwind v4 CSS-first config with @theme inline (replaces tailwind.config.ts)
- Path alias: `@/*` -> `./src/*`

## Platform Requirements

**Development:**
- Any platform with Node.js
- No external dependencies (no Docker, no local DB)

**Production:**
- Static SPA deployment (Vercel or similar)

---

*Stack analysis: 2026-02-09*
*Updated: 2026-02-09 (01-01 scaffold)*
*Update after major dependency changes*
