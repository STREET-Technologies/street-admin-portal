# Coding Conventions

**Analysis Date:** 2026-02-09

## Naming Patterns

**Files:**
- PascalCase for component files: `AdminDashboard.tsx`, `SearchBar.tsx`, `UserCard.tsx`
- lowercase for shadcn/ui components: `button.tsx`, `card.tsx`, `dialog.tsx`
- camelCase for services/utils: `api.ts`, `searchService.ts`, `statusUtils.ts`
- kebab-case for hooks: `use-mobile.tsx`, `use-toast.ts`

**Functions:**
- camelCase for all functions
- `handle` prefix for event handlers: `handleSearch()`, `handleAvatarClick()`, `handleFileChange()`
- `get` prefix for getters: `getStatusColor()`, `getInitials()`, `getSearchIcon()`
- Descriptive async names: `searchUsers()`, `getUser()`, `updateUserAddress()`

**Variables:**
- camelCase: `queryClient`, `selectedType`, `searchResults`
- `is/has` prefix for booleans: `isEditing`, `isSaving`, `isLoadingAddresses`, `isHovering`
- Descriptive state names: `avatarUrl`, `editData`, `fileInputRef`

**Types:**
- PascalCase for interfaces, no I prefix: `User`, `Retailer`, `Order`
- PascalCase for type aliases: `EntityType`, `EntityStatus`
- Extends pattern for shared fields: `interface User extends BaseEntity`

**Constants:**
- UPPER_SNAKE_CASE: `MOBILE_BREAKPOINT`, `API_BASE_URL`
- Arrays use `as const`: `POS_SYSTEMS = ["Shopify", ...] as const`

## Code Style

**Formatting:**
- No Prettier config (formatting is manual/organic)
- 2 space indentation
- Double quotes for strings
- Semicolons required
- Consistent spacing around imports and code blocks

**Linting:**
- ESLint 9 with `eslint.config.js`
- Extends: `@eslint/js` recommended, `typescript-eslint` recommended
- Plugins: `react-hooks`, `react-refresh`
- Custom: `@typescript-eslint/no-unused-vars: "off"`
- Run: `npm run lint`

**TypeScript Strictness:**
- `strict: false` in `tsconfig.app.json`
- `noImplicitAny: false` - implicit any allowed
- `strictNullChecks: false` - null checks disabled
- `noUnusedLocals: false` - unused variables allowed
- `noUnusedParameters: false` - unused params allowed

## Import Organization

**Order:**
1. React imports (`import { useState } from "react"`)
2. External packages (`lucide-react`, `sonner`, `@tanstack/react-query`)
3. Internal UI components (`@/components/ui/button`)
4. Internal feature components (`@/components/SearchBar`)
5. Services and utilities (`@/services/api`, `@/utils/statusUtils`)
6. Types (`import type { EntityType } from "@/types"`)

**Grouping:**
- No enforced blank lines between groups
- Generally alphabetical within groups

**Path Aliases:**
- `@/*` maps to `./src/*` (configured in `tsconfig.json` and `vite.config.ts`)
- Used consistently throughout codebase

## Error Handling

**Patterns:**
- ApiService: try/catch with console.error, re-throws on HTTP errors (`src/services/api.ts`)
- Components: `.catch(err => console.error(...))` for async data loads
- Toast notifications (sonner) for user-facing form submission errors

**Error Types:**
- No custom error classes
- Standard Error thrown from ApiService on non-OK responses
- Silent failures common for secondary data loads (addresses, devices, notes)

## Logging

**Framework:**
- Console only (console.log, console.error, console.warn)
- ~38 console statements across ~13 files

**Patterns:**
- `console.error('Failed to load X:', err)` for caught errors
- `console.log(...)` for debug output in services
- No structured logging, no log levels beyond console methods

## Comments

**When to Comment:**
- Minimal commenting style
- Used for section markers: `// Type Selection Buttons`, `// Handle different entity types`
- Used for TODOs: `// TODO: This should come from backend`

**File Headers:**
- Some files have descriptive headers:
  - `// API service for STREET backend integration` (`src/services/api.ts`)
  - `// Clean type definitions for the STREET admin portal` (`src/types/index.ts`)
  - `// Utility functions for status handling` (`src/utils/statusUtils.ts`)

**TODO Comments:**
- Format: `// TODO: description`
- Present in `src/services/api.ts` (multiple, re: backend fields)

## Function Design

**Size:**
- Most functions under 50 lines
- Exception: `OverviewTab.tsx` component (595 lines) - could be decomposed

**Parameters:**
- Destructured props in components: `({ user, onUpdate }: UserCardProps)`
- Options objects not commonly used (simple parameter lists preferred)

**Return Values:**
- Explicit returns in services
- JSX returns in components (arrow function with implicit return for simple components)
- Early returns for guard clauses

## Module Design

**Exports:**
- Default exports for page components and App (`export default App`)
- Named exports for services: `export class ApiService`, `export class SearchService`
- Named exports for UI components: `export { Button }` from shadcn/ui
- Re-exports from `src/types/index.ts` barrel file

**Component Pattern:**
- Functional components only (no class components)
- Arrow function syntax: `const Component = () => { ... }`
- Props interfaces defined inline or in same file

---

*Convention analysis: 2026-02-09*
*Update when patterns change*
