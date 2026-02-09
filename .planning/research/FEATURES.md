# Feature Research

**Domain:** Internal admin dashboard / back-office support tool
**Researched:** 2026-02-09
**Confidence:** High - based on analysis of Stripe Dashboard, Shopify Admin, Linear, marketplace admin platforms, and internal tooling best practices. Recommendations are specific to a 2-3 person team running marketplace customer support.

---

## Current State (STREET Admin Portal)

What already exists:
- Entity search (users, retailers, couriers) with type selector
- User/retailer/courier detail cards with profile info
- Tabbed detail view (Overview, Orders, Referrals, Notes, Account)
- Order viewing per user
- Admin notes with priority levels and author tracking
- Referral code management (create, edit, deactivate)
- Settings panel with referral configuration
- Login/auth
- Account associations (devices, addresses)

What's missing vs. professional admin tools:
- No sidebar navigation (search-only entry point)
- No global/unified search (must select entity type first)
- No keyboard shortcuts
- No activity/audit log
- No order-level detail view (orders are user-scoped only)
- No direct order search
- No bulk actions
- No quick actions from search results
- No breadcrumb navigation
- No dashboard/home overview with metrics
- No data export

---

## Table Stakes Features

These are features that every professional admin dashboard has. Users (even internal ones) will feel friction without them. Prioritized by impact on support resolution speed.

### 1. Global Search (Cmd+K / Unified Search Bar)
**What:** Single search bar that searches across ALL entity types simultaneously -- users, retailers, couriers, orders. Type-ahead results grouped by category.
**Why table stakes:** Stripe's search finds customers, invoices, payouts, and products from one bar. Support agents shouldn't have to know what entity type they're looking for before searching. When a customer calls about an order, the agent might have a name, email, order ID, or phone number -- any of these should work immediately.
**Stripe pattern:** Top results appear instantly, grouped by resource type. Supports email, last-4-digits, metadata, dates. Press Enter for full results with sortable columns.
**Implementation note:** Should support searching by name, email, phone, order ID, and referral code from a single input.

### 2. Sidebar Navigation
**What:** Persistent left sidebar with sections: Home/Dashboard, Users, Retailers, Couriers, Orders, Settings. Collapsible for more screen space.
**Why table stakes:** Every admin tool (Stripe, Shopify, Linear, Retool) uses sidebar navigation. It provides constant orientation ("where am I?"), quick switching between sections, and a mental model of the system's scope. Without it, users are stranded on search results with no way to browse or navigate laterally.
**Key detail:** Pin frequently-used pages. Show active section highlighting. Keep it minimal -- 6-8 top-level items max.

### 3. Entity Detail Pages (Not Just Cards)
**What:** Full-page detail views for users, retailers, couriers, and orders. Each shows all related data with tabs/sections. Includes breadcrumb back-navigation.
**Why table stakes:** Stripe's customer detail page shows subscriptions, payments, payment methods, invoices, and quotes all on one page. This "Customer 360" view -- seeing everything about an entity in one place -- is the single biggest productivity feature for support agents. Currently the portal shows detail in cards, but needs full pages with URL routing so agents can bookmark, share links, and use browser back/forward.

### 4. Order Detail View
**What:** Dedicated order detail page showing: order items, payment status, delivery status, customer info, retailer info, courier info, timeline of status changes, delivery details (Stuart job), and admin notes.
**Why table stakes:** Orders are the core object in a marketplace. Every support query involves an order. Agents need to see the full picture without jumping between user profiles.

### 5. Data Tables with Sort/Filter/Pagination
**What:** Entity list views (all users, all retailers, all orders) with sortable columns, filterable status/date fields, and pagination.
**Why table stakes:** Agents need to browse, not just search. "Show me all pending orders from today" or "Show me all retailers in onboarding status" are daily workflows. Stripe and Shopify both provide filterable, sortable tables as the primary list view.

### 6. Activity Timeline / Audit Log
**What:** Per-entity chronological timeline showing: orders placed, status changes, admin notes added, profile edits, referral code usage, account status changes. Shows who did what and when.
**Why table stakes:** When handling a support issue, the first question is always "what happened?" An activity timeline lets agents reconstruct the sequence of events without digging through multiple tabs. Stripe shows a timeline on every customer and payment page.

### 7. Admin Notes (Already Exists -- Enhance)
**What:** Already implemented. Enhance with: note pinning, note categories/tags, @mentions between admins, search within notes.
**Why table stakes:** Notes are the institutional memory of support. The current implementation is solid but missing searchability (can I find all users where I left a note about X?).

