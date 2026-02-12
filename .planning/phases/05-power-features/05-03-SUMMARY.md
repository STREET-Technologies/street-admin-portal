---
phase: 05-power-features
plan: 03
subsystem: detail-pages
tags: [timeline, activity, notes, shared-component]

dependency-graph:
  requires: [phase-04]
  provides: [activity-timeline-component, user-activity-tab, retailer-activity-tab]
  affects: []

tech-stack:
  added: []
  patterns: [shared-timeline-component, note-to-event-mapping, relative-timestamp-display]

key-files:
  created:
    - src/components/shared/ActivityTimeline.tsx
    - src/features/users/components/UserActivityTab.tsx
    - src/features/retailers/components/RetailerActivityTab.tsx
  modified:
    - src/features/users/components/UserDetailPage.tsx
    - src/features/retailers/components/RetailerDetailPage.tsx

decisions:
  - id: timeline-relative-time
    decision: "Custom relativeTime helper instead of Intl.RelativeTimeFormat for simpler compact output"
    rationale: "Produces concise strings like '2h ago', '3d ago' without complex unit selection logic"

metrics:
  duration: ~2 min
  completed: 2026-02-09
---

# Phase 5 Plan 3: Activity Timeline Summary

Chronological activity timeline on user and retailer detail pages using notes and account timestamps.

## What Was Done

### Task 1: Create ActivityTimeline component and TimelineEvent type
- **ActivityTimeline** shared component at `src/components/shared/ActivityTimeline.tsx` (220 lines)
- **TimelineEvent** exported type supporting `note`, `created`, `updated`, `status_change` event types
- Stripe-style vertical line layout with colored dots (blue/green/gray/amber)
- Event-type-specific icons (StickyNote, UserPlus, RefreshCw, ArrowRightLeft)
- Relative timestamp display via custom `relativeTime` helper
- Priority/metadata badges matching NotesPanel style
- Skeleton loading state (4 placeholder items)
- Empty state with History icon
- **Commit:** 5bcc10c

### Task 2: Create UserActivityTab and RetailerActivityTab, add to detail pages
- **UserActivityTab** fetches notes via `useNotesQuery("user", userId)`, maps to timeline events, adds created/updated account events
- **RetailerActivityTab** same pattern using `useNotesQuery("vendor", retailerId)` (backend vendor entity type)
- Note events include truncated content (200 chars), author name, and priority badge
- Updated events only shown when `updatedAt !== createdAt`
- All events sorted newest-first in useMemo
- Wired as last tab on both detail pages
  - User tabs: Overview, Orders, Addresses, Devices, Notes, **Activity**
  - Retailer tabs: Overview, Orders, Notes, **Activity**
- **Commit:** cf951a5

## Deviations from Plan

None -- plan executed exactly as written.

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| Custom relativeTime helper over Intl.RelativeTimeFormat | Produces compact "2h ago" style strings; simpler than selecting correct unit for Intl API |

## Verification

- [x] `npm run build` succeeds without errors
- [x] User detail page has Activity tab as last tab
- [x] Retailer detail page has Activity tab as last tab
- [x] Timeline shows notes + created/updated events sorted newest-first
- [x] Relative timestamps display correctly
- [x] Loading state shows skeleton timeline
- [x] Empty state shows when no events exist
- [x] Note events show priority badge and author
- [x] No TypeScript errors
- [x] ActivityTimeline is reusable across any entity type
