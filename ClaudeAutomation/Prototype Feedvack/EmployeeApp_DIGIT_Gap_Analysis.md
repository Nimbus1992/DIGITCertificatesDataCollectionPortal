# Employee App — DIGIT Design Principles Gap Analysis

---

## Executive Summary

The Employee App demonstrates a solid foundation: a consistent CSS custom-property token system, semantic colour roles for status indicators, good use of Radix-backed accessible primitives (Dialog, Tabs, DropdownMenu), and meaningful empty/loading states throughout. However, the app has significant gaps in three areas that carry the highest risk. First, no typographic scale is defined — all text sizing is done with ad-hoc Tailwind arbitrary values (e.g. `text-[10px]`, `text-[11px]`, `text-4xl`), making hierarchy inconsistent and unmaintainable. Second, the fixed two-column layout (`grid-cols-[220px_1fr]`) in the authenticated shell never collapses on mobile or tablet, meaning the sidebar navigation is inaccessible at small screen sizes and horizontal overflow is guaranteed below ~600px. Third, multiple components communicate status exclusively through colour — the `SlaChip`, `DocStatusPill`, and `FeeCard` badge omit the required icon for colour-blind and low-vision users. These three areas should be treated as the highest priority remediation targets.

---

## Audit Scope

The following files were reviewed in full:

| File | Description |
|------|-------------|
| `src/styles.css` | Global theme, CSS custom properties, colour tokens |
| `src/routes/__root.tsx` | Root shell, toast configuration, font loading |
| `src/routes/login.tsx` | Login page, form structure |
| `src/routes/_authenticated/route.tsx` | Authenticated layout shell (header, sidebar, nav) |
| `src/routes/_authenticated/dashboard.tsx` | Dashboard page |
| `src/routes/_authenticated/inbox.index.tsx` | Inbox list page |
| `src/routes/_authenticated/inbox.$appId.tsx` | Application detail and action page |
| `src/routes/_authenticated/approvals.tsx` | Approvals queue page |
| `src/routes/_authenticated/reports.tsx` | Reports and analytics page |
| `src/components/op/SlaBadge.tsx` | SLA status badge component |
| `src/components/op/StageDot.tsx` | Stage status pill component |
| `src/components/reports/KpiCard.tsx` | KPI metric card component |
| `src/components/reports/tabs/ExecutiveSummary.tsx` | Report chart tab |
| `src/components/ui/button.tsx` | Button primitive |
| `src/components/ui/input.tsx` | Input primitive |
| `src/components/ui/dialog.tsx` | Dialog/modal primitive |

---

## Gap Summary Table

