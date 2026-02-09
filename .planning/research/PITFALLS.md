# Pitfalls Research

**Domain:** Internal admin dashboard
**Researched:** 2026-02-09
**Confidence:** High -- based on multiple sources including post-mortems, community discussions, production case studies, and direct analysis of the current STREET admin portal codebase

---

## Critical Pitfalls

### 1. The "God Component" Trap

**What it is:** Components that handle data fetching, state management, business logic, and rendering all in one file. The current portal has 595+ line components born from AI code generation (Lovable), where a single file manages API calls, conditional rendering for multiple entity types, form handling, and display logic simultaneously.

**Warning signs:**
- A component file exceeds 200 lines
- More than 5 `useState` calls in one component
- Multiple unrelated state values living together (search state + UI state + entity data)
- `as any` type assertions to force incompatible data through (visible in the current `UserCard.tsx` line 100: `data={searchResults.data as any}`)
- `Object.assign(data, updatedData)` mutating props directly (current `UserCard.tsx` line 25)

**Prevention:**
- Enforce a hard 200-line component limit via ESLint rule (`max-lines-per-function`)
- Decompose by responsibility: container components (data), presentation components (display), and custom hooks (logic)
- Each component should be describable in one sentence. If you need "and" to describe it, split it
- Extract custom hooks for every data-fetching concern; never put `fetch` or API calls directly in component bodies
- Use composition over conditional rendering -- instead of one `UserCard` that handles users, retailers, and couriers via conditionals, create `UserDetailView`, `RetailerDetailView`, `CourierDetailView` composed from shared primitives

**Phase:** Foundation (Phase 1) -- establish component patterns before any feature work

---

### 2. Scattered API Calls / No API Layer

**What it is:** `fetch()` or `axios` calls made directly inside components or scattered across the codebase with duplicated headers, base URLs, and error handling. The current portal has API calls distributed across multiple components with no centralized client, meaning a single API endpoint change requires hunting through the entire codebase.

**Warning signs:**
- `fetch()` or `axios.get()` appearing in component files
- Base URL strings repeated in multiple files
- Auth token attachment logic duplicated across calls
- No single place to add request logging or error interception
- Different error handling approaches in different components

**Prevention:**
- Create a single API client module (`src/lib/api-client.ts`) that wraps fetch/axios with auth headers, base URL, error interceptors, and response normalization
- Build a typed service layer (`src/services/`) with one file per domain (users, orders, referrals, settings)
- Use TanStack Query (React Query) for all server state -- it handles caching, deduplication, retry, and background refresh out of the box
- The component should never know what HTTP method is used or what the endpoint URL is
- Type every request and response with strict TypeScript interfaces

**Phase:** Foundation (Phase 1) -- the API layer must exist before any feature fetches data

---

### 3. Relaxed TypeScript / No Strict Mode

**What it is:** Running TypeScript without `strict: true`, which disables critical safety checks. The current portal explicitly sets `noImplicitAny: false`, `strictNullChecks: false`, and `noUnusedParameters: false` in `tsconfig.json` -- effectively turning TypeScript into a slightly-typed JavaScript.

**Warning signs:**
- `as any` appearing anywhere in the codebase (current codebase has this)
- No compile errors when accessing potentially-null values
- Functions accepting `any` parameters without complaint
- Unused variables and imports accumulating without lint warnings
- Runtime `TypeError: Cannot read property of undefined` errors that strict mode would catch at compile time

**Prevention:**
- Enable `strict: true` in `tsconfig.json` from day one of the rebuild. This enables `strictNullChecks`, `noImplicitAny`, `strictFunctionTypes`, `strictBindCallApply`, and more
- Ban `any` via ESLint rule `@typescript-eslint/no-explicit-any` (warn initially, error after Phase 1)
- Create proper discriminated union types for entities instead of using `as any` to force data through
- Define API response types that match actual backend responses, with validation via Zod at the boundary
- Enable `noUnusedLocals` and `noUnusedParameters` to keep the codebase clean

**Phase:** Foundation (Phase 1) -- must be configured before writing any new code

---

### 4. Hardcoded URLs and Configuration

**What it is:** API base URLs, feature flags, and environment-specific values embedded directly in source code. This makes it impossible to switch between staging and production without code changes, and creates security risks when production URLs leak into version control.

