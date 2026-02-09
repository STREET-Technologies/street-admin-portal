# Requirements: STREET Admin Portal Redesign

**Defined:** 2026-02-09
**Core Value:** Fast, intuitive customer support workflows — find any user or order in seconds and resolve issues without friction.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Navigation

- [x] **NAV-01**: Admin can navigate between sections via persistent left sidebar (Users, Retailers, Couriers, Orders, Referrals, Settings)
- [x] **NAV-02**: Admin sees breadcrumb trail on all pages below top level
- [x] **NAV-03**: All pages have unique URLs that survive browser refresh and support back/forward navigation

### Search

- [ ] **SRCH-01**: Admin can search across all entity types (users, retailers, couriers, orders) from a single search input
- [ ] **SRCH-02**: Search results are grouped by entity type with type-ahead suggestions
- [ ] **SRCH-03**: Search supports name, email, phone, and order ID as input

### Entity Lists

- [x] **LIST-01**: Admin can view a paginated list of all users with sortable columns
- [x] **LIST-02**: Admin can view a paginated list of all retailers with sortable columns
- [ ] **LIST-03**: Admin can view a paginated list of all couriers with sortable columns
- [ ] **LIST-04**: Admin can view a paginated list of all orders with sortable columns
- [x] **LIST-05**: Admin can filter entity lists by status and date range
- [x] **LIST-06**: All list pages use server-side pagination (not client-side)

### Entity Details

- [x] **DETL-01**: Admin can view full-page user detail with tabs (Overview, Orders, Addresses, Devices, Notes)
- [x] **DETL-02**: Admin can view full-page retailer detail with tabs (Overview, Orders, Notes)
- [ ] **DETL-03**: Admin can view full-page courier detail with tabs (Overview, Notes)
- [ ] **DETL-04**: Admin can view full-page order detail (items, payment status, delivery status, customer, retailer, courier info)
- [x] **DETL-05**: All entities display consistent color-coded status badges
- [x] **DETL-06**: Admin can copy IDs, emails, phone numbers, and order IDs to clipboard with one click
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

- [x] **AUTH-01**: Admin can log in via existing Google OAuth flow
- [x] **AUTH-02**: Admin can log out (token properly invalidated before redirect)
- [x] **AUTH-03**: Unauthenticated users are redirected to login page
- [x] **AUTH-04**: Admin session persists across browser refresh

### Infrastructure

- [x] **INFR-01**: All API calls go through a single centralized API client with auth headers and error handling
- [x] **INFR-02**: TypeScript strict mode enabled (strictNullChecks, noImplicitAny, no `as any`)
- [x] **INFR-03**: API base URL configured via environment variables (no hardcoded URLs)
- [x] **INFR-04**: All mutations show success/error toast notifications
- [x] **INFR-05**: All data views have loading (skeleton), empty, and error states
- [x] **INFR-06**: Dark mode toggle with OS preference detection and persistence
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
| NAV-01 | Phase 1 | Complete |
| NAV-02 | Phase 1 | Complete |
| NAV-03 | Phase 1 | Complete |
| AUTH-01 | Phase 1 | Complete |
| AUTH-02 | Phase 1 | Complete |
| AUTH-03 | Phase 1 | Complete |
| AUTH-04 | Phase 1 | Complete |
| INFR-01 | Phase 1 | Complete |
| INFR-02 | Phase 1 | Complete |
| INFR-03 | Phase 1 | Complete |
| INFR-04 | Phase 1 | Complete |
| INFR-05 | Phase 1 | Complete |
| INFR-06 | Phase 1 | Complete |
| LIST-01 | Phase 2 | Complete |
| LIST-02 | Phase 2 | Complete |
| LIST-05 | Phase 2 | Complete |
| LIST-06 | Phase 2 | Complete |
| DETL-01 | Phase 2 | Complete |
| DETL-02 | Phase 2 | Complete |
| DETL-05 | Phase 2 | Complete |
| DETL-06 | Phase 2 | Complete |
| LIST-03 | Phase 3 | Pending |
| LIST-04 | Phase 3 | Pending |
| DETL-03 | Phase 3 | Pending |
| DETL-04 | Phase 3 | Pending |
| SRCH-01 | Phase 3 | Pending |
| SRCH-02 | Phase 3 | Pending |
| SRCH-03 | Phase 3 | Pending |
| NOTE-01 | Phase 4 | Pending |
| NOTE-02 | Phase 4 | Pending |
| REFL-01 | Phase 4 | Pending |
| REFL-02 | Phase 4 | Pending |
| INFR-07 | Phase 4 | Pending |
| DETL-07 | Phase 5 | Pending |
| DETL-08 | Phase 5 | Pending |
| DETL-09 | Phase 5 | Pending |
| DETL-10 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 37 total
- Mapped to phases: 37
- Unmapped: 0 ✓

---
*Requirements defined: 2026-02-09*
*Last updated: 2026-02-09 after roadmap creation*