| # | Area | Gap | Severity | File / Location |
|---|------|-----|----------|----------------|
| 1 | Typography | No defined typographic scale; all sizes are ad-hoc Tailwind utilities | Major | `styles.css` — no `--font-size-*` tokens defined |
| 2 | Typography | Heading levels are inconsistent across pages (h1 `text-3xl` on some, `text-2xl` on others, `text-lg` for section heads) | Major | `dashboard.tsx` L68, `inbox.$appId.tsx` L111, `reports.tsx` L67, `ExecutiveSummary.tsx` L103 |
| 3 | Typography | Arbitrary micro-sizes (`text-[10px]`, `text-[11px]`, `text-[9px]`) scattered throughout | Minor | `route.tsx` L70, L100, L118; `reports.tsx` L21 |
| 4 | Typography | Numerical values (metric cards, fee amounts) are not right-aligned or using tabular figures | Minor | `dashboard.tsx` `MetricCard` L222; `inbox.$appId.tsx` `FeeCard` L159 |
| 5 | Colour | OKLCH token values not verifiable as WCAG-compliant by inspection; no contrast documentation | Major | `styles.css` L57–125 — all tokens in OKLCH |
| 6 | Colour | `SlaChip` (inbox.index.tsx) communicates SLA status with colour + dot only — no text label differentiator for colour-blind users | Critical | `inbox.index.tsx` `SlaChip` L136–159 |
| 7 | Colour | `DocStatusPill` (inbox.$appId.tsx) uses colour alone for Pending/Verified/Rejected states — no icon | Critical | `inbox.$appId.tsx` `DocStatusPill` L395–406 |
| 8 | Colour | `FeeCard` badge ("Paid" / "Awaiting Payment") relies on green/amber colour as primary differentiator; icon is present but the icon-only `Banknote` in the coloured square communicates nothing distinguishing | Major | `inbox.$appId.tsx` `FeeCard` L144–178 |
| 9 | Colour | Chart bars in `ExecutiveSummary` use `--chart-2` (single colour) for all categories — no legend, no labels on bars | Major | `ExecutiveSummary.tsx` L148–154 |
| 10 | Spacing | Arbitrary spacing values used throughout: `gap-2.5`, `gap-3.5`, `px-2.5`, `-mt-0.5`, `min-w-[18px]`, `h-[18px]`, `size-[420px]`, etc. | Major | `route.tsx` L67, L81; `login.tsx` L70–71 |
| 11 | Spacing | No spacing tokens defined in `styles.css`; spacing is entirely Tailwind scale (8px base) — no DIGIT `spacer*` tokens | Minor | `styles.css` — no `--spacing-*` custom properties |
| 12 | Component Behaviour | Fixed sidebar layout never collapses — no hamburger menu, no mobile/tablet nav pattern | Critical | `route.tsx` L145: `grid-cols-[220px_1fr]` — no responsive variant |
| 13 | Component Behaviour | Multiple primary buttons on single views (ActionDock has primary `Button` + outline `Button`; FeeCard section is fine, but Dashboard service cards render multiple `variant="default"` buttons in the same view simultaneously) | Major | `dashboard.tsx` L122; `route.tsx` ActionDock |
| 14 | Component Behaviour | `DocStatusPill` "Reject" uses `window.prompt()` for input — native browser prompt bypasses focus management, has no custom styling, no label, no ARIA | Critical | `inbox.$appId.tsx` `DocumentsTab` L381 |
| 15 | Component Behaviour | `ScheduleDialog` and `RejectDialog` Labels lack `htmlFor` / are not wired to inputs via `id` | Major | `inbox.$appId.tsx` `ScheduleDialog` L624–629; `RejectDialog` L733 |
| 16 | Component Behaviour | `RejectDialog` Textarea has no Label at all — only a `placeholder` attribute | Major | `inbox.$appId.tsx` L733: `<Textarea ... placeholder="Reason…" />` without `<Label>` |
| 17 | Component Behaviour | No loading skeleton or spinner shown while the inbox/dashboard data resolves — the page renders immediately from in-memory store with no perceived async treatment | Minor | `inbox.index.tsx`, `dashboard.tsx` — no loading state guard |
| 18 | Component Behaviour | Approvals page has no empty-state illustration or CTA — only plain text | Minor | `approvals.tsx` L16: text-only empty state |
| 19 | Accessibility | Notification bell button (`route.tsx` L78) has no `aria-label` — icon-only interactive element | Critical | `route.tsx` L78: `<button className="relative size-9 ..."><Bell /></button>` |
| 20 | Accessibility | `DropdownMenuTrigger` user avatar button has no `aria-label` — icon+text visible only on `sm:` breakpoint, invisible at mobile | Major | `route.tsx` L112–120 |
| 21 | Accessibility | Navigation links in sidebar have no `aria-current="page"` on the active item — active state is colour + font-weight only | Major | `route.tsx` L154–167 |
| 22 | Accessibility | The breadcrumb nav in `inbox.index.tsx` uses a `<nav>` element but has no `aria-label` to distinguish it from the sidebar `<nav>` — two unlabelled `<nav>` landmarks on the same page | Major | `inbox.index.tsx` L39–43 |
| 23 | Accessibility | `button.tsx` focus ring is `focus-visible:ring-1` — a 1px ring at low contrast is unlikely to meet the 3:1 contrast requirement against all backgrounds | Major | `button.tsx` L8 |
| 24 | Accessibility | `input.tsx` focus state is `focus-visible:ring-1` (same 1px ring) — no focus border colour change | Major | `input.tsx` L11 |
| 25 | Accessibility | `StageDot` and `SlaBadge` coloured dot spans have no `aria-label` or `role` — screen readers get only the text label with no indication of what the colour dot means | Minor | `StageDot.tsx` L28; `SlaBadge.tsx` L27 |
| 26 | Accessibility | Toast via `sonner` is positioned `top-right` — no `aria-live` region explicitly set in app code (relies on library default) | Minor | `__root.tsx` L68 |
| 27 | Responsiveness | `grid-cols-[220px_1fr]` layout in authenticated shell has no responsive breakpoint — sidebar does not collapse on mobile or tablet | Critical | `route.tsx` L145 |
| 28 | Responsiveness | Dashboard "Recent Activity" table uses `grid-cols-[2fr_1fr_1fr_1fr_1fr_auto]` with no mobile fallback — will overflow on screens <640px | Major | `dashboard.tsx` L146 |
| 29 | Responsiveness | Inbox list table uses `grid-cols-[1.6fr_0.7fr_1.2fr_1fr_1fr_0.8fr]` with no responsive variant — same overflow risk | Major | `inbox.index.tsx` L80 |
| 30 | Responsiveness | ActionDock (`inbox.$appId.tsx`) is `fixed bottom-6 right-6` with `min-w-[360px]` — on a 320px–375px phone this will overflow the screen horizontally | Major | `inbox.$appId.tsx` L483 |
| 31 | Responsiveness | Login page left brand panel is `hidden lg:flex` — acceptable; but the mobile layout has no explicit minimum-width guard and the form card fills full width | Minor | `login.tsx` L53 |