**Warning signs:**
- String literals containing `https://api.` or `localhost:` in component or service files
- Different branches or build steps needed for different environments
- `.env` files committed to git
- No `.env.example` file documenting required variables

**Prevention:**
- Use Vite's built-in `import.meta.env` system with `VITE_` prefixed variables
- Create `.env.development`, `.env.staging`, `.env.production` files
- Commit only `.env.example` with placeholder values; add all real `.env` files to `.gitignore`
- Create a typed config module (`src/lib/config.ts`) that reads and validates all env vars at startup, failing fast if any are missing
- Never reference `import.meta.env` directly in components -- always go through the config module

**Phase:** Foundation (Phase 1) -- environment config is infrastructure

---

### 5. Silent Failures / No Error UX

**What it is:** API calls that fail without any user-visible feedback. The user clicks a button, nothing happens, no error message appears, and the operation silently fails. This is the single most complained-about issue in admin dashboards because support staff depend on these tools to do their jobs -- a silent failure means a customer issue goes unresolved.

**Warning signs:**
- `try/catch` blocks with empty catch clauses
- `catch(e) { console.log(e) }` -- logging to a console no user will ever see
- No loading spinners or skeleton screens during data fetches
- No toast/notification system for operation outcomes
- No error boundary components wrapping feature areas

**Prevention:**
- Implement a global notification system (toast) for all mutations: success, error, and in-progress states
- Use TanStack Query's `onError`, `onSuccess` callbacks with a centralized notification handler
- Wrap every major feature area in its own Error Boundary so a crash in one section does not take down the entire portal
- Design explicit empty states ("No orders found"), loading states (skeleton screens), and error states ("Failed to load orders -- Retry") for every data-dependent view
- Never catch and swallow errors. Every error must either be shown to the user or logged to a monitoring service (or both)
- Distinguish between user-actionable errors ("Invalid email format") and system errors ("Service unavailable -- try again later")

**Phase:** Foundation (Phase 1) for infrastructure; enforced in every subsequent phase

---

### 6. Authentication and Session Management Bugs

**What it is:** The current portal has a known logout bug. Auth issues in admin dashboards are particularly dangerous because they can leave sessions open on shared workstations, expose admin capabilities to unauthorized users, or lock legitimate users out during critical support operations.

**Warning signs:**
- Token stored in `localStorage` without expiry checking
- No automatic redirect to login when a 401 response is received
- Logout only clears client state but does not invalidate the server session
- No session timeout for idle users
- Token refresh logic that fails silently, leaving the user in a "logged in but unable to do anything" state

**Prevention:**
- Implement a centralized auth module that handles login, logout, token storage, token refresh, and session validation
- Use HTTP-only cookies for token storage when possible, or at minimum validate token expiry on every API call
- Add an axios/fetch interceptor that catches 401 responses globally and redirects to login
- Implement idle timeout (e.g., 30 minutes of inactivity triggers logout)
- Test the full auth lifecycle: login, token refresh, idle timeout, manual logout, expired token, revoked session
- Never let the UI enter a "half-authenticated" state

**Phase:** Foundation (Phase 1) -- auth must work flawlessly before any feature development

---

### 7. AI-Generated Code Debt (Lovable/Cursor Specific)

**What it is:** Code generated by AI tools like Lovable tends to produce functional-looking code that is structurally unsound. The code works for demos but collapses under real-world usage patterns. Specific patterns include: duplicated logic across components instead of shared abstractions, overly large files that do everything inline, no separation of concerns, and configuration baked into source code.

**Warning signs:**
- Multiple components containing near-identical fetch/display logic
- No custom hooks -- all logic lives directly in components
- Excessive inline styles or style duplication
- Imports of UI components that are never actually used
- Over-provisioned UI library (70+ shadcn/ui components installed, only 15 used)
- No tests whatsoever (AI generators rarely produce tests)

**Prevention:**
- Do NOT incrementally patch the AI-generated code. Rebuild from scratch using the existing code only as a behavioral specification
- Audit the UI component library and remove unused components
- Establish code patterns (hooks, services, component structure) in Phase 1 and enforce them via linting
- Every new feature must include at minimum one integration test
- Use the existing portal as a "what it should do" reference, not a "how it should do it" reference

**Phase:** This IS the reason for the rebuild. Applies to every phase.

---