### 8. Toast/Notification Feedback
**What:** Clear success/error feedback for every action (save, edit, deactivate, etc.).
**Why table stakes:** Already partially implemented with sonner. Ensure every mutation surfaces clear feedback.

### 9. Responsive Status Indicators
**What:** Consistent, color-coded status badges across all entities and orders. Use semantic colors: green=active/delivered, yellow=pending, red=blocked/cancelled, grey=inactive.
**Why table stakes:** Visual scanning speed. An agent glancing at a list should instantly see problem states.

---

## Differentiators

Features that go beyond baseline and would make the STREET admin portal notably better than a generic CRUD admin panel. These save significant daily time for a small team.

### 1. Command Palette (Cmd+K Actions)
**What:** Beyond search, the Cmd+K palette allows executing actions: "Create referral code", "Go to settings", "Search orders from today". Combines navigation + search + actions in one interface.
**Why differentiator:** Linear popularized this pattern. For power users who use the tool daily, keyboard-driven workflows are 2-5x faster than clicking through menus. A 2-3 person team will learn keyboard shortcuts quickly.
**Implementation:** Use the existing `command.tsx` shadcn component. Group results: Navigation, Recent, Entities, Actions.

### 2. Cross-Entity Linking
**What:** Click a retailer name on an order to jump to that retailer's detail page. Click a user on a retailer's order list to jump to that user. Every entity reference is a clickable link.
**Why differentiator:** This is what makes Stripe feel like a connected system vs. isolated pages. Support agents constantly need to trace connections: user -> order -> retailer -> courier. One-click navigation between related entities dramatically speeds up investigation.

### 3. Quick Actions on Detail Pages
**What:** Contextual action buttons at the top of detail pages. For users: "Block User", "Reset Password", "Send Notification". For retailers: "Change Status", "Update Commission". For orders: "Refund", "Cancel", "Re-assign Courier".
**Why differentiator:** Reduces the steps from "identify the problem" to "take action" from many clicks to one. Stripe's "Actions" dropdown on every detail page is a key productivity feature.

### 4. Keyboard Shortcuts
**What:** Global shortcuts: Cmd+K (search), G then U (go to users), G then R (go to retailers), G then O (go to orders), Esc (close modal/go back), ? (show shortcuts help).
**Why differentiator:** Daily tool for 2-3 people = they'll memorize shortcuts fast. Stripe and Linear both invest heavily in keyboard navigation. Even basic shortcuts (Cmd+K, Esc, Enter to confirm) make a meaningful difference.

### 5. Saved Filters / Quick Views
**What:** Pre-configured filter combinations that agents use daily. Examples: "Orders from today", "Pending retailers", "Blocked users", "High-priority notes". Saved as sidebar shortcuts or dropdown presets.
**Why differentiator:** Eliminates repetitive filter setup. A small team will have 5-10 views they check daily. Save them once, access with one click.

### 6. Inline Editing
**What:** Click-to-edit fields on detail pages without opening a separate form. Edit user email, retailer commission rate, or order status directly in the detail view.
**Why differentiator:** Reduces the edit workflow from "click edit button -> fill form -> save" to "click field -> type -> press Enter". Stripe uses this pattern extensively.

### 7. Copy-to-Clipboard on IDs and Emails
**What:** One-click copy buttons next to IDs, emails, phone numbers, order IDs, referral codes. Small icon that confirms "Copied!" on click.
**Why differentiator:** Support agents constantly copy and paste identifiers into other systems (Slack, email, Stuart dashboard, Shopify). Tiny feature, used dozens of times daily.

### 8. Dark Mode
**What:** Theme toggle between light and dark modes, respecting OS preference by default, with manual override persisted to localStorage.
**Why differentiator:** Already have the shadcn infrastructure for it. People who stare at admin tools all day appreciate reduced eye strain. Simple to implement with CSS variables.

---

## Anti-Features

Features that are commonly requested or seem like good ideas but would be problematic for this specific context (2-3 person team, internal tool, marketplace support).

### 1. Real-Time Analytics Dashboard / Charts on Homepage
**Why anti-feature:** For 2-3 support agents, a homepage covered in charts (revenue trends, order volume graphs, conversion funnels) is dashboard theater. These metrics should live in a dedicated analytics tool (Metabase, Looker, even a spreadsheet), not in a support tool. Admin portal home page should show actionable items: recent orders needing attention, flagged users, pending retailer onboarding -- not vanity metrics.
**Exception:** Simple counts (total users, total orders today, pending issues) are fine as quick context. Just don't build a BI dashboard.