---

## Detailed Findings

### 1. Typography

#### Compliant
- A consistent font stack is defined: `--font-sans: "Inter", ui-sans-serif, system-ui, sans-serif` and loaded via Google Fonts in `__root.tsx`.
- Inter is loaded with weight range 400–800, enabling meaningful weight differentiation.
- Sentence case is correctly used for body text and labels throughout.
- The dashboard page correctly establishes a clear page-level `<h1>` with `text-3xl font-bold` in all major routes.
- Section-level headers use `div` with uppercase tracking classes to create visual sub-hierarchy.

#### Gaps

- **No typographic scale tokens** — `styles.css` defines no `--font-size-*` custom properties. Every text size in the app is a Tailwind utility class (`text-sm`, `text-xs`, `text-2xl`, etc.) applied directly in components. This means font sizes are arbitrary from a token perspective and cannot be globally scaled or overridden without touching each component. Fix: define CSS custom properties for each DIGIT-equivalent level (headingL, headingM, headingS, bodyL, bodyS, bodyXS, captionL) and map Tailwind utilities to them.

- **Inconsistent heading hierarchy across pages** — Page-level `h1` varies: `text-3xl` on Dashboard (`dashboard.tsx` L68), `text-3xl` on Inbox (`inbox.index.tsx` L47), `text-2xl` on the Application detail (`inbox.$appId.tsx` L111), `text-3xl` on Approvals (`approvals.tsx` L13), and `text-3xl` on Reports (`reports.tsx` L67). The section heading in `ExecutiveSummary.tsx` uses `text-lg font-semibold` (L103), which at the same weight as the `text-sm font-semibold` KpiCard label creates insufficient hierarchy separation. Fix: adopt a single `headingL` class for all page titles and `headingM` for section titles.

- **Proliferation of arbitrary micro-sizes** — `text-[10px]` appears in `route.tsx` at L70 ("City of Cape Town" overline), L100 (notification timestamp), L118 (role label). `text-[9px]` appears in `reports.tsx` L21. `text-[11px]` appears in `dashboard.tsx` L146 and `inbox.$appId.tsx` L107. None of these are part of any defined scale. Fix: map all micro-label uses to `bodyXS` or `captionS` token classes.