### 8. Table and Data Grid Implementation

**What it is:** Tables are the primary UI element of admin dashboards, and they are where most performance and UX problems concentrate. Common mistakes include client-side pagination of large datasets, non-sortable columns, no column resizing, broken search/filter interactions, and tables that re-fetch all data on every interaction.

**Warning signs:**
- Fetching all records and filtering/paginating in the browser
- Table re-renders causing scroll position loss
- No loading state when switching pages
- Columns that cannot be sorted or filtered
- No way to deep-link to a specific page or filter state (URL state not preserved)

**Prevention:**
- Use server-side pagination, sorting, and filtering from day one
- Adopt TanStack Table for headless table logic -- it separates data management from rendering
- Store table state (page, sort, filters) in URL search params so views are bookmarkable and shareable
- Implement virtual scrolling (react-virtual) for any list that could exceed ~100 rows
- Memoize row rendering to prevent unnecessary re-renders when only one cell changes
- Design a standard table wrapper component used across all features for consistency

**Phase:** Phase 2 (Core Features) -- but the table component architecture should be planned in Phase 1

---

### 9. Navigation and Information Architecture Failures

**What it is:** Admin dashboards that treat navigation as an afterthought end up with users unable to find features they use daily. Common patterns: everything crammed into a single sidebar, no breadcrumbs, no way to get back to where you were, inconsistent page titles, and features hidden behind non-obvious menu labels.

**Warning signs:**
- More than 8 top-level navigation items without grouping
- No breadcrumbs on detail pages
- Users asking "where is X?" despite X being in the navigation
- Navigation labels that use internal jargon instead of task-oriented language
- No keyboard shortcuts for frequent actions

**Prevention:**
- Organize navigation by user task, not by data model. "Look up a customer" not "Users table"
- Keep top-level navigation to 5-7 items maximum; use grouping for more
- Implement breadcrumbs on every page below the top level
- Preserve navigation state -- if the user navigates away and back, restore their previous position
- Add a command palette (Cmd+K) for power users to jump directly to any entity or page
- Test navigation with actual support staff: can they find [feature X] within 5 seconds?

**Phase:** Phase 1 (Foundation) for navigation structure; Phase 2 for command palette

---

### 10. Ignoring URL State

**What it is:** Dashboard state (active tab, selected entity, filter values, pagination page) stored only in React state instead of the URL. This means refreshing the page loses context, users cannot share links to specific views, and the browser back button does not work as expected.

**Warning signs:**
- Refreshing the page resets to the home/default view
- Users cannot send a colleague a link to a specific record
- Back button takes the user out of the app instead of to the previous view
- Filter state disappears when navigating away and returning

**Prevention:**
- Use React Router for all page-level navigation
- Store search queries, filter values, pagination state, and active tabs in URL search params
- Use the `useSearchParams` hook for all filter/table state
- Every distinct view should have a unique URL
- Test: can you copy the current URL, paste it in a new tab, and see the exact same view?

**Phase:** Foundation (Phase 1) -- routing architecture must be right from the start

---

## Technical Debt Patterns

| Pattern | Symptom | Consequence | Prevention |
|---------|---------|-------------|------------|
| `as any` type assertions | TypeScript compiles but runtime crashes | Null reference errors in production | Enable `strict: true`, ban `any` via ESLint |
| Prop drilling 4+ levels deep | Parent components passing data through intermediaries that do not use it | Refactoring one component breaks the entire chain | Use React Context for cross-cutting concerns, co-locate state with consumers |
| Copy-paste components | Near-identical components with slight variations | Bug fixes applied to one copy but not others | Extract shared logic into hooks, create composable base components |
| Inline fetch calls | API logic mixed with rendering | Cannot add caching, retry, or error handling consistently | Centralized API client + TanStack Query |
| Untyped API responses | Backend returns data, frontend assumes shape | Silent data corruption when backend changes | Zod validation at API boundary, generated types from backend OpenAPI spec |
| Commented-out code | Dead code left "just in case" | Cognitive load, confusion about what is active | Delete it. Git preserves history. ESLint `no-warning-comments` for TODOs |
| Direct DOM manipulation | `document.querySelector` in React components | State desync between React and actual DOM | Use refs and React state exclusively |
| Mixed async patterns | Some callbacks, some promises, some async/await | Inconsistent error handling, uncaught promise rejections | Standardize on async/await everywhere, add `no-floating-promises` ESLint rule |

