# Product

## Register

product

## Users

A 2-3 person internal support team (Gunnar, Ali, Syuzana) operating the STREET marketplace. They live in this portal 6+ hours a day. Roughly **75% of sessions are reactive support** — a customer or retailer hits a problem and the team pulls up the order, user, courier, or retailer record to investigate and resolve. The remaining **25% is proactive monitoring and configuration** — watching stuck deliveries, approving retailers, managing referral codes, adjusting platform settings.

They are power users: comfortable with dense tables, keyboard shortcuts, raw IDs. They are not customers and don't need onboarding, marketing copy, or hand-holding. They need to find the right record fast and act on it.

## Product Purpose

The internal control plane for the STREET marketplace. It exists so a small support team can investigate any order, user, retailer, or courier without paging engineering, and can resolve operational issues (stuck deliveries, referral problems, retailer status) directly through UI rather than database queries.

Success looks like: support requests resolved in under 5 minutes, no engineering escalations for routine ops work, and the team confident the portal reflects production truth.

## Brand Personality

**Quiet, fast, confident.** This is the operator's room, not the storefront. The STREET marketplace brand has streetwear/skate energy — uppercase Hanson, lime green, brutalist confidence — but the admin portal carries that brand the way a stagehand wears black: present, professional, out of the way.

Three-word personality: **calm, decisive, branded-but-discreet.**

The Hanson font is stamped on the sidebar logo and nowhere else. Lime is reserved for status signal (active, success, critical-action) and never used decoratively. Everything else is Barlow, neutral surface, focused work.

References we admire for this register: **Linear, Stripe Dashboard, Vercel.** Operator tools that respect their users' time.

## Anti-references

This should explicitly NOT look like:

- **Generic SaaS admin templates.** Cream-tinted cards on white, gradient buttons, hero-metric tiles ("12,847 ↑ 12%"), pastel category icons. The Bootstrap-admin / "AI built this" aesthetic.
- **Enterprise heavy.** SAP/Salesforce-density tables with 30 columns, no whitespace, every action equally weighted, modals on modals. Powerful but punishing.
- **Consumer-app cheerful.** Rounded everything, illustrations, emojis as state indicators, friendly empty states with cartoons. Mailchimp/Intercom warmth is wrong for an internal ops tool.
- **Brutalist-loud / brand cosplay.** Uppercase Hanson on every heading, oversized type, lime backgrounds, marketing-page energy bleeding into a workhorse tool. Exhausting for daily use.

## Design Principles

1. **Speed of investigation over delight.** Most sessions start with "find this order/user fast." Search, filters, and direct-link URLs come before animations or visual flourish. If a feature slows the find-and-act loop, it's wrong.

2. **Quiet by default, lime for signal.** The lime brand accent is reserved — active states, success confirmations, critical actions, status indicators. Never decorative, never a default button background, never a gradient. Lime in the periphery means "something here matters."

3. **Information density without enterprise punishment.** Comfortable row heights, deliberate whitespace between sections, decisive type hierarchy. Dense where density helps (tables, detail views); breathing room where scanning matters (page headers, navigation). Reject both crammed-and-grey and airy-and-empty.

4. **One surface, one theme.** Light mode only. No theme switcher, no user preferences for visual chrome, no dark mode. A single well-tuned surface beats two half-tuned ones for a 3-person team. Revisit only if the team explicitly asks.

5. **Brand stamped, not shouted.** Hanson is locked to the sidebar logo. Barlow handles every other type role. Lime is a signal color, not a brand banner. The portal is recognisably STREET by association and by the logo in the corner — not because every page screams it.

## Accessibility & Inclusion

**WCAG 2.1 AA, no exceptions.**

- Body text contrast 4.5:1, large text 3:1.
- All interactive flows keyboard-navigable; focus rings always visible (the lime ring token is already wired).
- The lime accent (`hsl(73 100% 50%)`) must always pair with near-black foreground (`hsl(0 0% 8%)`) when used as a fill — the combination clears AA. Never use lime as a foreground color on white.
- Form errors communicated by color + text + icon, never color alone.
- Reduced motion is not a current requirement, but no animations should exceed 300ms or use bounce/elastic curves, so the bar is low even without an explicit `prefers-reduced-motion` pass.
