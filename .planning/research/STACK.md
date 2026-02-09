# Stack Research

**Domain:** Internal admin dashboard
**Researched:** 2026-02-09
**Confidence:** HIGH (core stack), MEDIUM (specific version pins)

---

## Current State (Before Redesign)

The existing `package.json` uses: Vite 5.4, React 18.3.1, Tailwind CSS 3.4, React Router DOM 6.26, TanStack Query 5.56, Zod 3.23, React Hook Form 7.53, many individual `@radix-ui/*` packages, and `tailwindcss-animate`. This is the baseline we are upgrading from.

---

## Core Technologies

| Library | Target Version | Purpose | Why Recommended |
|---------|---------------|---------|-----------------|
| **React** | `18.3.1` | UI framework | Stable, proven. React 19 has peer dependency issues with ecosystem. Stay on 18 for this project. |
| **TypeScript** | `~5.7` | Type safety | Latest stable 5.x. Required for TanStack Router type inference. |
| **Vite** | `^6.1` | Build tool / dev server | Vite 6 is the stable LTS-like choice. Vite 7 (released Jan 2026) requires Node 20.19+ and drops Node 18. Use Vite 6 unless you confirm Node >= 20.19. |
| **Tailwind CSS** | `^4.1` | Utility-first CSS | v4 brings 5x faster full builds, zero-config, CSS-first configuration. Major DX improvement over v3. |
| **@tailwindcss/vite** | `^4.1` | Tailwind Vite plugin | First-party Vite plugin replaces PostCSS setup. Better performance than PostCSS approach. |
| **shadcn/ui** | `latest` (CLI) | Component library | Not a versioned npm package -- you run `npx shadcn@latest add <component>`. Components are copied into your codebase. |
| **radix-ui** | `^1.1` | Headless primitives | shadcn/ui's new components import from consolidated `radix-ui` package instead of individual `@radix-ui/react-*` packages. Cleaner dependency tree. |

## Supporting Libraries

| Library | Target Version | Purpose | Why Recommended |
|---------|---------------|---------|-----------------|
| **@tanstack/react-router** | `^1.146` | Client-side routing | Type-safe file-based routing. Built for Vite SPAs. Replaces react-router-dom. Better DX than React Router v7 in library mode. |
| **@tanstack/router-plugin** | `^1.146` | Vite plugin for TanStack Router | Enables file-based routing with auto code-splitting. Generates route tree at `src/routeTree.gen.ts`. |
| **@tanstack/react-query** | `^5.90` | Server state / data fetching | Already in use (v5.56). Handles caching, refetching, optimistic updates. The standard for REST API data in React. |
| **@tanstack/react-query-devtools** | `^5.90` | Dev tools for React Query | Visual inspector for query cache. Essential during development. |
| **@tanstack/react-table** | `^8.21` | Headless data tables | The standard for admin dashboard tables. shadcn/ui's DataTable component is built on it. Supports sorting, filtering, pagination, row selection. |
| **zustand** | `^5.0` | Client state management | Lightweight (1.2kB). For UI state only (sidebar open/closed, theme, filters). Server state belongs in React Query. |
| **react-hook-form** | `^7.71` | Form management | Already in use. First-class shadcn/ui integration. Performant -- isolates re-renders per field. |
| **@hookform/resolvers** | `^3.9` | Schema validation bridge | Connects Zod schemas to React Hook Form. Already in use. |
| **zod** | `^3.23` | Schema validation | Already in use. Stay on v3 for now. Zod 4 (v4.3) is out but ecosystem adapters (hookform resolvers) may not fully support v4 yet. Upgrade path is straightforward when ready. |
| **ky** | `^1.14` | HTTP client | Tiny (1kB) Fetch wrapper. Automatic JSON, retries, timeout, hooks/interceptors for Bearer token auth. Replaces raw fetch without Axios's 13kB overhead. |
| **sonner** | `^1.5` | Toast notifications | Already in use. shadcn/ui's official toast recommendation (old Toast component is deprecated). Used by OpenAI, Adobe. |
| **lucide-react** | `^0.563` | Icons | Already in use. Tree-shakable SVG icons. shadcn/ui's default icon library. |
| **date-fns** | `^3.6` | Date utilities | Already in use. Tree-shakable, functional API. Better for bundle size than dayjs when tree-shaking is configured. |
| **cmdk** | `^1.0` | Command palette | Already in use. Powers the command menu (Cmd+K). Standard in Stripe-style dashboards. |
| **recharts** | `^2.12` | Charts | Already in use. React-specific charting. Good enough for admin dashboard metrics. |
| **next-themes** | `^0.3` | Theme switching | Already in use. Works with Vite despite "next" in the name. Handles light/dark mode. |
| **class-variance-authority** | `^0.7` | Component variants | Already in use. Required by shadcn/ui for variant definitions. |
| **clsx** | `^2.1` | Classname utility | Already in use. Used with tailwind-merge in shadcn/ui's `cn()` utility. |
| **tailwind-merge** | `^2.5` | Tailwind class merging | Already in use. Prevents conflicting Tailwind classes. |

