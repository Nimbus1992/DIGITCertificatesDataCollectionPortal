# Admin App — DIGIT Design Principles Gap Analysis

## Executive Summary

The Admin App demonstrates a solid baseline: it uses Tailwind CSS variables for all theme tokens, employs shadcn/ui primitives for consistent component behaviour, and provides sensible semantic colour tokens for primary, secondary, destructive, success, and warning states. However, the app carries several meaningful gaps against DIGIT principles. The most significant risk areas are (1) pervasive hardcoded hex and Tailwind literal colour classes that bypass the token system, (2) absent ARIA attributes on modals, drawers, and dynamic regions that fail WCAG 2.1 AA keyboard-accessibility requirements, and (3) a complete absence of mobile-responsive behaviour — the sidebar never collapses to a hamburger on small screens, and several layouts use fixed widths that will overflow at 320–767 px. Typography hierarchy is mostly functional but inconsistent, with ad-hoc font sizes and sub-pixel class names mixed throughout. Positive highlights include correct use of CSS variables for the core palette, the AlertDialog component for destructive actions, and the presence of inline error text in key form flows.

---

## Audit Scope

The following files were read and audited:

| File | Role |
|------|------|
| `src/index.css` | CSS variables / token definitions |
| `tailwind.config.ts` | Tailwind theme extension |
| `src/components/AppSidebar.tsx` | Global navigation |
| `src/components/AppLayout.tsx` | Application shell |
| `src/pages/Dashboard.tsx` | Primary landing page |
| `src/pages/Services.tsx` | Template catalogue page |
| `src/pages/UsersAccess.tsx` | Users, Roles, Activity tabs |
| `src/components/onboarding/SignIn.tsx` | Authentication form |
| `src/components/template-setup/Step1Identity.tsx` | Multi-step wizard, step 1 |
| `src/components/go-live/AddUsers.tsx` | Go-live wizard, user addition step |
| `src/components/service-config/FormBuilder.tsx` | Complex 3-column form builder |
| `src/components/users-access/InviteUserSheet.tsx` | Sheet/drawer for user invites |
| `src/components/audit/UnifiedAuditTable.tsx` | Audit log data table |

Reference document: `DIGIT_Design_Principles.md`

---

## Gap Summary Table

