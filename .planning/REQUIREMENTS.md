# Requirements: STREET Admin Portal Redesign

**Defined:** 2026-02-09
**Core Value:** Fast, intuitive customer support workflows — find any user or order in seconds and resolve issues without friction.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Navigation

- [ ] **NAV-01**: Admin can navigate between sections via persistent left sidebar (Users, Retailers, Couriers, Orders, Referrals, Settings)
- [ ] **NAV-02**: Admin sees breadcrumb trail on all pages below top level
- [ ] **NAV-03**: All pages have unique URLs that survive browser refresh and support back/forward navigation

### Search

- [ ] **SRCH-01**: Admin can search across all entity types (users, retailers, couriers, orders) from a single search input
- [ ] **SRCH-02**: Search results are grouped by entity type with type-ahead suggestions
- [ ] **SRCH-03**: Search supports name, email, phone, and order ID as input

### Entity Lists

- [ ] **LIST-01**: Admin can view a paginated list of all users with sortable columns
- [ ] **LIST-02**: Admin can view a paginated list of all retailers with sortable columns
- [ ] **LIST-03**: Admin can view a paginated list of all couriers with sortable columns
- [ ] **LIST-04**: Admin can view a paginated list of all orders with sortable columns
- [ ] **LIST-05**: Admin can filter entity lists by status and date range
- [ ] **LIST-06**: All list pages use server-side pagination (not client-side)

### Entity Details

- [ ] **DETL-01**: Admin can view full-page user detail with tabs (Overview, Orders, Addresses, Devices, Notes)
- [ ] **DETL-02**: Admin can view full-page retailer detail with tabs (Overview, Orders, Notes)
- [ ] **DETL-03**: Admin can view full-page courier detail with tabs (Overview, Notes)
- [ ] **DETL-04**: Admin can view full-page order detail (items, payment status, delivery status, customer, retailer, courier info)
- [ ] **DETL-05**: All entities display consistent color-coded status badges
- [ ] **DETL-06**: Admin can copy IDs, emails, phone numbers, and order IDs to clipboard with one click
- [ ] **DETL-07**: All entity references on detail pages are clickable links to the referenced entity's detail page
- [ ] **DETL-08**: Admin can perform quick actions from entity detail pages (block user, change retailer status, etc.)
- [ ] **DETL-09**: Admin can inline-edit fields on detail pages (click field, type, press Enter)
- [ ] **DETL-10**: Each entity detail page shows a chronological activity timeline of events

### Notes

- [ ] **NOTE-01**: Admin can create notes on any entity with priority level and author tracking
- [ ] **NOTE-02**: Admin can view all notes on an entity, sorted by date

### Referrals

- [ ] **REFL-01**: Admin can create, view, edit, and deactivate referral codes
- [ ] **REFL-02**: Admin can configure referral settings (commission rates, limits, etc.)

### Auth

- [ ] **AUTH-01**: Admin can log in via existing Google OAuth flow
- [ ] **AUTH-02**: Admin can log out (token properly invalidated before redirect)
- [ ] **AUTH-03**: Unauthenticated users are redirected to login page
- [ ] **AUTH-04**: Admin session persists across browser refresh

### Infrastructure

- [ ] **INFR-01**: All API calls go through a single centralized API client with auth headers and error handling
- [ ] **INFR-02**: TypeScript strict mode enabled (strictNullChecks, noImplicitAny, no `as any`)
- [ ] **INFR-03**: API base URL configured via environment variables (no hardcoded URLs)
- [ ] **INFR-04**: All mutations show success/error toast notifications
- [ ] **INFR-05**: All data views have loading (skeleton), empty, and error states
- [ ] **INFR-06**: Dark mode toggle with OS preference detection and persistence
- [ ] **INFR-07**: Device info displayed per user (real data from API)

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Navigation

- **NAV-V2-01**: Cmd+K command palette (search + navigate + actions from keyboard)
- **NAV-V2-02**: Keyboard shortcuts (G+U for users, G+R for retailers, Esc to close, ? for help)

### Search

- **SRCH-V2-01**: Saved filters / quick views (pre-configured filter shortcuts in sidebar)
- **SRCH-V2-02**: Advanced search operators (status:active, created:today, amount:>50)

### Notes

- **NOTE-V2-01**: Note pinning (pin important notes to top of list)
- **NOTE-V2-02**: Search across notes (find all entities where a note mentions X)
- **NOTE-V2-03**: Note categories/tags for filtering

### Auth

- **AUTH-V2-01**: Auth redesign (email/password admin accounts or improved OAuth)
- **AUTH-V2-02**: Idle session timeout (auto-logout after 30 min inactivity)

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Analytics dashboard / charts | Not primary use case; use dedicated analytics tool |
| RBAC (role-based access control) | Only 2-3 users, all need full access |
| Bulk actions / mass operations | Small marketplace scale; individual actions are safer |
| Custom dashboard widgets | Over-engineering for 2-3 users |
| In-app chat / messaging | Support communication happens in Slack/email |
| Automated workflows / rule engine | Belongs in backend, not admin UI |
| Notification center | Important alerts go to Slack, not in-app |
| Data export / CSV download | Query database directly for rare reporting needs |
| Backend API changes | Frontend-first approach; backend fixes are a separate project |
| Test coverage | Important but deferred to follow-up milestone after redesign ships |
| Mobile-responsive design | Admin portal used on desktop only |
| Communication history | Requires backend work not yet planned |
| Order mutations (refund, cancel) | Backend doesn't support admin order mutations yet |

## Traceability

Which phases cover which requirements. Updated by create-roadmap.

| Requirement | Phase | Status |
|-------------|-------|--------|
| NAV-01 | — | Pending |
| NAV-02 | — | Pending |
| NAV-03 | — | Pending |
| SRCH-01 | — | Pending |
| SRCH-02 | — | Pending |
| SRCH-03 | — | Pending |
| LIST-01 | — | Pending |
| LIST-02 | — | Pending |
| LIST-03 | — | Pending |
| LIST-04 | — | Pending |
| LIST-05 | — | Pending |
| LIST-06 | — | Pending |
| DETL-01 | — | Pending |
| DETL-02 | — | Pending |
| DETL-03 | — | Pending |
| DETL-04 | — | Pending |
| DETL-05 | — | Pending |
| DETL-06 | — | Pending |
| DETL-07 | — | Pending |
| DETL-08 | — | Pending |
| DETL-09 | — | Pending |
| DETL-10 | — | Pending |
| NOTE-01 | — | Pending |
| NOTE-02 | — | Pending |
| REFL-01 | — | Pending |
| REFL-02 | — | Pending |
| AUTH-01 | — | Pending |
| AUTH-02 | — | Pending |
| AUTH-03 | — | Pending |
| AUTH-04 | — | Pending |
| INFR-01 | — | Pending |
| INFR-02 | — | Pending |
| INFR-03 | — | Pending |
| INFR-04 | — | Pending |
| INFR-05 | — | Pending |
| INFR-06 | — | Pending |
| INFR-07 | — | Pending |

**Coverage:**
- v1 requirements: 37 total
- Mapped to phases: 0
- Unmapped: 37 (awaiting roadmap creation)

---
*Requirements defined: 2026-02-09*
*Last updated: 2026-02-09 after initial definition*