- **Numeric values not using tabular figures** — The dashboard MetricCard (`dashboard.tsx` L222) displays a large `text-4xl font-bold` number, and the fee amount in `inbox.$appId.tsx` L159 shows financial data, but neither uses `font-variant-numeric: tabular-nums`. In data-dense views this causes numbers to shift width as values change. Fix: add `tabular-nums` to the base body rule or apply it to numeric display classes.

---

### 2. Colour and Contrast

#### Compliant
- A full semantic colour token system is defined in `styles.css`: `--success`, `--success-soft`, `--warning`, `--warning-soft`, `--danger`, `--danger-soft`, `--info`, `--info-soft` plus foreground pairs.
- Tokens are correctly referenced by Tailwind via `@theme inline` mapping — no hardcoded hex values in any reviewed component file.
- `StageDot.tsx` and `SlaBadge.tsx` correctly use the semantic colour tokens and do not introduce ad-hoc colours.
- Chart axis and grid strokes in `ExecutiveSummary.tsx` reference `var(--border)` and `var(--muted-foreground)` rather than hardcoded values.
- The `--ring` token drives all focus rings, making them globally adjustable.

#### Gaps

- **OKLCH token contrast unverifiable by inspection** — All `:root` colour tokens are expressed in OKLCH (`oklch(0.6 0.22 25)` for danger, etc.). While OKLCH is a valid and modern colour space, the actual sRGB luminance of these values cannot be verified without computation. For example, `--warning: oklch(0.72 0.16 65)` (amber) used against `--warning-soft: oklch(0.96 0.05 80)` (pale amber) needs to be validated with a tool. No audit trail or contrast documentation exists in the codebase. Recommendation: run all foreground/background pairs through a WCAG contrast checker and document results, or switch to HSL/hex where contrast is easier to verify.

- **SLA status communicated by colour dot alone** — `SlaChip` in `inbox.index.tsx` (L136–159) renders a 6px coloured dot (`<span className={cn("size-1.5 rounded-full", dot)} />`) as the only visual differentiator between the three status tiers within the chip. The text label ("On track", "At risk", "Breached") does provide a text backup, but the coloured dot itself carries no ARIA meaning, and a user with red-green colour blindness cannot distinguish the dots. The dot should be replaced or supplemented with a small icon (checkmark, warning triangle, X) in addition to the text. Location: `inbox.index.tsx` L148–157.

- **DocStatusPill uses colour only** — `DocStatusPill` in `inbox.$appId.tsx` (L395–406) uses only a background colour class to differentiate Pending (muted grey), Verified (green soft), and Rejected (red soft). There is no icon and no additional non-colour indicator. A user with colour vision deficiency would not be able to distinguish Verified from Rejected at a glance. Fix: add a status-appropriate icon (e.g. `Check`, `X`, `Clock`) before the text label.

- **Charts lack text legends and data labels** — The bar chart in `ExecutiveSummary.tsx` (L136–158) renders bars using only `var(--chart-2)` fill colour for inactive bars and `var(--primary)` for the selected bar. There are no value labels on the bars, and the only legend is the Recharts `Tooltip` (hover-only). When printed or shared as a screenshot, category bar values are unreadable. Fix: add a `<Legend>` component to the BarChart and/or render value labels on bars.

---

### 3. Spacing

#### Compliant
- The dominant spacing pattern throughout the app uses Tailwind's 4px/8px-based scale (`gap-4`, `p-5`, `px-6`, `py-3`, `space-y-8`), which maps cleanly to the DIGIT 4px base grid.
- Section-level spacing (`space-y-8` in dashboard, `space-y-5` in inbox) is consistently larger than component-internal spacing (`p-4`, `px-3 py-2`), reflecting the correct hierarchy principle.
- KpiCard uses `p-5` (20px) internally, consistent with `spacer5`.

#### Gaps