### 2. Role-Based Access Control (RBAC)
**Why anti-feature:** With 2-3 users who all need full access, building RBAC is engineering overhead with zero benefit. Everyone sees everything. If the team grows past 5-6 people, revisit. For now, simple auth (login/logout) is sufficient.

### 3. Bulk Actions / Mass Operations
**Why anti-feature at MVP:** Bulk "block 50 users" or "update 100 retailer commissions" operations are dangerous in a support tool and rarely needed with a small marketplace. Individual actions with confirmation dialogs are safer and appropriate for the current scale. Add bulk operations only when there's a proven need.

### 4. Custom Dashboard / Widget Configurability
**Why anti-feature:** Building a drag-and-drop widget system for 2-3 users is massive over-engineering. Just design the right default layout. If someone needs a different view, change the code directly -- it's faster than building a configurator.

### 5. In-App Chat / Messaging System
**Why anti-feature:** Support communication should happen in Slack, email, or a dedicated helpdesk tool. Building messaging into the admin portal duplicates existing tools and fragments conversation history.

### 6. Automated Workflows / Rule Engine
**Why anti-feature:** "If order is pending for 30 minutes, auto-notify retailer" type automation belongs in the backend, not in the admin UI. The admin portal should be a tool for humans to take actions, not an automation platform.

### 7. Notification Center / Bell Icon
**Why anti-feature:** For 2-3 users, in-app notifications add complexity without value. Important alerts should go to Slack. The admin portal is a tool you go to when you need it, not a notification hub.

### 8. Data Export / CSV Download (At Scale)
**Why anti-feature at MVP:** Building export for every table sounds useful but is rarely used in a 2-3 person support workflow. If needed occasionally, query the database directly. Add export only when there's a demonstrated need (e.g., monthly reporting requirement).

---

## Feature Dependencies

```
Sidebar Navigation
  |
  +-- Entity List Pages (Users, Retailers, Couriers, Orders)
  |     |
  |     +-- Data Tables (sort, filter, paginate)
  |     |     |
  |     |     +-- Saved Filters / Quick Views
  |     |
  |     +-- Entity Detail Pages (full page, URL-routed)
  |           |
  |           +-- Activity Timeline
  |           +-- Cross-Entity Linking
  |           +-- Quick Actions
  |           +-- Inline Editing
  |           +-- Copy-to-Clipboard
  |
  +-- Global Search / Cmd+K
  |     |
  |     +-- Command Palette (actions beyond search)
  |
  +-- Home / Dashboard (simple actionable overview)

URL Routing (React Router)
  |
  +-- All of the above depend on proper routing
  +-- Breadcrumb Navigation
  +-- Browser back/forward support
  +-- Bookmarkable pages

Keyboard Shortcuts
  |
  +-- Global shortcut registration
  +-- Cmd+K search
  +-- Navigation shortcuts (G+U, G+R, etc.)
  +-- Shortcut help overlay (?)
```

---

## MVP Definition

### Launch With (Phase 1 -- Core Redesign)

These features transform the portal from "search and view" to "navigate and act". They address the biggest daily friction points.

1. **URL routing with React Router** -- Foundation for everything else. Routes: `/users`, `/users/:id`, `/retailers`, `/retailers/:id`, `/couriers`, `/couriers/:id`, `/orders`, `/orders/:id`, `/settings`.
2. **Sidebar navigation** -- Persistent left nav with sections. Collapsible.
3. **Entity list pages** -- Table views for users, retailers, couriers, orders with sort and filter.
4. **Entity detail pages** -- Full-page views replacing the current card layout. Preserve existing tab structure (Overview, Orders, Notes, etc.).
5. **Global search** -- Unified search bar in the header that searches across all entity types. Replace the current type-selector + search pattern.
6. **Order detail page** -- Standalone order view with all related data.
7. **Breadcrumb navigation** -- Already have the shadcn component.
8. **Status badges** -- Consistent, semantic status indicators everywhere.
9. **Copy-to-clipboard** -- On all IDs, emails, phone numbers.

**Estimated scope:** Medium. Primarily restructuring existing functionality into proper pages with routing. Most of the data-fetching and display logic already exists.

### Add After Launch (Phase 2 -- Power Features)