---

## Integration Gotchas

| Gotcha | Description | Impact | Mitigation |
|--------|-------------|--------|------------|
| Backend API shape changes | NestJS backend evolves, field names or nesting changes without frontend notification | Components render stale or undefined data | Validate API responses with Zod schemas; fail loudly when shape does not match |
| CORS configuration drift | Staging and production CORS configs diverge | "Works on staging, broken in prod" | Test CORS in CI; document allowed origins per environment |
| Token expiry race conditions | Token expires mid-operation; parallel requests fail inconsistently | Some data loads, some does not; UI is half-populated | Implement token refresh interceptor with request queuing during refresh |
| Environment URL confusion | `streetadmin.tech` is STAGING, not production (counterintuitive) | Accidentally testing against wrong environment | Display environment badge prominently in the dashboard header; color-code environments |
| WebSocket/SSE reconnection | Real-time connections drop and do not reconnect | Dashboard shows stale data without indication | Implement reconnection with exponential backoff; show "connection lost" indicator |
| Pagination offset drift | Records added or deleted between page fetches | Duplicate or missing records when paginating | Use cursor-based pagination instead of offset-based when possible |
| Timezone handling | Backend stores UTC, frontend displays local time inconsistently | Orders and events appear at wrong times | Standardize on UTC internally, convert to local only at display time; always show timezone |

---

## Performance Traps

| Trap | Trigger | User Experience | Fix |
|------|---------|-----------------|-----|
| Fetching all records client-side | Dataset grows beyond ~500 rows | Page freezes for seconds on load | Server-side pagination from day one |
| Unnecessary re-renders | Parent state change triggers child re-render cascade | Sluggish typing in search bars, janky scrolling | `React.memo`, `useMemo`, `useCallback` at measured bottlenecks; avoid premature optimization |
| No request deduplication | Multiple components requesting same data independently | Redundant network calls, flickering UI | TanStack Query handles this automatically via cache keys |
| Bundle size bloat | Importing entire icon libraries, unused shadcn components | Slow initial page load (>3s) | Tree-shake icons, audit and remove unused UI components, code-split routes |
| Unoptimized images | Large PNG logos loaded on every page | Wasted bandwidth, slow rendering | Convert to WebP/SVG, set explicit dimensions, lazy-load below-fold images |
| Memory leaks in subscriptions | `useEffect` without cleanup, stale closures holding references | Dashboard slows down after extended use (common for support staff) | Always return cleanup functions from effects; use AbortController for fetch |
| Large form re-renders | Controlled inputs re-rendering entire form on every keystroke | Typing lag in forms with many fields | Use React Hook Form (uncontrolled mode), isolate field components |
| No route-based code splitting | All pages bundled into a single chunk | Full bundle downloaded even if user only visits one page | `React.lazy()` + `Suspense` for each route |

---

## Security Mistakes

| Mistake | Risk | Severity | Fix |
|---------|------|----------|-----|
| Client-only permission checks | Admin actions accessible via browser devtools or direct API calls | CRITICAL | Always enforce permissions server-side; client checks are UX only |
| JWT in localStorage | XSS attack can steal token and impersonate admin | HIGH | Use HTTP-only cookies; if localStorage is unavoidable, implement short-lived tokens with refresh rotation |
| No audit logging | Cannot determine who made what change, when | HIGH | Log all admin actions (who, what, when, what changed) server-side |
| No session timeout | Shared workstation stays logged in indefinitely | HIGH | Implement idle timeout (30 min) with warning dialog before logout |
| Hardcoded admin credentials | Compromised credentials grant permanent access | CRITICAL | Use proper auth (OAuth/SSO) or at minimum bcrypt-hashed passwords with rotation policy |
| No rate limiting on admin actions | Compromised account can bulk-delete or bulk-modify | HIGH | Rate limit destructive actions; require confirmation for bulk operations |
| Displaying sensitive data without masking | PII visible in screenshots, screen shares, shoulder surfing | MEDIUM | Mask email/phone by default with click-to-reveal; log reveals |
| No CSRF protection | Cross-site request can trigger admin actions | HIGH | Use CSRF tokens or SameSite cookie attribute |

---

## UX Pitfalls