## Development Tools

| Tool | Target Version | Purpose | Why Recommended |
|------|---------------|---------|-----------------|
| **@vitejs/plugin-react-swc** | `^3.5` | React Vite plugin (SWC) | Already in use. SWC is faster than Babel for transforms. Keep this over `@vitejs/plugin-react`. |
| **ESLint** | `^9.x` | Linting | Already in use. Flat config format (eslint.config.js). |
| **typescript-eslint** | `^8.x` | TS linting rules | Already in use. |
| **eslint-plugin-react-hooks** | `^5.x` | Hooks linting | Already in use. Catches hooks rule violations. |
| **eslint-plugin-react-refresh** | `^0.4` | Fast refresh linting | Already in use. Ensures components work with Vite HMR. |

---

## Installation Commands

### New dependencies to add:

```bash
# Routing (replaces react-router-dom)
npm install @tanstack/react-router
npm install -D @tanstack/router-plugin

# Client state
npm install zustand

# HTTP client
npm install ky

# Upgrade existing (if desired)
npm install @tanstack/react-query@latest @tanstack/react-table
npm install -D @tanstack/react-query-devtools
```

### Tailwind CSS v4 migration (when ready):

```bash
# Remove Tailwind v3 packages
npm uninstall tailwindcss postcss autoprefixer tailwindcss-animate

# Install Tailwind v4
npm install tailwindcss @tailwindcss/vite

# Replace tailwindcss-animate with tw-animate-css
npm install tw-animate-css
```

### shadcn/ui component installation:

```bash
# Initialize (if starting fresh)
npx shadcn@latest init

# Add specific components
npx shadcn@latest add button card dialog table input form
npx shadcn@latest add sidebar command sonner
npx shadcn@latest add data-table  # Adds TanStack Table integration
```

### Radix consolidation (when updating shadcn/ui components):

New shadcn/ui components import from the consolidated `radix-ui` package. When you re-add components via `npx shadcn@latest add`, they will use the new import pattern. You can then remove individual `@radix-ui/react-*` packages.

---

## Alternatives Considered

### Routing

| Option | Verdict | Reason |
|--------|---------|--------|
| **TanStack Router** | **SELECTED** | Type-safe, file-based routing. Built for Vite SPAs. Auto code-splitting. Best DX for new projects. |
| React Router v7 (library mode) | Rejected | v7's best features (type safety, data loading) only work in "framework mode" (Remix). Library mode is essentially v6 with a version bump. |
| React Router v6 (current) | Rejected | Already using this. No file-based routing, no type-safe params, manual code-splitting. |

### State Management

| Option | Verdict | Reason |
|--------|---------|--------|
| **TanStack Query + Zustand** | **SELECTED** | React Query handles server state (95% of admin dashboard state). Zustand handles the small amount of client UI state. Minimal boilerplate. |
| Redux Toolkit | Rejected | Overkill for 2-3 user admin portal. Too much boilerplate. RTK Query duplicates what TanStack Query already does. |
| Jotai | Considered | Atomic state model is good, but Zustand's simpler API is better fit for this project's limited client state needs. |

### Data Tables

| Option | Verdict | Reason |
|--------|---------|--------|
| **TanStack Table + shadcn/ui DataTable** | **SELECTED** | Headless, fully customizable, first-class shadcn/ui integration. The de facto standard. |
| AG Grid | Rejected | Enterprise license cost. Overkill for admin dashboard. Hard to style with Tailwind. |
| MUI DataGrid | Rejected | Would pull in MUI's design system, conflicting with shadcn/ui styling. |

### HTTP Client

| Option | Verdict | Reason |
|--------|---------|--------|
| **ky** | **SELECTED** | 1kB, built on Fetch, has hooks/interceptors for auth headers. Modern, minimal. |
| Axios | Rejected | 13kB bundle. Features like XSRF protection and upload progress not needed for this admin dashboard. |
| Native Fetch | Considered | Works fine but requires manual JSON handling, error checking, retry logic, and auth header injection every time. ky wraps this cleanly. |

### Forms

| Option | Verdict | Reason |
|--------|---------|--------|
| **React Hook Form + Zod** | **SELECTED** | Already in use. First-class shadcn/ui Form component integration. Performant, type-safe. |
| Formik | Rejected | More re-renders, larger bundle, less TypeScript support than React Hook Form. |

### Schema Validation