- **Arbitrary spacing values** — The following non-scale values appear across reviewed files:
  - `gap-2.5` (10px, not on 4px grid) — `route.tsx` L67, L112; `inbox.index.tsx` L154
  - `gap-3.5` (14px) — multiple locations
  - `gap-1.5` (6px) — `SlaBadge.tsx` L22; `StageDot.tsx` L27 (6px is off the standard 4px grid unless an 2px grid is used)
  - `px-2.5` (10px) — `SlaBadge.tsx` L22; `StageDot.tsx` L27
  - `-mt-0.5` (negative 2px offset) — `route.tsx` L71 (hackish micro-correction)
  - `min-w-[18px]`, `h-[18px]` — `route.tsx` L81 (fixed pixel dimensions for notification badge)
  - `size-[420px]`, `size-[280px]` — `login.tsx` L70–71 (decorative blobs — non-critical but still arbitrary)

  Fix: Replace off-grid values with the nearest on-grid equivalent. 10px → 8px (`gap-2`) or 12px (`gap-3`); 6px → 4px or 8px. Decorative fixed sizes are lower priority.

- **No DIGIT spacer token definitions** — The `styles.css` file defines no `--spacing-*` or `--spacer-*` custom properties. All spacing is provided purely by Tailwind utilities. This is pragmatically acceptable given Tailwind v4's built-in scale, but means there is no single place to adjust the base grid for the product theme. This is a Minor concern given Tailwind's grid-aligned defaults.

---

### 4. Component Behaviour

#### Compliant
- The `Dialog` component (via Radix) implements focus trapping, Escape-key dismissal, overlay-click dismissal, and `aria-modal` handling natively through Radix DialogPrimitive — all DIGIT modal requirements are satisfied at the primitive level.
- `Button` component in `button.tsx` correctly implements hover, disabled state (`disabled:pointer-events-none disabled:opacity-50`), and keyboard activation via `<button>` semantics.
- The `ScheduleDialog`, `ReportDialog`, and `RejectDialog` modals limit action buttons to 2 in the footer (Cancel + primary action) — compliant with the "no more than 2 primary actions" rule.
- Tabs in `inbox.$appId.tsx` and `reports.tsx` use Radix `Tabs` which natively implements arrow-key navigation within the tab strip.
- The inbox and dashboard both handle the empty state with an icon + text message.
- Toast notifications are correctly placed `top-right` via `<Toaster position="top-right" />` in `__root.tsx`.

#### Gaps

- **Multiple primary buttons visible simultaneously** — The Dashboard (`dashboard.tsx` L116–128) renders up to three `<Button variant="default">` (primary) components side by side in the services grid — one per service card. DIGIT requires one primary button per view. On a full three-service dashboard, three equal-weight primary actions compete for attention. Fix: use `variant="secondary"` for inactive queue buttons and reserve `variant="default"` for the single highest-priority CTA, or contextualise primaries to each card scope rather than treating the whole page as one view.

- **`window.prompt()` used for document rejection reason** — `DocumentsTab` in `inbox.$appId.tsx` (L381) calls `window.prompt("Rejection reason?")` when the Reject button is clicked. This native browser dialog: has no styling, cannot be tested reliably, breaks focus management (focus is not returned to the app cleanly on all browsers), is inaccessible to screen reader users who may not expect a native prompt, and does not conform to DIGIT's confirmation modal pattern for destructive actions. Fix: Replace with a controlled `Dialog` containing a `Textarea` and confirm/cancel buttons — a pattern already used in the same file for `RejectDialog`.

- **Dialog form inputs missing `htmlFor`/`id` linkage** — In `ScheduleDialog` (`inbox.$appId.tsx` L624–629), the `<Label>Date</Label>` and `<Label>Time slot</Label>` elements are not connected to their respective `<Input>` elements via `htmlFor`/`id`. Screen readers will not announce the label when the input is focused. Fix: add `htmlFor="inspection-date"` to the Label and `id="inspection-date"` to the Input (and similarly for time slot).

- **`RejectDialog` Textarea has no visible Label** — `inbox.$appId.tsx` L733 renders `<Textarea ... placeholder="Reason…" />` without any `<Label>` wrapper. Placeholder text disappears when the user starts typing and cannot serve as an accessible label. Fix: add `<Label htmlFor="reject-reason">Rejection reason</Label>` above the Textarea.