These build on the Phase 1 foundation and add significant speed improvements for daily use.

1. **Cmd+K command palette** -- Using existing shadcn command component. Search + navigation + actions.
2. **Keyboard shortcuts** -- Cmd+K, navigation shortcuts, Esc, shortcut help.
3. **Cross-entity linking** -- Make all entity references clickable links.
4. **Activity timeline** -- Chronological event log on detail pages.
5. **Quick actions** -- Contextual action buttons on detail pages.
6. **Inline editing** -- Click-to-edit on detail page fields.
7. **Saved filters** -- Pre-configured filter shortcuts in sidebar.
8. **Enhanced notes** -- Search within notes, pin notes, note categories.

**Estimated scope:** Medium. Each feature is independent and can be added incrementally.

### Future (Phase 3 -- When There's a Proven Need)

Only build these when there's clear demand or the team/marketplace has grown.

1. **Dark mode** -- Theme toggle with OS preference detection.
2. **Home dashboard** -- Simple actionable overview (today's orders, pending items, recent activity).
3. **Data export** -- CSV export on list views.
4. **Audit log** -- Who changed what and when, system-wide.
5. **Bulk actions** -- Multi-select and batch operations on list views.
6. **Advanced search operators** -- Filter syntax (status:active, created:today, amount:>50).

---

## Feature Prioritization Matrix

| Feature | Impact on Support Speed | Implementation Effort | Priority |
|---------|------------------------|----------------------|----------|
| URL routing | High (enables everything) | Medium | P0 |
| Sidebar navigation | High (orientation + navigation) | Low | P0 |
| Entity list pages with tables | High (browse + filter) | Medium | P0 |
| Entity detail pages (full page) | High (360 view) | Medium (restructure existing) | P0 |
| Global unified search | High (find anything fast) | Medium | P0 |
| Order detail page | High (core support object) | Medium | P0 |
| Breadcrumbs | Medium (orientation) | Low | P0 |
| Copy-to-clipboard | Medium (dozens of daily uses) | Low | P0 |
| Status badges (consistent) | Medium (visual scanning) | Low | P0 |
| Cmd+K command palette | High (power user speed) | Medium | P1 |
| Keyboard shortcuts | Medium-High (daily efficiency) | Low-Medium | P1 |
| Cross-entity linking | High (trace connections) | Low | P1 |
| Quick actions | Medium (reduce clicks) | Medium | P1 |
| Inline editing | Medium (reduce clicks) | Medium | P1 |
| Activity timeline | Medium (reconstruct events) | Medium-High | P1 |
| Saved filters | Medium (eliminate repetition) | Low | P1 |
| Enhanced notes | Low-Medium (incremental) | Low | P1 |
| Dark mode | Low (nice to have) | Low | P2 |
| Home dashboard | Low-Medium (orientation) | Medium | P2 |
| Data export | Low (occasional need) | Low | P2 |
| Audit log | Low-Medium (accountability) | Medium | P2 |
| Bulk actions | Low (small scale) | Medium | P2 |
| Advanced search operators | Low (power feature) | Medium | P2 |

---

## Competitor Feature Analysis

### Stripe Dashboard

**Navigation:** Left sidebar with collapsible sections (Home, Balances, Transactions, Customers, Product Catalog, plus product-specific sections). Pinned pages and recent pages in sidebar.

**Search:** Global search bar at top. Searches across customers, invoices, payouts, products, connected accounts. 24 filter operators (amount:, email:, status:, created:, metadata:, etc.). Instant results grouped by type. Press Enter for full sortable results.

**Detail pages:** Full-page views with breadcrumbs. Customer pages show subscriptions, payments, payment methods, invoices, quotes. Timeline of events. "Actions" dropdown for quick operations. Inline metadata editing.

**UX patterns:** Keyboard shortcut `?` for help. Consistent status badges. Copy-to-clipboard on all IDs. Clean whitespace, progressive disclosure. Light and clean visual design. <100ms render target.

**Relevance to STREET:** High. Stripe is the gold standard for admin dashboards. The search, detail page, and cross-linking patterns are directly applicable. The key difference: Stripe is a product for external users (thousands of businesses); STREET is internal for 2-3 people. So skip the customization/configuration features and keep the navigation and detail patterns.

### Shopify Admin

**Navigation:** Left sidebar with: Home, Orders, Products, Customers, Content, Analytics, Marketing, Discounts, Online Store, Settings. Collapsible with search.

**Search:** Global search bar. Searches products, orders, customers, collections, discounts, pages.

**Detail pages:** Order detail is comprehensive: items, payment, fulfillment, shipping, customer info, timeline, tags, notes. Customer detail shows order history, contact info, tags, notes, timeline.

**UX patterns:** Real-time analytics (Live View). Bulk actions on list pages (select multiple, apply action). Extensive filter system on order and product lists. Timeline views on orders showing fulfillment steps.

**Relevance to STREET:** High for order management patterns. Shopify's order detail page (items + payment + fulfillment + timeline) is the template for STREET's order detail. Their customer notes and tags system is relevant. The bulk actions and analytics are less relevant at STREET's scale.

### Linear

**Navigation:** Sidebar with workspace sections, team views, project views, cycles. Very keyboard-driven.

**Search:** Cmd+K opens a combined search + command palette. Find issues, navigate to views, execute actions, all from one interface. Real-time filtering.

**UX patterns:** Speed is the core value -- every interaction feels instant. Keyboard shortcuts for everything. Minimal, focused design. No visual clutter. Status indicators are small, consistent, and color-coded. Dark mode as default. Flexible filtering with saved views.

**Relevance to STREET:** Medium-high for UX philosophy. Linear proves that internal tools can feel premium without being complex. The Cmd+K pattern and keyboard-first approach are directly applicable. The speed-first philosophy (instant page loads, no loading spinners for navigating) should be a design goal.

### Retool / Appsmith (Internal Tool Builders)

**Common features:** Table views with sort/filter/search. Detail panels (often slide-out drawers). Form builders for editing. SQL/API integrations. Role-based access.

**Relevance to STREET:** Low-medium. These are generic tool builders. STREET's admin portal should feel more intentional and tailored than a Retool app. The lesson here is about what NOT to do: generic CRUD interfaces feel clunky. Build opinionated views optimized for support workflows, not generic data grids.

### Key Takeaways Across Competitors

| Pattern | Stripe | Shopify | Linear | Verdict for STREET |
|---------|--------|---------|--------|--------------------|
| Sidebar nav | Yes | Yes | Yes | Must have |
| Global search | Yes | Yes | Yes (Cmd+K) | Must have |
| Detail pages (full page) | Yes | Yes | Yes | Must have |
| Breadcrumbs | Yes | Limited | No | Have -- easy win |
| Keyboard shortcuts | Some | Few | Extensive | Phase 2 |
| Command palette | No (just search) | No | Yes | Phase 2 |
| Activity timeline | Yes | Yes | Yes | Phase 2 |
| Inline editing | Yes | Limited | Yes | Phase 2 |
| Bulk actions | Limited | Yes | Yes | Phase 3 (skip for now) |
| Dark mode | No | No | Yes (default) | Phase 3 |
| Export | Yes | Yes | Limited | Phase 3 |
| Custom dashboards | Limited | Limited | Yes (saved views) | Anti-feature |

---

## Design Principles for STREET Admin Portal

Derived from research, tailored to the specific context of 2-3 internal support agents on a marketplace platform.

1. **Search is the primary entry point.** Most support interactions start with "a customer just called about X." The path from opening the portal to finding the relevant entity should be under 3 seconds.

2. **Entity detail pages are the primary workspace.** Once an agent finds the entity, they spend most of their time on the detail page reading context, checking status, and taking actions. Optimize detail pages for information density without clutter.

3. **Cross-entity linking is the secret weapon.** A marketplace has inherent relationships: users place orders at retailers, delivered by couriers, using referral codes. Making these connections one-click navigable turns the portal from a collection of pages into a connected system.

4. **Speed over features.** Linear's lesson: a fast tool with fewer features beats a slow tool with many features. Optimize for instant page loads, fast search, and snappy interactions. No loading spinners for page navigation.

5. **Opinionated over configurable.** With 2-3 users, design the right default layout once. Don't build configuration UI. If the layout needs to change, change the code.

6. **Actions close to context.** The "Actions" button should be on the detail page, not buried in a menu or on a separate page. When an agent sees a problem, the fix should be one click away.

7. **Consistency reduces cognitive load.** Same status colors, same layout patterns, same interaction patterns across users, retailers, couriers, and orders. Learn one page, know them all.

---

## Sources

### Stripe Dashboard
- [Stripe Dashboard Basics](https://docs.stripe.com/dashboard/basics)
- [Stripe Dashboard Search](https://docs.stripe.com/dashboard/search)
- [Stripe Apps Design Patterns](https://docs.stripe.com/stripe-apps/patterns)
- [Stripe Apps UI Components](https://docs.stripe.com/stripe-apps/components)
- [Stripe Apps Design Guide](https://docs.stripe.com/stripe-apps/design)

### Shopify Admin
- [Shopify Admin Help Center](https://help.shopify.com/en/manual/shopify-admin)
- [Complete Guide to Shopify Admin Dashboard (2025)](https://www.eesel.ai/blog/shopify-admin)
- [Shopify Admin Dashboard Basics for Developers](https://shopifyui.com/shopify-admin-dashboard-basic-for-developer/)

### Linear
- [How We Redesigned the Linear UI](https://linear.app/now/how-we-redesigned-the-linear-ui)
- [Linear Dashboards Best Practices](https://linear.app/now/dashboards-best-practices)
- [Linear App Case Study: How to Build a $400M Issue Tracker](https://www.eleken.co/blog-posts/linear-app-case-study)
- [Linear Design: The SaaS Design Trend](https://blog.logrocket.com/ux-design/linear-design/)

### Dashboard UX and Design Patterns
- [Dashboard UI Design Principles & Best Practices Guide 2026](https://www.designstudiouiux.com/blog/dashboard-ui-design-guide/)
- [Dashboard UX Design: Best Practices & Examples](https://www.lazarev.agency/articles/dashboard-ux-design)
- [Dashboard Design UX Patterns Best Practices](https://www.pencilandpaper.io/articles/ux-pattern-analysis-data-dashboards)
- [5 Popular Dashboard UIs: What Works](https://blog.logrocket.com/ux-design/dashboard-ui-best-practices-examples/)
- [Effective Dashboard Design Principles for 2025 (UXPin)](https://www.uxpin.com/studio/blog/dashboard-design-principles/)

### Command Palette UX
- [Command Palette UX Patterns](https://medium.com/design-bootcamp/command-palette-ux-patterns-1-d6b6e68f30c1)
- [Command Palette UI Design Best Practices (Mobbin)](https://mobbin.com/glossary/command-palette)
- [Designing Command Palettes](https://solomon.io/designing-command-palettes/)

### Internal Tools Design
- [Internal Tools UX Design Best Practices: 12 Principles](https://www.dronahq.com/internal-tools-ux/)
- [7 Principles: How to Build Better Internal Tools](https://uibakery.io/blog/7-principles-to-build-better-internal-tools)
- [Design Principles for Admin Interfaces (UK Government)](https://designnotes.blog.gov.uk/2015/09/25/design-principles-for-admin-interfaces/)
- [Tips for Designing Internal Tools](https://medium.com/@a_kill_/tips-for-designing-internal-tools-c0500fcb9277)
- [7 Essential UX Design Principles for Internal Tools](https://developerux.com/2025/02/01/7-essential-ux-design-principles-for-internal-tools/)
- [Admin Dashboard UI/UX Best Practices for 2025](https://medium.com/@CarlosSmith24/admin-dashboard-ui-ux-best-practices-for-2025-8bdc6090c57d)
- [Admin Dashboard: Ultimate Guide (2026)](https://www.weweb.io/blog/admin-dashboard-ultimate-guide-templates-examples)

### Customer Support Tools
- [Customer Service Dashboard Metrics & Benefits](https://hiverhq.com/blog/customer-service-dashboard)
- [Customer Service Dashboard Examples (Supportman)](https://supportman.io/articles/customer-service-dashboard-examples/)
- [How to Build an Effective Customer Service Dashboard (Mailchimp)](https://mailchimp.com/resources/customer-service-dashboard/)
- [Customer 360 Unified View](https://medium.com/@systems_80881/what-is-customer-360-unified-analytics-single-view-support-2c1cd5be6e80)

### Marketplace Admin
- [Multi Vendor eCommerce Marketplace Admin Features](https://www.mobicommerce.net/marketplace-admin-features/)
- [Key Features of Seller Panel for Multi-Vendor Marketplace](https://wareiq.com/resources/blogs/key-features-of-seller-panel-for-multi-vendor-marketplace/)

### Anti-Patterns
- [Seven Anti-Patterns for Analytics Dashboards](https://kevingee.biz/?p=144)
- [How to Build Better Internal Tools (Department of Product)](https://www.departmentofproduct.com/blog/how-to-build-better-internal-tools/)
