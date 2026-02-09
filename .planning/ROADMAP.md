# Roadmap: STREET Admin Portal Redesign

## Overview

Green-field rebuild of the STREET Admin Portal from an AI-generated (Lovable) prototype into a professional Stripe-style admin dashboard. Five phases take us from project scaffold through complete entity management to power features. Each phase builds on the previous, delivering working functionality at every step. All work happens on a new `redesign/admin-portal` branch.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [x] **Phase 1: Foundation** - Project scaffold, auth, layout shell, API client, infrastructure
- [x] **Phase 2: Users & Retailers** - User and retailer list + detail pages with data tables
- [ ] **Phase 3: Couriers, Orders & Search** - Courier/order pages plus unified search
- [ ] **Phase 4: Notes, Referrals & Settings** - Cross-cutting features that attach to entities
- [ ] **Phase 5: Power Features** - Cross-entity linking, quick actions, inline editing, timeline

## Phase Details

### Phase 1: Foundation
**Goal**: Working app shell with auth, sidebar navigation, routing, and infrastructure patterns
**Depends on**: Nothing (first phase)
**Requirements**: NAV-01, NAV-02, NAV-03, AUTH-01, AUTH-02, AUTH-03, AUTH-04, INFR-01, INFR-02, INFR-03, INFR-04, INFR-05, INFR-06
**Success Criteria** (what must be TRUE):
  1. Admin can log in via Google OAuth and see the sidebar layout
  2. Admin can navigate between sections via sidebar (pages route correctly, URLs are bookmarkable)
  3. Breadcrumbs show current location on all pages
  4. Admin can log out properly (no leftover session)
  5. Dark mode toggle works with OS preference detection
**Research**: Unlikely (covered by research/STACK.md and research/ARCHITECTURE.md)
**Plans**: TBD

### Phase 2: Users & Retailers
**Goal**: User and retailer list pages with data tables, plus full-page detail views with tabs
**Depends on**: Phase 1
**Requirements**: LIST-01, LIST-02, LIST-05, LIST-06, DETL-01, DETL-02, DETL-05, DETL-06
**Success Criteria** (what must be TRUE):
  1. Admin can view paginated user list with sortable columns and filter by status/date
  2. Admin can click a user to see full-page detail with tabs (Overview, Orders, Addresses, Devices, Notes)
  3. Admin can view paginated retailer list with sortable columns and filter by status/date
  4. Admin can click a retailer to see full-page detail with tabs (Overview, Orders, Notes)
  5. Status badges show consistent colors across all entities; IDs/emails are copyable with one click
**Research**: Unlikely (standard CRUD using Phase 1 patterns)
**Plans**: TBD

### Phase 3: Orders & Search
**Goal**: Order list + detail pages plus unified global search. Couriers descoped (no backend entity — Stuart third-party only).
**Depends on**: Phase 2
**Requirements**: LIST-04, DETL-04, SRCH-01, SRCH-02, SRCH-03 (LIST-03, DETL-03 descoped)
**Success Criteria** (what must be TRUE):
  1. Admin can view order list (scoped by vendor) and click through to full order detail
  2. Order detail shows items, payment, delivery/courier info, customer, retailer, address, pricing
  3. Admin can search across users and retailers from a single search bar with grouped type-ahead results
**Research**: Done during planning — no global orders endpoint, no courier entity
**Plans**: 03-01 (order list), 03-02 (order detail), 03-03 (global search), 03-04 (verification)

### Phase 4: Notes, Referrals & Settings
**Goal**: Cross-cutting features that work across all entity types
**Depends on**: Phase 3
**Requirements**: NOTE-01, NOTE-02, REFL-01, REFL-02, INFR-07
**Success Criteria** (what must be TRUE):
  1. Admin can create and view notes on any entity with priority level and author tracking
  2. Admin can manage referral codes (create, edit, deactivate) and configure referral settings
  3. Device info displays real data on user detail pages
**Research**: Unlikely (standard CRUD patterns)
**Plans**: TBD

### Phase 5: Power Features
**Goal**: Differentiator features that elevate the portal beyond basic CRUD
**Depends on**: Phase 4
**Requirements**: DETL-07, DETL-08, DETL-09, DETL-10
**Success Criteria** (what must be TRUE):
  1. All entity references on detail pages are clickable links to the referenced entity's detail page
  2. Admin can perform quick actions from entity detail pages (block user, change retailer status)
  3. Admin can inline-edit fields on detail pages (click field, type, press Enter)
  4. Each entity detail page shows a chronological activity timeline of events
**Research**: Unlikely (UI enhancement patterns using established components)
**Plans**: TBD

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 4/4 | Complete | 2026-02-09 |
| 2. Users & Retailers | 4/4 | Complete | 2026-02-09 |
| 3. Orders & Search | 0/4 | Planned | - |
| 4. Notes, Referrals & Settings | 0/TBD | Not started | - |
| 5. Power Features | 0/TBD | Not started | - |