| Option | Verdict | Reason |
|--------|---------|--------|
| **Zod 3.x** | **SELECTED** | Already in use. Stable, excellent TypeScript inference. |
| Zod 4.x | Deferred | Released (v4.3.6) with improvements (2kB core, JSON Schema built-in). But `@hookform/resolvers` may not fully support v4 yet. Upgrade when ecosystem catches up. |
| Valibot | Considered | Smaller bundle than Zod, but smaller ecosystem and less shadcn/ui community support. |

### Toast Notifications

| Option | Verdict | Reason |
|--------|---------|--------|
| **Sonner** | **SELECTED** | Already in use. shadcn/ui's official recommendation. Old `@radix-ui/react-toast` is deprecated in shadcn/ui. |

---

## What NOT to Use

| Library | Reason |
|---------|--------|
| **Next.js** | This is a Vite SPA. No SSR needed for an internal admin tool used by 2-3 people. |
| **Redux / Redux Toolkit** | Overkill. TanStack Query + Zustand covers everything with far less code. |
| **Axios** | 13kB for features you don't need. Use ky (1kB) or native fetch. |
| **MUI / Ant Design / Chakra** | Conflicts with shadcn/ui + Tailwind approach. Pick one design system. |
| **Moment.js** | Deprecated. date-fns is already in the project. |
| **Formik** | React Hook Form is already integrated and has better shadcn/ui support. |
| **styled-components / Emotion** | CSS-in-JS is unnecessary with Tailwind CSS. Adds runtime overhead. |
| **React Router v7** | In library mode it offers no meaningful upgrade over v6. TanStack Router is the better path for Vite SPAs. |
| **Tailwind CSS v3** | v4 is stable and production-ready. New projects should start with v4. Existing project should migrate. |
| **tailwindcss-animate** | Deprecated in shadcn/ui. Use `tw-animate-css` instead. |

---

## Version Compatibility Notes

### React 18 vs 19
- **Stay on React 18.3.1.** React 19 has peer dependency issues with several ecosystem packages. The project already pinned to 18.3.1 for this reason (see commit `c55eb0c`).
- shadcn/ui supports both React 18 and 19. New projects default to 19, but 18 works fine.
- TanStack Query v5 requires React 18+. Compatible.
- TanStack Router works with React 18. Compatible.
- TanStack Table works with React 16.8+. Compatible.
- Zustand 5 works with React 18+. Compatible.

### Vite 6 vs 7
- **Vite 7** (released Jan 2026) requires Node.js 20.19+ or 22.12+. Drops Node 18.
- **Vite 6** is the safe choice if your deployment environment might still use Node 18.
- Both support React 18 via `@vitejs/plugin-react-swc`.
- Recommendation: Use **Vite 6** unless you confirm Node >= 20.19 everywhere (local dev, CI, deployment).

### Tailwind CSS v3 to v4 Migration
- shadcn/ui supports both v3 and v4. Existing v3 projects continue to work.
- v4 uses CSS-first configuration (`@theme` directive in CSS) instead of `tailwind.config.js`.
- v4 uses `@tailwindcss/vite` plugin instead of PostCSS.
- `tailwindcss-animate` is replaced by `tw-animate-css`.
- `forwardRef` is no longer needed with React 19 + Tailwind v4, but since we stay on React 18, `forwardRef` remains necessary.

### Zod 3 vs 4
- Zod 4 is available (v4.3.6) but `@hookform/resolvers` support needs verification.
- Stay on Zod 3 (^3.23) until `@hookform/resolvers` officially supports v4.
- Migration path is straightforward when ready.

### Radix UI Consolidation
- New shadcn/ui components use a single `radix-ui` package instead of individual `@radix-ui/react-*` packages.
- Current project has ~25 individual `@radix-ui/react-*` dependencies. These will consolidate when components are regenerated via `npx shadcn@latest add`.

---

## Reference Implementation