| Pitfall | User Impact | How It Manifests | Fix |
|---------|-------------|------------------|-----|
| No feedback on actions | User clicks button, nothing visible happens | "Did it work? Let me click again" -- duplicate submissions | Show loading state immediately on click; disable button during operation; show success/error toast |
| Data density too low | Excessive whitespace wastes screen real estate | Support staff scrolling constantly, slow to find information | Optimize for information density; admin tools are NOT marketing pages |
| Data density too high | Wall of text with no visual hierarchy | Information overload, key data missed | Use visual hierarchy: bold labels, grouped sections, progressive disclosure |
| No keyboard navigation | Mouse required for every action | Slow for power users who process many records daily | Tab navigation, Enter to confirm, Escape to cancel, Cmd+K command palette |
| Broken search experience | Search returns unexpected results or takes too long | Users manually browse instead of searching | Debounced search, clear result display, search across entity types, show "no results" state |
| Modal overuse | Every action opens a modal, interrupting workflow | Context loss, modal stacking, escape key confusion | Use inline editing, slide-over panels, or dedicated pages for complex forms |
| No confirmation for destructive actions | Delete/disable happens on single click | Accidental data loss, panic | Require explicit confirmation with clear description of what will happen |
| Inconsistent date/time formatting | Dates shown as "2 days ago" in one place, "2024-01-15" in another | Confusion, support staff giving customers wrong information | Standardize: absolute dates for records, relative dates only for recent activity |
| Missing empty states | Blank white space when no data exists | User thinks the page is broken or still loading | Design empty states with explanation and next-action guidance for every data view |
| Non-linkable views | Cannot share a deep link to a specific record or state | Support staff cannot hand off cases to colleagues | Every distinct view must have a unique, shareable URL |

---

## "Looks Done But Isn't" Checklist

These items commonly pass demo review but fail in production. Check every one before declaring a feature complete:

- [ ] **Error state:** What happens when the API returns 500? 404? Network timeout? Is there a visible error message?
- [ ] **Empty state:** What does the UI show when there are zero records? Is it distinguishable from "still loading"?
- [ ] **Loading state:** Is there a spinner or skeleton while data loads? Does it appear within 100ms of the action?
- [ ] **Slow network:** Does it work on a throttled connection? Does the loading state persist long enough to be seen?
- [ ] **Long text:** What happens when a user name is 80 characters? Does it truncate with tooltip, or break the layout?
- [ ] **Special characters:** Does the search work with `O'Brien`, `cafe@street.london`, or emoji in notes?
- [ ] **Concurrent users:** What if two admins edit the same record simultaneously? Is there optimistic locking or last-write-wins?
- [ ] **Pagination boundary:** What happens on the last page with only 1 record? Does the "next" button disable correctly?
- [ ] **Token expiry mid-session:** Does the user get logged out gracefully, or does the page half-load with errors?
- [ ] **Browser back button:** Does it return to the previous view, or exit the app entirely?
- [ ] **Page refresh:** Does the current view survive a browser refresh, or reset to the default state?
- [ ] **Permission denied:** What does the UI show for an action the user is not authorized to perform? Is the button hidden, disabled, or does it show a 403 after clicking?
- [ ] **Rapid clicking:** What happens if the user clicks "Save" 5 times quickly? Are there duplicate submissions?
- [ ] **Large dataset:** Does the table still work with 10,000 records? 100,000?
- [ ] **Mobile/tablet:** Is the dashboard usable on a tablet? Support staff sometimes use tablets
- [ ] **Copy-paste:** Can the user copy a customer email, order ID, or phone number from the dashboard?
- [ ] **Accessibility:** Can a keyboard-only user complete the primary workflow?
- [ ] **Offline/reconnect:** What happens if the network drops and comes back? Does the dashboard recover?

---

## Recovery Strategies

When a pitfall has already occurred (as many have in the current portal), here is how to recover:

### From God Components
1. Write characterization tests against the current behavior (test what it DOES, not what it SHOULD do)
2. Extract custom hooks for each data-fetching concern
3. Extract sub-components starting from the leaves (deepest nesting) and working upward
4. Verify tests still pass after each extraction
5. Only then refactor internal logic

### From Scattered API Calls
1. Create the centralized API client first
2. Create typed service modules one domain at a time
3. Migrate one component at a time to use services instead of direct fetch
4. Delete the old fetch calls only after the new service is verified working
5. Add TanStack Query integration after services are stable