| # | Area | Gap | Severity | File / Location |
|---|------|-----|----------|----------------|
| 1 | Typography | Ad-hoc font sizes outside the token scale (`text-[10px]`, `text-[11px]`, `text-[22px]`, `text-[9px]`) used prolifically | Major | Dashboard.tsx, UsersAccess.tsx, SignIn.tsx, FormBuilder.tsx, InviteUserSheet.tsx, AppSidebar.tsx |
| 2 | Typography | No defined headingXl/headingL/headingM semantic classes; size selection is ad-hoc per file (`text-3xl`, `text-2xl`, `text-xl`, `text-lg` scattered inconsistently) | Major | All pages |
| 3 | Typography | Button labels use sentence case instead of required Title Case (e.g. "Sign in", "Go live", "Add service", "Save form", "Send invite") | Major | SignIn.tsx, Dashboard.tsx, FormBuilder.tsx, InviteUserSheet.tsx, AddUsers.tsx |
| 4 | Typography | Sub-pixel label text `text-[10px]` and `text-[9px]` in badges and role chips likely fails 4.5:1 contrast at those sizes | Critical | UsersAccess.tsx (lines 417, 519), AppSidebar.tsx (line 154) |
| 5 | Colour | Hardcoded Tailwind literal colour classes (`bg-blue-100`, `text-blue-700`, `border-blue-300`, `bg-green-100`, `text-green-700`, `bg-green-500`, `text-green-600`, `bg-blue-500/10`, `text-blue-600`) used for semantic status — not mapped to CSS variables | Critical | Dashboard.tsx (lines 44–57, 127, 249), UsersAccess.tsx (line 104) |
| 6 | Colour | Hardcoded literal background `bg-blue-50`, `border-blue-200`, `text-blue-900` used for helper banner inside FormBuilder canvas | Major | FormBuilder.tsx (line 592) |
| 7 | Colour | Hardcoded `bg-amber-100`, `text-amber-800`, `border-amber-200`, `bg-amber-50/50`, `text-amber-900` used for conditional-logic panels — not a CSS variable | Major | FormBuilder.tsx (lines 733, 734, 952, 1018) |
| 8 | Colour | `info` colour token is missing entirely from `index.css`; the DIGIT `info` / `info-bg` role has no variable defined | Major | `src/index.css` (entire file — no `--info` variable) |
| 9 | Colour | Status colour indicator in `StatusBadge` (UsersAccess.tsx) uses a coloured dot alone without an accompanying icon or text-only fallback for colour-blind users | Critical | UsersAccess.tsx (lines 89–100) |
| 10 | Colour | Live service "pulse dot" in Dashboard `ServiceCard` (`w-1.5 h-1.5 rounded-full bg-current animate-pulse`) is colour-only with no text/icon alternative indicating "live" | Major | Dashboard.tsx (lines 103–105) |
| 11 | Spacing | Arbitrary spacing values used: `gap-1.5` (6px), `gap-2.5` (10px), `py-0.5` (2px), `py-2.5` (10px), `px-1.5` (6px) — these are not on the 4px base grid | Major | UsersAccess.tsx, Dashboard.tsx, AppSidebar.tsx, FormBuilder.tsx, InviteUserSheet.tsx |
| 12 | Spacing | `p-0.5` (2px padding) on `SidebarFooter` sign-out button and on badge close buttons; `gap-0.5` used — values below `spacer1` (4px) | Minor | AppSidebar.tsx (line 158), InviteUserSheet.tsx (line 90) |
| 13 | Component Behaviour | Multiple high-emphasis `Button` (default/primary variant) visible simultaneously in the same view — e.g. Dashboard ServiceCard renders two accent buttons ("Configure" + "Go Live" both use `bg-accent`) | Major | Dashboard.tsx (lines 177–188) |
| 14 | Component Behaviour | `AddUsers.tsx` form inputs for "Full name" and "Email address" use placeholder text as the only label — no `<Label>` element is rendered above those inputs | Critical | AddUsers.tsx (lines 68–81) |
| 15 | Component Behaviour | `InviteUserSheet` email input is a raw `<input>` element inside a custom flex container, not a shadcn `<Input>`. It has no `id`, no associated `<Label htmlFor>`, and no `aria-label` | Critical | InviteUserSheet.tsx (lines 95–102) |
| 16 | Component Behaviour | No loading state or skeleton while data is loading in any table or list view (UsersAccess, AuditTable) | Major | UsersAccess.tsx, UnifiedAuditTable.tsx |
| 17 | Component Behaviour | Pagination on UsersAccess users table shows "Page 1 of 1" static text — no actual pagination controls. Large datasets will not be paginated | Major | UsersAccess.tsx (line 486) |
| 18 | Component Behaviour | `UnifiedAuditTable` "Load more" pattern (show 25 more) is used without a page-size control or traditional pagination — non-conformant with DIGIT table pattern | Minor | UnifiedAuditTable.tsx (line 113) |
| 19 | Component Behaviour | Sortable table headers in `UnifiedAuditTable` are `<TableHead>` elements with `onClick` but no `role="button"`, `tabIndex`, or keyboard event handlers — not keyboard activatable | Major | UnifiedAuditTable.tsx (lines 125–143) |
| 20 | Component Behaviour | The `FormBuilder` header `<HelpCircle className="h-4 w-4" /> Help` renders a Lucide icon and plain text as an interactive hint but is not a `<button>` — it is unfocusable and unactivatable via keyboard | Major | FormBuilder.tsx (line 463) |
| 21 | Accessibility | `AppLayout` header has no `<nav>` landmark or `aria-label`; `<main>` is present but `<header>` and `<aside>` landmark roles are not explicitly set on sidebar | Major | AppLayout.tsx (lines 25–44) |
| 22 | Accessibility | `InviteUserSheet` is a Radix `Sheet` (drawer) but the inner scroll area and form elements have no `aria-live` region for validation errors; toast errors are not announced to screen readers | Major | InviteUserSheet.tsx |
| 23 | Accessibility | `SignIn.tsx` error state renders a `div` with error text — there is no `role="alert"` or `aria-live="polite"` to announce the error to screen readers | Critical | SignIn.tsx (lines 110–114) |
| 24 | Accessibility | Filter pill buttons in `UsersAccess.tsx` lack `aria-pressed` state; the currently selected filter is indicated only by background colour change | Major | UsersAccess.tsx (lines 358–372) |
| 25 | Accessibility | `AppSidebar` sign-out button has `title="Sign out"` for tooltip text but no `aria-label` — `title` is not reliably announced by all screen readers | Minor | AppSidebar.tsx (line 159) |
| 26 | Accessibility | `FormBuilder` delete buttons on canvas fields (`.opacity-0 group-hover:opacity-100`) are visually hidden at rest and keyboard-inaccessible — they are never focusable unless hovered | Critical | FormBuilder.tsx (lines 366–375) |
| 27 | Accessibility | Role pills/buttons in `AddUsers.tsx` use `<button>` without `aria-pressed` or `role="radio"` to indicate the currently selected role | Major | AddUsers.tsx (lines 84–97) |
| 28 | Accessibility | `NavGroup` items use `isActive` prop on `SidebarMenuButton` but the underlying rendered `NavLink` does not set `aria-current="page"` | Major | AppSidebar.tsx (lines 76–88) |
| 29 | Responsiveness | `AppLayout` sidebar is always visible; there is no hamburger toggle mechanism for mobile viewports. The `SidebarTrigger` collapses to icon-only mode but the sidebar is never fully hidden on narrow screens | Critical | AppLayout.tsx, AppSidebar.tsx |
| 30 | Responsiveness | `FormBuilder` uses a fixed 3-column layout (`w-56` palette + flexible canvas + `w-72` properties panel + `w-[320px]` preview) with no responsive breakpoints — will overflow horizontally at all tablet/mobile sizes | Critical | FormBuilder.tsx (lines 492–1091) |
| 31 | Responsiveness | `UsersAccess` metrics grid uses `grid-cols-2 lg:grid-cols-4` but the inner table has no horizontal scroll wrapper — wide tables will cause horizontal overflow on tablet | Major | UsersAccess.tsx (lines 350–355, 384) |
| 32 | Responsiveness | `Dashboard` background radial-gradient uses `backgroundSize: "24px 24px"` via inline style — a hardcoded pixel value outside the token system | Minor | Dashboard.tsx (lines 257–261) |
| 33 | Responsiveness | `Services` page has `max-w-5xl mx-auto` with no responsive padding — at 320px viewport the `p-6` (24px) padding on both sides reduces content to 272px, which is acceptable but tight. No explicit mobile grid collapse below `md` | Minor | Services.tsx (lines 26–44) |