- **Required field indicator absent from all forms** — Neither the `ScheduleDialog`, `ReportDialog`, `RejectDialog`, nor the Login form mark required fields with `*` or include the "* Required" explanation at the top of the form as mandated by DIGIT form patterns. Fix: add `aria-required="true"` and a visible `*` to required fields; add a "* Required" note above each form.

- **Approvals page empty state is text-only** — `approvals.tsx` L16 renders only `<div className="p-10 text-center text-sm text-muted-foreground">Nothing waiting for approval.</div>` — no icon, no CTA. DIGIT requires an illustrated empty state with a descriptive message and a call-to-action. Fix: add an icon (e.g. `FileCheck2`) and a link to the inbox or dashboard.

---

### 5. Accessibility

#### Compliant
- The notification bell uses Radix `Popover` which natively manages `aria-expanded` on the trigger.
- The user menu uses Radix `DropdownMenu` which provides full keyboard navigation (arrow keys, Enter, Escape) and `aria-haspopup`/`aria-expanded` attributes.
- All `Dialog` modals use Radix `DialogPrimitive.Content` which sets `role="dialog"`, `aria-modal="true"`, and `aria-labelledby` pointing to the `DialogTitle` automatically.
- The `DialogClose` button (`dialog.tsx` L47) includes `<span className="sr-only">Close</span>` for screen reader labelling.
- The `Button` component uses a semantic `<button>` element and is keyboard-activatable.
- The login form uses `<Label>` with `htmlFor` correctly linked to email and password inputs (`login.tsx` L89–110).
- The root `<html>` element has `lang="en"` set in `__root.tsx` L47.
- `body` tag omits `role` — correctly relies on implicit semantics.

#### Gaps

- **Notification bell button has no `aria-label`** — `route.tsx` L78 renders `<button className="relative size-9 ..."><Bell className="size-4" /></button>`. There is no visible text and no `aria-label`. A screen reader user will hear "button" with no context. Fix: add `aria-label="Notifications"` (and dynamically `aria-label={`Notifications, ${unread} unread`}` when `unread > 0`).

- **User avatar button `aria-label` absent** — `route.tsx` L112 renders a button with a monogram avatar that is only visible at `sm:` and above. On mobile, no text is visible, and there is no `aria-label`. Fix: add `aria-label={`User menu for ${session.name}`}`.

- **Sidebar active nav item missing `aria-current="page"`** — `route.tsx` L154–167 applies active styling via conditional Tailwind classes but does not set `aria-current="page"` on the active `<Link>`. Screen readers cannot announce the current page in navigation without this attribute. Fix: add `aria-current={active ? "page" : undefined}` to the Link.

- **Two unlabelled `<nav>` landmarks** — `inbox.index.tsx` L39 renders a breadcrumb `<nav>` without `aria-label="Breadcrumb"`. The authenticated shell in `route.tsx` L148 renders the sidebar `<nav>` without `aria-label="Main"`. When two `<nav>` landmarks exist on a page, WCAG requires each to have a distinct accessible name so users can distinguish them. Fix: add `aria-label="Breadcrumb"` to the breadcrumb nav and `aria-label="Main navigation"` to the sidebar nav.

- **Focus ring too thin to meet 3:1 contrast** — Both `button.tsx` (L8) and `input.tsx` (L11) use `focus-visible:ring-1` — a 1px focus ring. WCAG 2.2 Success Criterion 2.4.11 (Focus Appearance, AA) requires the focus indicator to have a minimum area. More practically, a 1px ring is often invisible on mid-tone backgrounds. Fix: increase to `focus-visible:ring-2` and confirm the `--ring` token value (currently `oklch(0.58 0.09 175)`, teal) achieves at least 3:1 contrast against both white card backgrounds and the primary-coloured header.

- **Coloured dot spans in `StageDot` and `SlaBadge` are presentational but unlabelled** — `StageDot.tsx` L28 and `SlaBadge.tsx` L27 render `<span className={cn("size-1.5 rounded-full", ...)} />` decorative dots. Since the label text follows immediately they are not harmful, but adding `aria-hidden="true"` to these spans would explicitly mark them as decorative and prevent screen readers from announcing an empty element. Fix: add `aria-hidden="true"` to each coloured dot span.

