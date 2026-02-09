# Phase 3: Couriers, Orders & Search

## Goal

Complete entity coverage with order pages plus unified global search. Courier support is deferred — no standalone courier entity exists in the backend (couriers are third-party Stuart API drivers, data embedded in order delivery details).

## Scope Adjustments

**LIST-03 (courier list) and DETL-03 (courier detail) are descoped from this phase.** The backend has no courier entity or admin endpoints for couriers. Courier data exists only within order `deliveryDetails` JSONB. The couriers sidebar page will remain as a "coming soon" placeholder.

**Effective requirements for this phase:** LIST-04, DETL-04, SRCH-01, SRCH-02, SRCH-03

## Backend Constraints

1. **No `GET /admin/orders` endpoint** — only per-vendor (`GET /admin/vendors/:id/orders`) and per-user (`GET /admin/users/:id/orders`)
2. **No courier entity** — courier data is embedded in order `deliveryDetails`
3. **No global search endpoint** — must aggregate `GET /admin/users?search=` and `GET /admin/vendors?name=` in parallel
4. **Order amounts are stored in pence** — format as GBP (divide by 100)

## Plans

| Plan | Wave | Description | Requirements |
|------|------|-------------|-------------|
| 03-01 | 1 | Order feature module (types, API, queries, list page) | LIST-04 |
| 03-02 | 2 | Order detail page with delivery/courier info | DETL-04 |
| 03-03 | 2 | Global search with cmdk command palette | SRCH-01, SRCH-02, SRCH-03 |
| 03-04 | 3 | Visual verification checkpoint | All |

## Wave Structure

- **Wave 1:** 03-01 (order list page — foundation for detail + search)
- **Wave 2:** 03-02 + 03-03 (order detail + search — independent, parallel)
- **Wave 3:** 03-04 (verification checkpoint)

## Success Criteria

1. Admin can view order list (scoped by vendor) and click through to full order detail
2. Order detail shows items, payment, delivery (with courier info if available), customer, retailer, address, pricing
3. Admin can search across users and retailers from a single search bar with grouped type-ahead results
4. Order ID format (ST-XXXXX) recognized in search for direct navigation