---

## Detailed Findings

### 1. Typography

#### Compliant
- All three major pages use the correct heading weight convention: `font-bold` for page-level h1 and `font-semibold` for section h2, creating a readable hierarchy.
- Body and supporting text consistently use `text-sm` (14px) and `text-xs` (12px) through `text-muted-foreground`, matching the DIGIT bodyS/bodyXS roles.
- `Step1Identity.tsx` correctly uses `text-3xl font-semibold` for the step heading and `text-base` for body, with a `text-xs` helper line — a clean three-level hierarchy within the component.
- The font family is set globally via `font-family: 'Inter', system-ui` in `index.css`, satisfying the DIGIT "legible typeface" requirement.

#### Gaps

- **Ad-hoc sub-pixel and arbitrary sizes** — The codebase uses `text-[10px]`, `text-[11px]`, `text-[9px]`, and `text-[22px]` in at least twelve distinct locations. These arbitrary bracket values sit outside any defined type scale and produce inconsistent rendering across browsers. Instances: `AppSidebar.tsx` line 154 (`text-[10px]`); `UsersAccess.tsx` lines 117, 136, 417, 519; `SignIn.tsx` lines 70, 152; `FormBuilder.tsx` lines 479, 511, 542; `InviteUserSheet.tsx` line 104. Recommended fix: define `--font-size-caption-l: 12px`, `--font-size-caption-m: 11px` as CSS variables and map them to Tailwind utilities.

