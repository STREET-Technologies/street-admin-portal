---
name: STREET Admin Portal
description: The operator's room — a quiet, fast, light-mode dashboard for the 2–3 person team running the STREET marketplace.
colors:
  bg: "#ffffff"
  fg: "#1a1c20"
  muted: "#f5f5f5"
  muted-fg: "#737373"
  border: "#e6e6e6"
  input: "#f2f2f2"
  primary: "#171717"
  primary-fg: "#ffffff"
  brand: "#c8ff00"
  brand-fg: "#141414"
  brand-dim: "#607906"
  ring: "#a0cc00"
  destructive: "#ef4444"
  sidebar-bg: "#fafafa"
  sidebar-border: "#e3e5ea"
  status-new-bg: "#c8ff00"
  status-new-fg: "#141414"
  status-pending-bg: "#fdf0d8"
  status-pending-fg: "#81440e"
  status-stuck-bg: "#ef4444"
  status-stuck-fg: "#ffffff"
  status-delivered-bg: "#f0f0f0"
  status-delivered-fg: "#737373"
  status-cancelled-bg: "#fbefef"
  status-cancelled-fg: "#a63f3f"
  chart-1: "#c8ff00"
  chart-2: "#2db391"
  chart-3: "#e69238"
  chart-4: "#9f6ed1"
  chart-5: "#dc4b7e"
typography:
  display:
    fontFamily: "Hanson, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.16em"
  headline:
    fontFamily: "Barlow, ui-sans-serif, system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.005em"
  title:
    fontFamily: "Barlow, ui-sans-serif, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "normal"
  body:
    fontFamily: "Barlow, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  caption:
    fontFamily: "Barlow, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "normal"
  label:
    fontFamily: "Barlow, ui-sans-serif, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.08em"
  pill:
    fontFamily: "Barlow, ui-sans-serif, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.04em"
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  xl: "12px"
  full: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  2xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-fg}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    typography: "{typography.body}"
    height: "36px"
  button-primary-hover:
    backgroundColor: "#2e2e2e"
    textColor: "{colors.primary-fg}"
  button-outline:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.fg}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    typography: "{typography.body}"
    height: "36px"
  button-outline-hover:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.fg}"
  input:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.fg}"
    rounded: "{rounded.md}"
    padding: "6px 12px"
    height: "36px"
    typography: "{typography.body}"
  card:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.fg}"
    rounded: "{rounded.md}"
    padding: "18px 22px"
  pill-new:
    backgroundColor: "{colors.status-new-bg}"
    textColor: "{colors.status-new-fg}"
    rounded: "{rounded.full}"
    padding: "3px 10px"
    typography: "{typography.pill}"
  pill-pending:
    backgroundColor: "{colors.status-pending-bg}"
    textColor: "{colors.status-pending-fg}"
    rounded: "{rounded.full}"
    padding: "3px 10px"
    typography: "{typography.pill}"
  pill-stuck:
    backgroundColor: "{colors.status-stuck-bg}"
    textColor: "{colors.status-stuck-fg}"
    rounded: "{rounded.full}"
    padding: "3px 10px"
    typography: "{typography.pill}"
  pill-delivered:
    backgroundColor: "{colors.status-delivered-bg}"
    textColor: "{colors.status-delivered-fg}"
    rounded: "{rounded.full}"
    padding: "3px 10px"
    typography: "{typography.pill}"
  pill-cancelled:
    backgroundColor: "{colors.status-cancelled-bg}"
    textColor: "{colors.status-cancelled-fg}"
    rounded: "{rounded.full}"
    padding: "3px 10px"
    typography: "{typography.pill}"
  sidebar-nav-item-active:
    backgroundColor: "#1a1c200d"
    textColor: "{colors.fg}"
    rounded: "{rounded.sm}"
    padding: "7px 10px"
    typography: "{typography.body}"
---

# Design System: STREET Admin Portal

## 1. Overview

**Creative North Star: "The Stagehand"**