### From No TypeScript Strict Mode
1. Enable strict mode in a NEW tsconfig that extends the base
2. Fix errors file by file, starting with the API layer and working outward
3. Use `// @ts-expect-error` sparingly and temporarily, with a tracking issue for each
4. Once all files compile under strict, switch the main tsconfig
5. Add `@typescript-eslint/no-explicit-any` as a warning, escalate to error after cleanup

### From No Tests
1. Do NOT try to retroactively test the old code
2. Write tests for the new code from Phase 1 onward
3. Start with integration tests (user flows) rather than unit tests (individual functions)
4. Test the "Looks Done But Isn't" checklist items first -- they are highest value
5. Aim for 80% coverage of critical paths, not 100% coverage of everything

### From AI-Generated Code
1. Use the existing portal as a BEHAVIORAL specification: document what it does (not how)
2. Screenshot every view and interaction for reference
3. Build the new version from scratch, never copying code blocks from the old version
4. If the old code has useful business logic, extract it into pure functions with tests first
5. Treat the rebuild as a green-field project that happens to have a working prototype for reference

---

## Pitfall-to-Phase Mapping

| Phase | Pitfalls to Address | Priority |
|-------|-------------------|----------|
| **Phase 1: Foundation** | TypeScript strict mode, API client architecture, environment configuration, auth module, error handling infrastructure, routing/URL state, component patterns, ESLint rules | MUST -- these are structural. Getting them wrong poisons every subsequent phase |
| **Phase 2: Core Features** | Table architecture, search UX, data display patterns, empty/loading/error states per feature, permission-aware UI, navigation structure | MUST -- these are where users spend 90% of their time |
| **Phase 3: Polish** | Keyboard navigation, command palette, performance optimization, responsive design, accessibility audit, idle timeout | SHOULD -- these separate a good tool from a great one |
| **Phase 4: Hardening** | Security audit, audit logging, rate limiting, concurrent editing, large dataset testing, cross-browser testing | MUST -- these prevent incidents. Schedule before any production rollout |
| **Ongoing** | Bundle size monitoring, unused code cleanup, test coverage maintenance, dependency updates, performance regression tracking | CONTINUOUS -- schedule monthly reviews |

---

## Sources