- **No semantic type scale classes** — There are no reusable utility classes or Tailwind extensions for `headingXl`, `headingL`, `headingM`, `headingS`, etc. Heading sizes are chosen ad-hoc per file: `Dashboard.tsx` uses `text-3xl` for the page title while `UsersAccess.tsx` uses `text-2xl` for its equivalent page title. This creates visual inconsistency between pages. Recommended fix: add a `fontSize` extension in `tailwind.config.ts` mapping semantic names to the pixel values defined in `index.css`.

- **Button label casing** — DIGIT requires Title Case for button labels. Multiple buttons use sentence case: "Sign in" (`SignIn.tsx` line 119), "Go live" (`Dashboard.tsx`), "Add service" (Dashboard), "Save form" (`FormBuilder.tsx` line 1109), "Send invite" (`InviteUserSheet.tsx` line 148), "Skip for now" (`AddUsers.tsx` line 122). These should be changed to "Sign In", "Go Live", "Add Service", "Save Form", "Send Invite", "Skip For Now".

- **Sub-pixel text and contrast risk** — `text-[9px]` used on role/type badge labels in `UsersAccess.tsx` (e.g. line 519: "1 per org" badge) is below the WCAG minimum legible text size and almost certainly fails the 4.5:1 contrast ratio at that size. The `text-[10px]` occurrences in `AppSidebar.tsx` (user role label at line 154) are also borderline. Recommended fix: raise minimum label text to 11px (or use `text-xs` = 12px) across all badge and chip elements.

---

### 2. Colour and Contrast

#### Compliant
- `index.css` defines the core palette entirely as HSL CSS variables (`--primary`, `--secondary`, `--destructive`, `--success`, `--warning`, `--background`, `--foreground`, `--muted`, `--border`, `--ring`, etc.) — all Tailwind colour references flow through these tokens.
- `tailwind.config.ts` maps every colour class to a CSS variable (`hsl(var(--primary))`) rather than a hardcoded hex value — compliant with the token-first rule.
- Destructive/error actions correctly use the `--destructive` token (`text-destructive`, `bg-destructive/10`, `border-destructive/30`) throughout Dashboard, FormBuilder, and UsersAccess.
- Success and warning semantic tokens exist and are used in appropriate contexts (e.g. `bg-success` for active status dot, `bg-warning` for draft state).

#### Gaps

- **Missing `info` token** — `index.css` defines `--success` and `--warning` but has no `--info` or `--info-bg` variable. The "published" service status in `Dashboard.tsx` and "Invited" action badge in `UsersAccess.tsx` both manually use `bg-blue-100 text-blue-700 border-blue-300` (lines 44–56 of Dashboard, lines 104–108 of UsersAccess) — raw Tailwind colour literals that bypass the token system and will not update if the theme changes. Recommended fix: add `--info: 214 89% 52%` and `--info-bg: 214 89% 95%` to `index.css` and replace all `blue-*` class references.