This is the operator's room, not the storefront. The STREET marketplace brand is streetwear and skate-loud — uppercase Hanson, lime green, brutalist confidence — but the admin portal carries that brand the way a stagehand wears black: present, professional, out of the way. The team lives in this surface for six hours a day; brand expression here would be costume, not character.

The system is a single light-mode surface, near-white on white with a hand-tuned greyscale, and one signal color: lime `hsl(73 100% 50%)` (#c8ff00). Lime is reserved for active state, focus rings, the "New" status, and the sidebar's active-nav indicator — never for decoration, never for a default button, never as a gradient. Surfaces and chrome are quiet so the data can speak. Hierarchy is built from typography scale, weight, and whitespace, not color.

What this system explicitly rejects: generic SaaS admin templates with cream cards and gradient buttons; enterprise-heavy density that crams thirty columns into a viewport; consumer-app cheerfulness with illustrations and rounded everything; and brand cosplay where every page screams the marketplace's voice. References we admire and follow: Linear, Stripe Dashboard, Vercel.

**Key Characteristics:**
- One light theme, no toggle. Light surface only — no dark mode, no preferences for visual chrome.
- Lime is signal, not skin. Reserved color used on roughly ≤8% of any screen.
- Information density without enterprise punishment. Comfortable rows, deliberate whitespace.
- Speed of investigation over delight. The tool earns its place by making finding faster.
- Brand stamped, not shouted. Hanson appears only on the sidebar logo.

## 2. Colors

A neutral greyscale tinted neither warm nor cool, anchored by a single saturated signal color (lime). Status communication uses a small distinct palette — lime / amber / red / grey / muted-red — engineered for unambiguous scanning across a vertical list.

### Primary
- **Signal Lime** (#c8ff00, `hsl(73 100% 50%)`): the brand accent. Used on the active sidebar nav dot, the focus ring (3px), the "New" status pill, primary call-to-action accents (sparingly), and chart-1. Always pairs with `--brand-fg` (#141414) when used as a fill. Never used as foreground text on white.
- **Lime Dim** (#607906, `hsl(73 90% 25%)`): for lime-on-white text where lime fill would fail contrast (chart legends, in-line "new" mentions).

### Neutral (the working surface)
- **Paper** (#ffffff, `hsl(0 0% 100%)`): primary surface — page background, card fill.
- **Ash** (#fafafa, `hsl(0 0% 98%)`): sidebar background. One step quieter than Paper so the sidebar reads as a separate plane.
- **Mist** (#f5f5f5, `hsl(0 0% 96%)`): muted surface — secondary buttons hover, tab unselected, dense table headers.
- **Mist Border** (#e6e6e6, `hsl(0 0% 90%)`): every border in the system, table row dividers, card outlines.
- **Sidebar Border** (#e3e5ea, `hsl(220 13% 91%)`): one notch cooler than Mist Border — separates sidebar planes (logo divider, section dividers).
- **Graphite** (#737373, `hsl(0 0% 45%)`): muted text — labels, captions, table column headers, "Delivered" status text.
- **Ink** (#1a1c20, `hsl(220 9% 11%)`): body text and headings. NOT pure black.
- **Coal** (#171717, `hsl(0 0% 9%)`): the primary button fill. One notch darker than Ink so primary buttons feel pressed-into the page.

### Status (five distinct states, engineered for vertical scan distinctness)
- **New** — `bg: #c8ff00 / fg: #141414`. Lime fill, near-black text. The loudest signal in the system.
- **Pending** — `bg: #fdf0d8 / fg: #81440e`. Light amber tint with dark amber text. Mid-attention: waiting.
- **Stuck** — `bg: #ef4444 / fg: #ffffff`. Solid red, white text. Alarm — operator action required.
- **Delivered** — `bg: #f0f0f0 / fg: #737373`. Quiet grey. Done — peripheral, not competing for attention.
- **Cancelled** — `bg: #fbefef / fg: #a63f3f` with `text-decoration: line-through`. Soft red tint with strikethrough. Voided — deliberately deemphasised but unambiguous.

### Data Visualization
- **chart-1** (#c8ff00) — lime, primary series
- **chart-2** (#2db391) — teal
- **chart-3** (#e69238) — orange
- **chart-4** (#9f6ed1) — purple
- **chart-5** (#dc4b7e) — magenta

### Named Rules

**The Lime-Is-Signal Rule.** Lime is never decorative. It appears as: (1) the active sidebar dot, (2) the "New" status pill, (3) the 3px focus ring on inputs and buttons, (4) chart-1, and nowhere else by default. If a new use is being introduced, it has to clear the bar: *does the user need to notice this thing right now?* If not, choose Ink or Coal.

**The ≤8% Rule.** Across any single screen, lime should cover roughly 8% or less of pixel area at rest. If a screen is approaching saturation, the screen has too much going on, not too little lime.

**The No-Pure-Black Rule.** Use Ink (#1a1c20) for text and Coal (#171717) for primary fills. Never `#000`. Pure black on a pure-white admin surface produces a vibrating, fatiguing read on long sessions.

**The Status Hierarchy Rule.** Status color = urgency rank. From loudest to quietest: Stuck > New > Pending > Cancelled > Delivered. Never reassign a status to a color rank that conflicts with this order.

## 3. Typography

**Display Font:** Hanson (700, uppercase) — **logo only.**
**Body Font:** Barlow (loaded weights: 400, 500, 600, 700, 900).
**Numeric:** Barlow with `font-variant-numeric: tabular-nums` for any column of numbers (totals, IDs, counts, durations).

**Character:** Hanson is the brand's brutalist stamp — used exactly once per screen, in the corner. Barlow does every other typographic job: heading, body, label, button text, pill text. Sans-on-sans with no display-vs-body pairing keeps the chrome quiet so density and color carry the hierarchy.

### Hierarchy
- **Display** (Hanson, 700, 14px, letter-spacing 0.16em, uppercase): the sidebar logo, and nowhere else.
- **Headline** (Barlow, 700, 22px, line-height 1.15, letter-spacing -0.005em): page title (`<h1>`). One per route.
- **Title** (Barlow, 600, 16px, line-height 1.25): section heading, card heading, dialog title.
- **Body** (Barlow, 400/500, 13px, line-height 1.5): everything else. Max line length ~75ch in any prose context (audit notes, descriptions).
- **Caption** (Barlow, 400, 12px, line-height 1.4): metadata under a record, hint text under a form field.
- **Label** (Barlow, 600, 11px, letter-spacing 0.08–0.12em, UPPERCASE): table column headers, section labels in the sidebar (Operations / Network / System), eyebrow text.
- **Pill** (Barlow, 600, 11px, letter-spacing 0.04em, UPPERCASE): status badges, count chips. All pill text is uppercase — uniform text-shape across a status column is non-negotiable.

### Named Rules

**The Hanson-Once Rule.** Hanson appears exactly once per page — in the sidebar logo. Anywhere else is brand cosplay. The dead helper classes `.street-title` and `.street-body-title` from `src/index.css` should be deleted; they violate this rule.

**The Tabular-Nums Rule.** Every column of numbers gets `font-variant-numeric: tabular-nums`. Order totals, order IDs, counts, durations, timestamps. A misaligned digit in a scannable list is a usability bug.

**The All-Caps-Pills Rule.** Status pills are always uppercase, regardless of state. Hierarchy comes from fill color, not from letter case.

## 4. Elevation

**Mostly flat, occasionally lifted.** This is a single-plane workspace. Depth is conveyed by one-pixel borders and quiet greyscale shifts (Paper → Ash → Mist), not by drop shadows. Shadows appear only on raised surfaces (cards) and as focus indicators (the lime ring).

### Shadow Vocabulary
- **shadow-xs** (`box-shadow: 0 1px 2px rgba(0,0,0,0.04)`): inputs and outline buttons at rest. Almost invisible — a hint that the element is interactive.
- **shadow-sm** (`box-shadow: 0 1px 2px rgba(0,0,0,0.04)`): cards. A single quiet pixel of depth.
- **focus-ring** (`box-shadow: 0 0 0 3px hsl(73 100% 50% / 0.5)`): focus indicator. Lime, 3px, 50% opacity — visible from across the room without being violent.

### Named Rules

**The Flat-By-Default Rule.** Surfaces are flat at rest. Use Mist Border, not a shadow, to separate adjacent surfaces. If you find yourself reaching for a shadow to define a region, you actually want a border or a Mist/Ash background shift.

**The Lime-Ring Rule.** The focus indicator is always the lime ring at 3px, 50% opacity. Never use a generic blue browser default. Keyboard-driven users need to see the active element from across the desk.

## 5. Components

### Buttons
- **Shape:** 6px radius (`{rounded.md}`), 36px height (`h-9`), padding `8px 16px`.
- **Primary** (`button-primary`): Coal fill (#171717), white text. Hover: slight lift to #2e2e2e, 150ms ease-out.
- **Outline** (`button-outline`): Paper fill, 1px Mist Border, Ink text, faint `shadow-xs`. Hover: Mist background.
- **Ghost** (shadcn default `ghost`): no border, no fill at rest; Mist background on hover. Used in dense action menus, table-row context menus.
- **Destructive**: Destructive red fill (#ef4444), white text. Reserved for confirmed deletions — never the default action of a dialog.
- **Hover/Focus:** 150ms color transition on all variants. Focus ring (lime, 3px) always present, never replaced by browser default.
- **Sizes:** `xs` (24px h), `sm` (32px h), `default` (36px h), `lg` (40px h), plus square `icon-*` variants at matching heights.

### Inputs / Fields
- **Shape:** 6px radius (`{rounded.md}`), 36px height (`h-9`), padding `6px 12px`.
- **Style:** 1px Mist Border, Paper background, `shadow-xs` at rest.
- **Focus:** Border shifts to Lime, 3px Lime ring at 50% opacity.
- **Error (`aria-invalid`):** Border shifts to Destructive, ring shifts to Destructive at 20% opacity. Error message in Destructive text below the field, with an icon prefix (never color-only).
- **Disabled:** opacity 0.5, pointer-events off, cursor: not-allowed.

### Cards
- **Shape:** 6px radius (`{rounded.md}`) — **not** 12px. The shadcn `Card` default of `rounded-xl` is overridden in this system.
- **Background:** Paper.
- **Border:** 1px Mist Border.
- **Shadow:** `shadow-sm` (a single quiet pixel of depth).
- **Internal padding:** `18px 22px` for compact detail cards; `24px 28px` for dashboard tiles.
- **Header / Body / Footer:** separated by 1px Mist Border dividers, not by extra padding alone.

### Status Pills
- **Shape:** 999px radius (full pill), padding `3px 10px`.
- **Type:** 11px Barlow, 600 weight, UPPERCASE, letter-spacing 0.04em.
- **Variants:** see Colors → Status. All five share identical shape and type — only fill color varies.
- **Placement:** right-aligned in tables; inline-after the title in detail headers.

### Tables
- **Type:** 13px Barlow body for cells; 11px UPPERCASE Label for column headers.
- **Row:** 14px vertical padding, no zebra striping, 1px Mist Border bottom divider on every row.
- **Header:** 1px Mist Border bottom; no fill (sits flush on Paper).
- **Hover:** row background shifts to `hsl(0 0% 99%)` (a hint, not a slam).
- **Selected row** (`data-state="selected"`): Mist fill.
- **Numbers:** always `tabular-nums`. Money: right-aligned. IDs and counts: left-aligned with monospace tabular alignment.
- **Density:** comfortable, never dense. Reject the temptation to crunch row padding below 12px.

### Sidebar
- **Width:** 220–240px expanded, 48–56px collapsed (icon-only).
- **Background:** Ash (#fafafa).
- **Border:** Sidebar Border (#e3e5ea) on the right edge.
- **Logo:** Hanson 700, 14px, UPPERCASE, letter-spacing 0.16em. Padded `4px 10px 18px`, with a 1px Sidebar Border below.
- **Section labels** (Operations / Network / System): 11px Label, color `hsl(0 0% 22%)`, padding `8px 10px`. Each section after the first has a 1px Sidebar Border top divider + 14px margin-top + 20px padding-top.
- **Nav item:** 13px Body, 7px×10px padding, 4px radius. Hover: Mist background. Active: `hsl(220 9% 11% / 0.05)` fill, 500 weight, **and a 6px lime dot prepended via `::before`** — the active dot is the sidebar's signature.
- **Collapsed:** items become 32×32px square icons. Active still gets the lime indicator (left lime bar in this case, not a dot).

### Tabs (page-level filters)
- **Style:** text-only tabs with a 2px bottom border on the active tab.
- **Active:** Ink text, 500 weight, 2px Ink bottom border.
- **Inactive:** Graphite text, transparent border.
- **Counts:** trailing 11px Graphite count next to each tab label (`All 152`).

### Sidebar Active Indicator (signature)
The 6px lime dot prepended to the active sidebar nav item is the system's signature mark. It is the single most visible use of lime in any given session. Do not move it, recolor it, or replace it with an icon highlight. It is the answer to "where am I?"

## 6. Do's and Don'ts

### Do:
- **Do** use **lime** only for active state, focus ring, "New" status, and chart-1. Never for primary buttons, never for decoration, never as a gradient.
- **Do** keep total lime coverage at or under roughly 8% of any single screen at rest.
- **Do** use **6px radius** on buttons, inputs, and cards. Override shadcn's `Card` default of `rounded-xl` to match.
- **Do** use **`tabular-nums`** on every numeric column — totals, IDs, counts, durations.
- **Do** UPPERCASE every status pill, every label, every section heading in the sidebar. Uniform letter-shape per column = faster scanning.
- **Do** keep **Hanson** to the sidebar logo only.
- **Do** prefer **1px borders + greyscale shifts** (Paper → Ash → Mist) over shadows to separate regions.
- **Do** use the **3px lime focus ring** on every interactive element. Never the browser default.
- **Do** put the **active sidebar dot** at 6px solid lime. It is the signature mark of the system.

### Don't:
- **Don't** ship dark mode, a theme toggle, or any visual-chrome user preference. **One surface, one theme.**
- **Don't** use **Hanson outside the sidebar logo.** Delete the dead `.street-title` / `.street-body-title` helper classes — they are brand cosplay.
- **Don't** use `#000` or `#fff` literals. Always Ink/Coal/Paper from the token table.
- **Don't** look like a **generic SaaS admin template** — cream cards, gradient buttons, hero-metric tiles, pastel category icons. PRODUCT.md flagged this as an anti-reference for a reason.
- **Don't** look like an **enterprise-heavy admin** — thirty-column tables, no whitespace, every action equally weighted, modals on modals. Comfortable density only.
- **Don't** look like a **consumer-app cheerful** product — rounded-everything, illustrations, emojis as state indicators, friendly cartoon empty states. Wrong register for an ops tool.
- **Don't** go **brutalist-loud** — uppercase Hanson on every heading, oversized type, lime backgrounds, marketing-page energy on a workhorse tool.
- **Don't** use **gradient text** (`background-clip: text` over a gradient). Forbidden everywhere.
- **Don't** use **side-stripe borders** (`border-left > 1px` as a colored accent). Use a full 1px Mist border + fill tint if you need to mark a region.
- **Don't** use **identical card grids** — same-sized icon-heading-text cards repeated endlessly. PRODUCT.md's anti-reference.
- **Don't** animate **CSS layout properties** (width/height/padding/margin). Animate transform/opacity only. 300ms ceiling on any transition. No bounce, no elastic curves.
- **Don't** reach for a **modal** as the first thought. Try inline editing, drawers, or a row-expand first.
- **Don't** add a new **status pill variant** without verifying it's distinguishable from the existing five at a glance in a tall list.
