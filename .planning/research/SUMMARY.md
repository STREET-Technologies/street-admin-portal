# Research Summary

**Project:** STREET Admin Portal Redesign
**Researched:** 2026-02-09
**Overall Confidence:** HIGH

---

## Executive Summary

The STREET Admin Portal redesign is a green-field rebuild of an AI-generated (Lovable) internal support dashboard for a 2-3 person team running a marketplace. Research across stack, features, architecture, and pitfalls converges on a clear direction: build a Stripe-style admin dashboard using Vite + React 18 + shadcn/ui with a feature-first architecture, prioritizing search speed and entity detail views over analytics or configurability.

---

## Key Findings

### Stack (HIGH confidence)
- **Stay on React 18.3.1** -- React 19 has peer dependency issues with the ecosystem
- **Upgrade Tailwind to v4** -- 5x faster builds, CSS-first config, zero-config with `@tailwindcss/vite`
- **Replace React Router with TanStack Router** -- Type-safe file-based routing, built for Vite SPAs
- **Add TanStack Table** for data tables, **Zustand** for minimal client state, **ky** for HTTP
- **Keep** shadcn/ui, React Hook Form, Zod 3, TanStack Query, sonner, lucide-react, date-fns
- Reference implementation: `satnaing/shadcn-admin` (adapt for React 18)

### Features (HIGH confidence)
- **Core workflow:** Agent receives customer query -> searches portal -> finds entity -> reads detail page -> takes action
- **Table stakes (P0):** Sidebar nav, global search, entity list pages with data tables, full-page entity detail views, order detail page, breadcrumbs, status badges, copy-to-clipboard
- **Differentiators (P1):** Cmd+K command palette, cross-entity linking, quick actions, keyboard shortcuts, saved filters, inline editing
- **Anti-features:** No analytics dashboard, no RBAC, no bulk actions, no custom dashboards, no in-app chat, no notification center
- Design reference: Stripe Dashboard (nav, detail pages, cross-linking)

### Architecture (HIGH confidence)
- **Feature-first folder structure** (`src/features/users/`, `src/features/orders/`, etc.) following bulletproof-react pattern
- **Centralized API client** with auth headers, error handling, response envelope unwrapping
- **Backend-to-Frontend transform layer** -- separate BackendUser types from UserViewModel types
- **Query key factories** for TanStack Query cache management
- **State decision tree:** Server data in React Query, auth in Context, URL-driven state in search params, local state in useState
- **No barrel files** -- direct imports for better tree-shaking

### Pitfalls (HIGH confidence)
- **10 critical pitfalls identified** from current codebase analysis + industry research
- **Top 4 to address in Phase 1:** God components, scattered API calls, relaxed TypeScript, hardcoded URLs
- **AI-generated code** (Lovable) is the root cause -- rebuild from scratch, use existing portal only as behavioral spec
- **"Looks Done But Isn't" checklist** with 18 production-readiness checks per feature
- **Recovery strategy:** Don't patch the old code. Treat as green-field with a working prototype for reference

---

## Roadmap Implications

### Suggested Phase Structure

| Phase | Focus | Pitfalls Addressed | Estimated Scope |
|-------|-------|--------------------|-----------------|
| **1: Foundation** | Project scaffold, TypeScript strict, API client, auth module, routing, layout shell (sidebar + breadcrumbs), environment config, error handling infrastructure | #1-6, #10 | Medium |
| **2: Core Entities** | User list + detail, Retailer list + detail, Courier list + detail, Order list + detail, global search, data tables, status badges, copy-to-clipboard | #7, #8, #9 | Medium-Large |
| **3: Notes & Referrals** | Notes system (cross-entity), referral code management, settings page | -- | Small-Medium |
| **4: Power Features** | Cmd+K command palette, keyboard shortcuts, cross-entity linking, quick actions, inline editing, saved filters | -- | Medium |
| **5: Polish & Hardening** | Dark mode, performance audit, security review, accessibility, idle timeout, responsive design | All remaining | Small-Medium |

### Critical Path
```
Foundation (routing, API, auth, layout)
    |
    v
Core Entities (users, retailers, couriers, orders)
    |
    v
Notes & Referrals (cross-cutting features)
    |
    v
Power Features (Cmd+K, keyboard shortcuts, cross-linking)
    |
    v
Polish & Hardening (security, performance, accessibility)
```

### Key Constraints
1. **New branch required** -- User specified `redesign/admin-portal` branch off main
2. **Frontend first** -- Backend API fixes come after frontend redesign
3. **Same features, better design** -- No new backend-dependent features in initial scope
4. **2-3 person internal team** -- Don't over-engineer (no RBAC, no bulk actions, no analytics)

---

## Confidence Assessment

| Area | Confidence | Rationale |
|------|-----------|-----------|
| Stack choices | HIGH | Well-established libraries, version-pinned, compatibility verified |
| Feature priorities | HIGH | Based on Stripe/Shopify/Linear analysis + user's stated workflows |
| Architecture patterns | HIGH | bulletproof-react + TanStack patterns are industry standard |
| Pitfall identification | HIGH | Validated against current codebase + community post-mortems |
| Phase structure | MEDIUM | Logical ordering but scope estimates need validation during planning |
| Timeline | NOT ASSESSED | No estimates provided per project rules |

---

## Risks

1. **TanStack Router learning curve** -- Team is familiar with React Router. TanStack Router has different mental model (file-based, type-safe params). Mitigated by strong documentation and reference implementations.
2. **Tailwind v4 migration** -- New CSS-first config system. `tailwindcss-animate` replaced by `tw-animate-css`. shadcn/ui supports both but some components may need adjustment.
3. **Backend API gaps** -- Some features (order search, activity timeline) may require new backend endpoints. Flagged as "frontend first, backend after" per user decision.
4. **Scope creep** -- The feature research identified many desirable features. Phase structure is designed to prevent gold-plating by separating must-haves from nice-to-haves.

---

## Next Steps

1. **Define requirements** (`/gsd:define-requirements`) -- Convert research findings into checkable requirements per phase
2. **Create roadmap** (`/gsd:create-roadmap`) -- Formalize phase structure with gates and success criteria
3. **Create branch** -- `git checkout -b redesign/admin-portal` before any code changes