- **Hardcoded literal colours for status states** — The `statusConfig` object in `Dashboard.tsx` (lines 36–58) uses `bg-blue-100`, `text-blue-700`, `border-blue-300`, `bg-green-100`, `text-green-700`, `border-green-300`, `bg-green-500`, and their dark-mode counterparts as hardcoded Tailwind values. This is a direct violation of the DIGIT rule that all colours must be design tokens. The same pattern appears in `UsersAccess.tsx` `ACTION_COLORS` map (lines 103–113). Recommended fix: add `--info`, `--live` (or reuse `--success`) tokens and reference them via `hsl(var(...))`.

- **Hardcoded colours in FormBuilder** — The helper banner for map sub-screens uses `bg-blue-50 border-blue-200 text-blue-900` (line 592), and the conditional logic panels use `border-amber-200 bg-amber-50/50 text-amber-900` (lines 952, 1018). Both bypass the token system and will not theme correctly. Recommended fix: use `bg-info/10 border-info/30 text-foreground` and `bg-warning/10 border-warning/30 text-warning-foreground`.

- **Colour-only status indicator** — `StatusBadge` in `UsersAccess.tsx` (lines 88–100) shows user status (Active, Invited, Disabled) with a coloured dot (`bg-success`, `bg-warning`, `bg-muted-foreground`) plus a text label. The dot is the only visual differentiator between the colour states — no icon distinguishes the three states. While text is present, a user who cannot distinguish green/yellow/grey will rely solely on the adjacent text "Active"/"Invited"/"Disabled" without any icon cue. DIGIT requires colour + icon for status indicators. Recommended fix: add a `CheckCircle2`, `Clock`, or `Ban` icon alongside each dot.

- **Live pulse dot colour-only** — In `Dashboard.tsx` ServiceCard (lines 103–105), a live service shows an animated pulsing dot inside the badge: `<span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />`. This is purely a colour animation with no textual or icon differentiation from a non-live badge. Recommended fix: add a screen-reader-only span `<span className="sr-only">Live</span>` or a distinct icon.

---

### 3. Spacing

#### Compliant
- The vast majority of spacing uses Tailwind's default 4px-base-grid steps: `p-4` (16px), `p-6` (24px), `p-8` (32px), `gap-4` (16px), `gap-2` (8px), `gap-3` (12px) — all valid multiples.
- Card internal padding (`p-4`, `p-5`) and section separation (`space-y-6`, `space-y-10`) follow sensible mid and large token ranges.
- Form element spacing in `Step1Identity.tsx` uses `space-y-8` (32px) between form sections and `space-y-2` (8px) within a field group — consistent with DIGIT's spacer8 and spacer2 guidelines.

#### Gaps

- **Half-step values throughout** — Tailwind's `0.5` increments (2px) and `1.5` increments (6px) appear hundreds of times across the codebase. Examples: `gap-1.5` (6px) in AppSidebar, Dashboard, UsersAccess, FormBuilder; `py-2.5` (10px) in UsersAccess table rows and filter pills; `px-1.5` (6px) in badge components; `gap-2.5` (10px) in Dashboard section headers. These values (6px, 10px) sit between the DIGIT `spacer1` (4px)/`spacer2` (8px) and `spacer2` (8px)/`spacer3` (12px) steps and represent off-grid choices. At this scale the visual impact is minor but the principle of a consistent scale is violated. Recommended fix: audit for `*-1.5` and `*-2.5` usages and round to the nearest grid step (8px or 12px).

- **Sub-4px values** — `p-0.5` (2px) on the sidebar sign-out button (AppSidebar.tsx line 158) and `pr-0.5` (2px) on badge close buttons (InviteUserSheet.tsx line 90) fall below `spacer1`. These produce very tight tap targets. Recommended fix: raise to `p-1` (4px) minimum.

- **Inline style hardcoded pixel value** — `Dashboard.tsx` (lines 258–260) uses an inline `style` prop with `backgroundSize: "24px 24px"` for the dot-grid background pattern. This is a hardcoded pixel value outside the spacing system. While cosmetically minor, it violates the token-first rule. Recommended fix: define a CSS variable `--grid-dot-size: 24px` or move to a Tailwind arbitrary value documented in the design token system.