**React Admin Dashboard Mistakes:**
- [Common Mistakes in React Admin Dashboards - DEV Community](https://dev.to/vaibhavg/common-mistakes-in-react-admin-dashboards-and-how-to-avoid-them-1i70)
- [React Admin Panel Project Structure Best Practice - Medium](https://srobbin01.medium.com/react-admin-panel-dashboard-project-structure-best-practice-starter-kit-13fa5b3a71e7)
- [Story of a Failed React Project - DEV Community](https://dev.to/mohammadfaisal/story-of-a-failed-react-project-4bhp)

**Dashboard UX Design:**
- [Dashboard Design Disasters: 6 UX Mistakes - Raw.Studio](https://raw.studio/blog/dashboard-design-disasters-6-ux-mistakes-you-cant-afford-to-make/)
- [Dashboard Design UX Patterns Best Practices - Pencil & Paper](https://www.pencilandpaper.io/articles/ux-pattern-analysis-data-dashboards)
- [Admin Dashboard UI/UX Best Practices for 2025 - Medium](https://medium.com/@CarlosSmith24/admin-dashboard-ui-ux-best-practices-for-2025-8bdc6090c57d)
- [Dashboard Design Best Practices - Toptal](https://www.toptal.com/designers/data-visualization/dashboard-design-best-practices)
- [Effective Dashboard Design Principles - UXPin](https://www.uxpin.com/studio/blog/dashboard-design-principles/)
- [6 UX Design Mistakes to Avoid When Designing Dashboards - Medium](https://medium.com/design-led/6-ux-design-mistakes-to-avoid-when-designing-dashboards-9513ca13978a)

**Stripe Dashboard & Design:**
- ["Make It Like Stripe," or Why Imitation Is a Tricky Design Strategy - Eleken](https://www.eleken.co/blog-posts/making-it-like-stripe)
- [Dashboard UX Design Best Practices - Lazarev.agency](https://www.lazarev.agency/articles/dashboard-ux-design)

**API Architecture:**
- [Separate API Layers In React Apps - profy.dev](https://profy.dev/article/react-architecture-api-layer)
- [Why You Need an API Layer and How To Build It - Semaphore](https://semaphore.io/blog/api-layer-react)
- [Path To A Clean React Architecture: API Layer & Data Transformations - profy.dev](https://profy.dev/article/react-architecture-api-layer-and-data-transformations)

**Component Refactoring:**
- [Common Sense Refactoring of a Messy React Component - Alex Kondov](https://alexkondov.com/refactoring-a-messy-react-component/)
- [Refactoring React Class Components: Story of a 2700-Line Component - Pieces](https://code.pieces.app/blog/how-to-refactor-large-react-components)
- [Techniques for Decomposing React Components - Medium/DailyJS](https://medium.com/dailyjs/techniques-for-decomposing-react-components-e8a1081ef5da)

**TypeScript Strict Mode:**
- [TypeScript Strict Mode in Practice: Catching Bugs with Type Safety - DEV Community](https://dev.to/pipipi-dev/typescript-strict-mode-in-practice-catching-bugs-with-type-safety-3kbk)
- [How to Set Up Strict TypeScript Configuration for React - OneUptime](https://oneuptime.com/blog/post/2026-01-15-strict-typescript-configuration-react/view)
- [The Ultimate Guide to TypeScript Strict Mode - TypeScript World](https://typescriptworld.com/the-ultimate-guide-to-typescript-strict-mode-elevating-code-quality-and-safety)

**Error Handling & State Management:**
- [UI Best Practices for Loading, Error, and Empty State in React - LogRocket](https://blog.logrocket.com/ui-design-best-practices-loading-error-empty-state-react/)
- [How Senior React Developers Handle Loading States & Error Handling - Medium](https://medium.com/@sainudheenp/how-senior-react-developers-handle-loading-states-error-handling-a-complete-guide-ffe9726ad00a)
- [Error Handling in React with react-error-boundary - Certificates.dev](https://certificates.dev/blog/error-handling-in-react-with-react-error-boundary)

**Performance:**
- [Optimizing Large Lists in React: Virtualization vs Pagination - IGNEK](https://www.ignek.com/blog/optimizing-large-lists-in-react-virtualization-vs-pagination)
- [How to Render Large Datasets In React - Syncfusion](https://www.syncfusion.com/blogs/post/render-large-datasets-in-react)

**Security:**
- [Implementing RBAC in React - Permit.io](https://www.permit.io/blog/implementing-react-rbac-authorization)
- [Secure Role-Based Access Control in React with HTTP-Only Cookies - Medium](https://sragu2000.medium.com/secure-role-based-access-control-in-react-with-http-only-cookies-and-express-2c3e55660a57)
- [5 Best Practices for React with TypeScript Security - Snyk](https://snyk.io/blog/best-practices-react-typescript-security/)

**AI-Generated Code & Technical Debt:**
- [Why AI-Generated Code is Creating a Technical Debt Nightmare - Okoone](https://www.okoone.com/spark/technology-innovation/why-ai-generated-code-is-creating-a-technical-debt-nightmare/)
- [How AI Generated Code Compounds Technical Debt - LeadDev](https://leaddev.com/technical-direction/how-ai-generated-code-accelerates-technical-debt)
- [Technical Debt Grows from "Just for Now" - DEV Community](https://dev.to/nyaomaru/technical-debt-grows-from-just-for-now-a-real-world-code-walkthrough-5997)

**Community Discussions:**
- [Ask HN: How Can I Make a Dashboard That Doesn't Suck?](https://news.ycombinator.com/item?id=20418466)
- [HN: Write Admin Tools from Day One (2022)](https://news.ycombinator.com/item?id=34363642)
- [HN: Ask HN: Lessons Learned from Implementing User-Facing Analytics/Dashboards](https://news.ycombinator.com/item?id=37687798)

**Environment Configuration:**
- [Mastering Environment Variables in Vite + React - Medium](https://medium.com/@gosagnik/mastering-environment-variables-in-your-vite-react-project-89cf6bb66599)
- [How to Properly Handle Environment Variables in Vite with TypeScript - Medium](https://medium.com/@bharath0292/how-to-properly-handle-environment-variables-in-vite-with-typescript-7e1cbf4c2cc9)