- **No `aria-live` region explicitly declared for dynamic content** — The inbox list and dashboard are populated from a live in-memory store (citizen simulator). When new applications arrive via `startCitizenSimulator()`, the list updates silently. There is no `aria-live="polite"` announcement. Fix: wrap the queue count badge or a visually hidden status region in an `aria-live="polite"` container that announces changes (e.g. "3 new applications in your queue").

---

### 6. Responsiveness

#### Compliant
- The login page uses `grid lg:grid-cols-2` — single column on mobile with the brand panel hidden; this is a correct responsive pattern.
- The `<meta name="viewport" content="width=device-width, initial-scale=1">` is set in `__root.tsx`.
- The `main` content area uses `max-w-[1400px] w-full mx-auto` which prevents over-expansion on ultra-wide screens.
- Report page tab list uses `h-auto flex-wrap` allowing tabs to wrap on narrow widths.
- The KPI grid in `ExecutiveSummary.tsx` uses `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` — a proper responsive grid.
- `DocumentsTab` uses `grid-cols-1 md:grid-cols-3` — responsive.
- The user avatar name is hidden on small screens with `hidden sm:block` in `route.tsx` L116.

#### Gaps

- **Authenticated shell sidebar never collapses (Critical)** — `route.tsx` L145 renders `<div className="grid grid-cols-[220px_1fr]">`. There is no `sm:`, `md:`, or `lg:` responsive variant. The sidebar occupies a fixed 220px column at all screen widths. On a 375px mobile device only 155px is left for content, and the main column padding (`p-6` = 24px each side) would leave ~107px of usable content width. In practice this would cause severe horizontal overflow or column content truncation. There is no hamburger toggle, no mobile overlay, and no way for a mobile user to see the full content. Fix: wrap the sidebar in a `hidden lg:block` and implement a hamburger-triggered `Sheet`/`Drawer` for mobile and tablet navigation.

- **Dashboard activity table overflows on mobile** — `dashboard.tsx` L146 uses `grid-cols-[2fr_1fr_1fr_1fr_1fr_auto]` — a 6-column grid with no responsive variant. At any viewport below approximately 640px this table will overflow its container. Fix: add `overflow-x-auto` to the wrapping `<Card>` and/or collapse to a card-based list view on mobile breakpoints.

- **Inbox list table overflows on mobile** — `inbox.index.tsx` L80 uses `grid-cols-[1.6fr_0.7fr_1.2fr_1fr_1fr_0.8fr]` — same problem. Fix: as above.

- **ActionDock `min-w-[360px]` overflows small phones** — `inbox.$appId.tsx` L483: `<Card className="... min-w-[360px]">`. At 320px–375px viewport widths, this fixed-width floating dock will extend beyond the screen edge. Fix: remove `min-w-[360px]`, use `w-full max-w-lg` or a full-width bottom bar pattern on mobile, and adjust padding accordingly.

- **Sidebar pipeline banner in inbox uses inline chips with no wrapping strategy** — `inbox.index.tsx` L63–68 renders three `<RoleChip>` elements separated by arrow spans in a single `<div className="text-sm ... leading-relaxed">`. On narrow widths the chips may wrap in unexpected ways without explicit flex/wrap rules. This is a Minor concern as the pipeline banner is informational only.

---

## Severity Definitions

| Level | Meaning |
|-------|---------|
| **Critical** | Directly fails WCAG AA accessibility requirements or causes complete loss of functionality for a segment of users (e.g. mobile nav inaccessible, screen reader cannot identify interactive element, colour-only status in a critical action flow) |
| **Major** | Inconsistent with DIGIT design principles; degrades experience for users with disabilities or on non-desktop devices; creates maintainability risk; will likely fail a design review |
| **Minor** | Polish and consistency issues; does not fail any guideline outright but reduces token hygiene, visual consistency, or progressive quality |

---

*Audit performed against DIGIT Design System Principles (design.digit.org, DIGIT UI Components v0.2.0). Files reviewed as of June 2026.*