---

### 4. Component Behaviour

#### Compliant
- `AlertDialog` is correctly used for destructive actions (service deletion in Dashboard.tsx) with a confirmation step for live services — matches DIGIT's "destructive actions require confirmation modal" pattern.
- `Step1Identity.tsx` has a `<Label htmlFor="svc-name">` above the `<Input id="svc-name">` with an inline error message below (`text-xs text-destructive`) — correctly implements the DIGIT label-above-input and inline-error pattern.
- `SignIn.tsx` has `<Label htmlFor="email">` and `<Label htmlFor="password">` above each input with explicit `id` links — labels are above inputs, not placeholder-only.
- The `InviteUserSheet` submit button is gated — it calls `submit()` which validates before proceeding, preventing blind form submission.
- `FormBuilder` correctly disables the "Delete Step" button when only one step remains (`disabled={steps.length <= 1}`), giving clear disabled state feedback.
- The `UsersAccess` empty-state table row spans all columns with a descriptive message ("No users match your filters.") — a compliant empty state.

#### Gaps

- **Inputs without labels (`AddUsers.tsx`)** — The two `<Input>` fields for name and email address (lines 68–81) use only `placeholder="Full name"` and `placeholder="Email address"` as their labels. There are no `<Label>` elements. This violates the DIGIT rule that "labels always visible above the input; placeholder is hint-only". Recommended fix: add `<Label>Full name</Label>` and `<Label>Email address *</Label>` above each input, with `htmlFor` linkage.

- **Raw `<input>` without label (`InviteUserSheet.tsx`)** — The multi-email input (lines 95–101) is a raw HTML `<input>` without an `id`, without a `<Label htmlFor>`, and without an `aria-label`. The adjacent `<Label>Email addresses</Label>` (line 85) is not programmatically associated with the input. Recommended fix: add `id="email-input"` to the input and `htmlFor="email-input"` to the Label, or add `aria-label="Add email address"`.

- **Multiple primary buttons per view** — In `ServiceCard` (Dashboard.tsx, lines 177–188), the non-live draft state renders both a "Configure" button (`variant="outline"`) and a "Go Live" button with `bg-accent` styling. The "Go Live" button is the expected single primary. However, in the live state, two `variant="outline"` buttons are shown ("View" and "Edit") — this is acceptable. The problem is the assigned service state which renders a "Set up" button with `bg-accent` that is primary-emphasis but coexists in a grid with other cards that also have `bg-accent` primary buttons. On the full dashboard, multiple `bg-accent` buttons are simultaneously visible. DIGIT allows only one primary button per view. Recommended fix: demote secondary card actions to `variant="ghost"` or `variant="outline"` and reserve the accent/primary style for one focal CTA per card at most.

- **No loading states** — Neither `UsersAccess.tsx` nor `UnifiedAuditTable.tsx` shows a skeleton or spinner while data loads. Although data is currently mocked from localStorage (no real async), the DIGIT principle requires that loading states always be communicated — especially as the app moves toward a live backend. Recommended fix: add `Skeleton` components or a `Spinner` for any data-fetch scenario.

- **Pagination is non-functional** — `UsersAccess.tsx` line 486 shows `Page 1 of 1` as static text with no pagination controls. For datasets beyond the viewport this gives no navigation. Recommended fix: implement proper pagination with page size selector, or at minimum wire up a "Load more" control matching the AuditTable pattern.

- **Sortable column headers not keyboard accessible** — `UnifiedAuditTable.tsx` `SortableHead` component (lines 125–143) is a `<TableHead>` with `onClick` but no `tabIndex="0"`, no `role="columnheader button"`, and no `onKeyDown` handler. Keyboard users cannot sort columns. Recommended fix: add `tabIndex={0}` and `onKeyDown={(e) => e.key === 'Enter' && onClick(k)}`.