The **satnaing/shadcn-admin** template (https://github.com/satnaing/shadcn-admin) is the closest reference to our target:
- React 19 + Vite 6 + shadcn/ui + TanStack Router + Tailwind CSS v4
- Includes: sidebar, command palette, data tables, auth patterns, dark mode
- We adapt this pattern but stay on React 18

---

## Architecture Pattern

```
src/
  routes/              # TanStack Router file-based routes
    __root.tsx          # Root layout (sidebar, header, toaster)
    _authenticated/     # Auth-guarded route group
      dashboard.tsx
      users/
        index.tsx       # Users list (DataTable)
        $userId.tsx     # User detail
      orders/
        index.tsx
        $orderId.tsx
      retailers/
        index.tsx
        $retailerId.tsx
    login.tsx           # Public route
  components/
    ui/                 # shadcn/ui components (generated)
    layout/             # Sidebar, Header, etc.
    data-tables/        # Reusable table column defs
  lib/
    api/                # ky client, API functions
    hooks/              # Custom hooks (useAuth, etc.)
    stores/             # Zustand stores
    schemas/            # Zod schemas
    utils.ts            # cn() and other utilities
  routeTree.gen.ts      # Auto-generated by TanStack Router plugin
```

### Data Flow Pattern
```
Route loader (optional) -> React Query hook -> ky HTTP client -> REST API
                                                                   |
Zod schema validates response <------------------------------------+
                                                                   |
TanStack Table renders data <--------------------------------------+
```

### Auth Pattern
```
ky instance with beforeRequest hook -> injects Bearer token from Zustand store
401 response -> ky afterResponse hook -> redirect to /login
```

---

## Sources

### HIGH Confidence (official docs, npm registry)
- [shadcn/ui Vite Installation](https://ui.shadcn.com/docs/installation/vite) - Official installation guide
- [shadcn/ui Data Table](https://ui.shadcn.com/docs/components/radix/data-table) - Official TanStack Table integration
- [shadcn/ui React Hook Form](https://ui.shadcn.com/docs/forms/react-hook-form) - Official form integration
- [shadcn/ui Sonner](https://ui.shadcn.com/docs/components/radix/sonner) - Official toast recommendation
- [shadcn/ui Tailwind v4](https://ui.shadcn.com/docs/tailwind-v4) - Official Tailwind v4 migration guide
- [shadcn/ui Changelog](https://ui.shadcn.com/docs/changelog) - Official changelog
- [TanStack Router Vite Installation](https://tanstack.com/router/latest/docs/framework/react/routing/installation-with-vite) - Official Vite setup
- [TanStack Query v5 npm](https://www.npmjs.com/package/@tanstack/react-query) - v5.90.20
- [TanStack Table npm](https://www.npmjs.com/package/@tanstack/react-table) - v8.21.3
- [Zustand npm](https://www.npmjs.com/package/zustand) - v5.0.11
- [React Hook Form npm](https://www.npmjs.com/package/react-hook-form) - v7.71.1
- [Zod npm](https://www.npmjs.com/package/zod) - v3 stable, v4.3.6 latest
- [ky npm](https://www.npmjs.com/package/ky) - v1.14.3
- [lucide-react npm](https://www.npmjs.com/package/lucide-react) - v0.563.0
- [Vite 7 announcement](https://vite.dev/blog/announcing-vite7) - Node 20.19+ requirement
- [Vite 6 announcement](https://vite.dev/blog/announcing-vite6) - Stable release
- [@tailwindcss/vite npm](https://www.npmjs.com/package/@tailwindcss/vite) - First-party Vite plugin
- [TanStack Query: Does this replace client state?](https://tanstack.com/query/v5/docs/react/guides/does-this-replace-client-state) - Official guidance on server vs client state

### MEDIUM Confidence (well-sourced articles, community consensus)
- [TanStack Router vs React Router v7 (Jan 2026)](https://medium.com/ekino-france/tanstack-router-vs-react-router-v7-32dddc4fcd58) - Detailed comparison
- [TanStack Router vs React Router (Better Stack)](https://betterstack.com/community/comparisons/tanstack-router-vs-react-router/) - Feature comparison
- [Goodbye Redux? Meet TanStack Query & Zustand in 2025](https://www.bugragulculer.com/blog/good-bye-redux-how-react-query-and-zustand-re-wired-state-management-in-25) - State management trends
- [Federated State Done Right: Zustand + TanStack Query](https://dev.to/martinrojas/federated-state-done-right-zustand-tanstack-query-and-the-patterns-that-actually-work-27c0) - Architecture patterns
- [React State Management in 2025](https://www.developerway.com/posts/react-state-management-2025) - State management overview
- [satnaing/shadcn-admin](https://github.com/satnaing/shadcn-admin) - Reference admin dashboard template
- [Axios vs Fetch 2026](https://iproyal.com/blog/axios-vs-fetch/) - HTTP client comparison
- [Why Ky is the Best Alternative](https://dev.to/usluer/why-ky-is-the-best-alternative-to-axios-and-fetch-for-modern-http-requests-27c3) - ky recommendation
- [Advanced React Forms with React Hook Form, Zod, Shadcn](https://wasp.sh/blog/2025/01/22/advanced-react-hook-form-zod-shadcn) - Form best practices
- [Building a multi-tenant SaaS with Vite, TanStack Router and Query](https://saas-ui.dev/blog/building-a-multi-tenant-b2b-saas-with-vite-tanstack-router) - Architecture reference

### LOW Confidence (single source, blog posts, unverified)
- Zod 4 + @hookform/resolvers compatibility status (not verified against actual release notes)
- Exact Vite 6 latest patch version (search showed v6.x but Vite 7 is now latest line)
- `tw-animate-css` as drop-in replacement for `tailwindcss-animate` (mentioned in shadcn docs but migration details sparse)