- **"Help" element in FormBuilder not interactive** — `FormBuilder.tsx` line 463 renders `<HelpCircle className="h-4 w-4" /> Help` as a sibling to a Button but is itself neither a button nor a link. It is not focusable and has no click handler. Recommended fix: wrap in a `<Button variant="ghost" size="sm">` or `<a>` with appropriate handler.

---

### 5. Accessibility

#### Compliant
- Delete buttons on service cards in `Dashboard.tsx` (line 113) include `aria-label={`Delete ${service.name}`}` — correctly labels icon-only buttons.
- The sidebar `NavLink` component uses `activeClassName` including a left border indicator alongside the colour change — partially fulfils the "active state not colour-only" requirement.
- `AlertDialog` (Radix) provides `role="alertdialog"`, `aria-modal="true"`, and links `aria-labelledby` to the title automatically — modal accessibility is handled by the primitive.
- `Sheet` (Radix) for `InviteUserSheet` provides focus trap and Escape-to-close behaviour natively via the Radix primitive.
- All Lucide icons used decoratively (e.g. inside labelled buttons) inherit their parent's accessible name and do not need separate aria attributes.

#### Gaps

- **Sign-in error not announced** — `SignIn.tsx` lines 110–114 render the login error inside a `<div className="text-xs text-destructive ...">`. There is no `role="alert"` or `aria-live` attribute. Screen reader users will not be informed of the error unless they navigate to that element. Recommended fix: add `role="alert"` to the error `<div>`.

- **FormBuilder canvas delete buttons hidden from keyboard** — Lines 366–375 of `FormBuilder.tsx` render delete buttons on field cards with `opacity-0 group-hover:opacity-100`. These buttons are in the DOM but invisible at rest, and because their visibility is CSS-only (opacity, not `display:none` or `visibility:hidden`), they remain focusable via Tab — but they are invisible when focused via keyboard. This creates a "ghost focus" problem. Recommended fix: use `className={isSelected ? 'visible' : 'sr-only'}` so the button is visible when the card is selected, or ensure `focus-within` makes the button visible.

- **Filter pills missing `aria-pressed`** — `UsersAccess.tsx` lines 358–372 render filter pills as `<button>` elements. The active state is communicated through a background colour change only. Screen readers have no programmatic indication of which filter is active. Recommended fix: add `aria-pressed={filter === p.id}` to each button.

- **`aria-current="page"` absent on nav items** — `AppSidebar.tsx` `NavGroup` passes `isActive={location.pathname === item.url}` to `SidebarMenuButton` but the rendered `<NavLink>` anchor does not set `aria-current="page"` on the active item. DIGIT principle 4.4 requires this. Recommended fix: add `aria-current={isActive ? 'page' : undefined}` inside the `NavLink` component or on the `<a>` element it renders.

- **Role selection buttons lack group semantics** — `AddUsers.tsx` lines 84–97 render three role buttons (Admin, Operator, Approver) as plain `<button>` elements. These function as a radio group but have no `role="radiogroup"` on the container, no `role="radio"` on each button, and no `aria-checked` attribute. Keyboard navigation with arrow keys (required by DIGIT 4.2) will not work. Recommended fix: replace with `<RadioGroup>` and `<RadioGroupItem>` from shadcn/ui.

- **No `<nav>` landmark in AppLayout** — `AppLayout.tsx` renders the top header as `<header>` (correct) but the main `<Outlet>` content is wrapped in a `<main>` without a descriptive `aria-label`. The sidebar renders through `AppSidebar` which wraps in a `<Sidebar>` (which should render as `<aside>`). However, there is no `aria-label="Main navigation"` on the sidebar — screen readers would announce it as an unnamed landmark. Recommended fix: add `aria-label="Main navigation"` to the `<Sidebar>` component.

- **Dynamic content regions lack `aria-live`** — Toast notifications (via `sonner`) are not audited in this file set, but within the reviewed files, no dynamic content regions (filter results, search-filtered tables) have `aria-live="polite"` to announce result count changes. For example, when the user filters the users table, the count "X of Y" in the footer updates silently. Recommended fix: add `aria-live="polite"` to the results-count span in the table footer.

---

### 6. Responsiveness

#### Compliant
- `Dashboard.tsx` uses `grid-cols-2 md:grid-cols-4` for the metrics row and `md:grid-cols-2 lg:grid-cols-3` for service cards — the grid collapses appropriately on mobile.
- `AppLayout.tsx` uses `min-h-screen flex w-full` with `flex-1 min-w-0` on the content area, preventing a fixed layout that would break on small screens at the page level.
- `Services.tsx` template grid uses `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` — single column on mobile.
- `UsersAccess.tsx` header section uses `flex items-start justify-between gap-4` with `flex-wrap` on inner controls — wraps correctly on narrow viewports.

#### Gaps

- **Sidebar never hides on mobile** — `AppLayout.tsx` wraps everything in `SidebarProvider` and always renders `AppSidebar`. The `Sidebar` component supports `collapsible="icon"` (icon-only mode) but there is no breakpoint at which the sidebar fully disappears and a hamburger toggle becomes the sole entry point. On a 320px viewport the icon-only sidebar plus content area will be extremely constrained. DIGIT requires a hamburger toggle on mobile/tablet. Recommended fix: use `collapsible="offcanvas"` or add a CSS `@media (max-width: 767px)` rule that hides the sidebar and shows a full-width layout with `SidebarTrigger` as the hamburger opener.

- **FormBuilder is not responsive at all** — `FormBuilder.tsx` renders a fixed 4-column layout: `w-56` (224px) palette + flexible canvas + `w-72` (288px) properties panel + `w-[320px]` (320px) emulator preview. The minimum content width is approximately 224 + 288 + 320 = 832px before the canvas even has space. At tablet (768px) and mobile (320px) this layout will overflow horizontally with no breakpoint fallbacks defined. Recommended fix: add `hidden xl:flex` to the preview panel, `hidden lg:flex` to the properties panel, and provide a tabbed fallback for smaller screens.

- **UsersAccess table horizontal overflow** — The users table (`UsersAccess.tsx` lines 384–488) contains 6 columns (User, Role, Service Scope, Status, Last Active, Actions). The table is wrapped in `overflow-hidden` on the card but there is no `overflow-x-auto` wrapper, meaning the table cannot scroll horizontally on narrow screens and will either overflow or squash columns. Recommended fix: wrap the table in a `<div className="overflow-x-auto">`.

- **Tap targets below 44px minimum** — Multiple interactive elements have heights below the DIGIT/WCAG minimum 44×44px for mobile tap targets. Examples: `h-8 w-8` action dropdown buttons (32×32px) in UsersAccess table rows; `h-7` option-delete buttons (28px) in FormBuilder; `h-3.5 w-3.5` (14px) trash icon buttons in `AddUsers.tsx` member cards (line 63). While the click area can exceed the visual size, no padding is added to compensate. Recommended fix: add `min-h-[44px] min-w-[44px]` on mobile or ensure sufficient padding, especially on delete/remove controls.

- **Fixed `max-w-5xl` without side padding adjustment** — `Services.tsx` uses `p-6 max-w-5xl mx-auto`. At 320px viewport, `p-6` (24px each side) leaves 272px for content — acceptable but at the lower bound. Recommended more: add `sm:p-4 p-3` responsive padding to ensure comfortable reading at minimum mobile width.

---

## Severity Definitions

| Severity | Definition |
|----------|-----------|
| **Critical** | Fails WCAG 2.1 AA, breaks keyboard accessibility, prevents use by assistive technology, or causes content overflow/unusability on a supported breakpoint |
| **Major** | Inconsistent with DIGIT principles in a way that degrades experience, creates visual inconsistency between screens, or undermines the token/theming system |
| **Minor** | Polish or consistency issue — does not block functionality but reduces design quality or creates technical debt |
