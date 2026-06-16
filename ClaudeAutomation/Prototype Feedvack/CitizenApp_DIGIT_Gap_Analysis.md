# Citizen App — DIGIT Design Principles Gap Analysis

## Executive Summary

The Citizen App (City of Cape Town Licences & Permits portal) is a well-structured, mobile-first React application built with Tailwind CSS v4 and shadcn/ui. It is broadly aligned with DIGIT principles at the token and structural level: all colours are defined as CSS custom properties, semantic roles exist for success/warning/destructive/info, and the wizard flow correctly implements a stepper with back navigation and draft persistence. The two most significant risk areas are **accessibility** (critical gaps in ARIA labelling, keyboard-focus rings on inline buttons, and colour-as-sole-status-indicator in StatusChip) and **typography hierarchy** (a narrow, compressed scale dominated by `text-xs`/`text-sm` that collapses multiple semantic levels into indistinguishable sizes). Positive highlights include consistent token-only colour usage across all components, safe-area-inset handling for iOS, and a dedicated `--destructive` token applied coherently to error states.

---

## Audit Scope

The following files were reviewed:

| Category | Files |
|----------|-------|
| Theme / tokens | `src/styles.css` |
| Navigation | `src/components/citizen/AppHeader.tsx`, `src/components/citizen/BottomTabBar.tsx`, `src/components/citizen/FlowHeader.tsx`, `src/routes/__root.tsx`, `src/routes/_app.tsx` |
| Pages | `src/routes/_app.home.tsx`, `src/routes/_app.services.tsx`, `src/routes/_app.applications.tsx`, `src/routes/_app.documents.tsx`, `src/routes/_app.profile.tsx`, `src/routes/apply.$serviceId.tsx`, `src/routes/applications.$arn.tsx`, `src/routes/auth.tsx`, `src/routes/pay.$arn.tsx`, `src/routes/success.$arn.tsx`, `src/routes/notifications.tsx` |
| Shared components | `src/components/citizen/FormFieldRenderer.tsx`, `src/components/citizen/StatusChip.tsx`, `src/components/citizen/WizardProgress.tsx`, `src/components/citizen/WizardFooter.tsx` |
| UI primitives | `src/components/ui/button.tsx`, `src/components/ui/dialog.tsx`, `src/components/ui/sonner.tsx` |

---

## Gap Summary Table

| # | Area | Gap | Severity | File / Location |
|---|------|-----|----------|----------------|
| 1 | Typography | No defined typographic scale — scale collapses to 3 near-identical sizes | Major | `styles.css`, every route file |
| 2 | Typography | Page `<h1>` uses `text-lg` (18px) — same visual weight as section `<h2>` at `text-sm` font-semibold | Major | `apply.$serviceId.tsx` L179, `_app.home.tsx` L45 |
| 3 | Typography | Text sizes use ad-hoc bracket values: `text-[11px]`, `text-[10px]`, `text-[9px]`, `text-[22px]` outside any scale | Major | `_app.home.tsx`, `applications.$arn.tsx`, `auth.tsx`, `_app.applications.tsx` |
| 4 | Typography | Label casing: form labels rendered ALL CAPS (`uppercase tracking-wide`) rather than Sentence case | Minor | `FormFieldRenderer.tsx` L20, `auth.tsx` L91/116/144 |
| 5 | Typography | Button label casing inconsistent — some Title Case ("Send OTP"), some sentence case ("Skip for now") | Minor | `auth.tsx` L105, `WizardFooter.tsx` L30 |
| 6 | Colour | `StatusChip` communicates status by colour alone — no icon or text differentiation between `submitted` and `in_review` (both map to `bg-info-soft text-brand-navy`) | Critical | `StatusChip.tsx` L4–10 |
| 7 | Colour | `StatusBadge` in Applications page collapses `submitted` and `in_review` into identical colour treatment with no icon | Critical | `_app.applications.tsx` L117–128 |
| 8 | Colour | `info` semantic colour role is missing from the design token system — `--info` (foreground) token absent; only `--info-soft` background present | Major | `styles.css` |
| 9 | Colour | `--warning-foreground` resolves to dark text `oklch(0.22 0.05 260)` against `--warning-soft` background — contrast likely insufficient for small text; no `warning-bg` token named to DIGIT convention | Major | `styles.css` L119–120 |
| 10 | Colour | Active tab in BottomTabBar distinguished by colour alone (`text-brand-teal` vs `text-muted-foreground`) — no bold weight, underline, or shape differentiator | Major | `BottomTabBar.tsx` L22–23 |
| 11 | Spacing | Arbitrary spacing values throughout: `px-2.5`, `py-1.5`, `gap-1.5`, `py-0.5`, `py-2.5`, `pt-3`, `pb-[max(...)]` — not on a 4px base-grid token system | Major | `WizardFooter.tsx`, `FormFieldRenderer.tsx`, `AppHeader.tsx`, `applications.$arn.tsx` |
| 12 | Spacing | No custom spacing tokens defined; Tailwind's default scale is used which includes non-4px-multiple values (e.g. `space-y-1.5` = 6px, `gap-0.5` = 2px) | Major | `styles.css` — `@theme inline` block has no `--spacing-*` tokens |
| 13 | Component | `FormFieldRenderer` radio buttons are implemented as `<button>` elements, not `<input type="radio">` — loses native radio group keyboard navigation (arrow keys) and semantic grouping | Critical | `FormFieldRenderer.tsx` L57–77 |
| 14 | Component | File upload uses a `<label>` wrapping a hidden `<input type="file">` — the inner `<input>` has no `id` linked to the outer label (label wraps input, but the visible label element `labelEl` rendered separately above is not associated via `htmlFor`) | Major | `FormFieldRenderer.tsx` L82–103, L119 |
| 15 | Component | `WizardProgress` progress segments are purely decorative `<div>` elements — no `role="progressbar"`, no `aria-valuenow`/`aria-valuemax`, no screen-reader text | Major | `WizardProgress.tsx` L14–19 |
| 16 | Component | Multiple primary-emphasis buttons in single view on `applications.$arn.tsx` — "Pay Now" (brand-teal), "Start New Application" (brand-teal), "Download PDF" — violates one-primary-per-view rule | Major | `applications.$arn.tsx` L163–168, L307–313 |
| 17 | Component | `auth.tsx` has no `<form>` element wrapping inputs — prevents native Enter-key submission and browser autofill association | Major | `auth.tsx` L88–162 |
| 18 | Component | Loading states ("Loading…") are plain text with no spinner/skeleton — not communicated to assistive technology (`aria-live`, `role="status"`) | Major | `_app.tsx` L13, `apply.$serviceId.tsx` L81, `applications.$arn.tsx` L52 |
| 19 | Component | Empty states lack illustration/icon and CTA — only dashed-border text ("No applications yet. Start with a service above.") | Minor | `_app.home.tsx` L103, `notifications.tsx` L27, `_app.documents.tsx` L27/44 |
| 20 | Accessibility | `AppHeader` breadcrumb `<nav>` has no `aria-label` to distinguish it from the `BottomTabBar` `<nav>` — two unlabelled `<nav>` landmarks on every authenticated page | Major | `AppHeader.tsx` L28, `BottomTabBar.tsx` L14 |
| 21 | Accessibility | Logo `<img>` in `AppHeader` and `FlowHeader` uses `alt=""` — acceptable for decorative use, but the image carries brand identity and the adjacent text is not programmatically associated as a group label for the header region | Minor | `AppHeader.tsx` L20, `FlowHeader.tsx` L22 |
| 22 | Accessibility | Notification bell button in home page has no `aria-label` — icon-only interactive element without accessible name | Critical | `_app.home.tsx` L30 |
| 23 | Accessibility | `BottomTabBar` active item has no `aria-current="page"` — screen readers cannot identify the current section | Major | `BottomTabBar.tsx` L20–32 |
| 24 | Accessibility | Download button in `DocumentRow` has `aria-label="Download"` but "View" button has none — both are icon-adjacent; "View" is ambiguous for screen readers when multiple rows present | Major | `applications.$arn.tsx` L372, L381 |
| 25 | Accessibility | `WizardFooter` Back and Next buttons have no `disabled` cursor style override beyond `disabled:opacity-40/50` — no `cursor-not-allowed` on disabled Back button | Minor | `WizardFooter.tsx` L37–44 |
| 26 | Accessibility | `button.tsx` uses `focus-visible:ring-1` — a 1px focus ring does not meet the WCAG 2.1 AA requirement of a clearly visible focus indicator with sufficient contrast | Major | `button.tsx` L8 |
| 27 | Accessibility | Inline `<button>` elements throughout route files (e.g. payment card accordion, filter tabs, document rows) use manually composed Tailwind classes with `hover:` states only — no `focus-visible:` ring, making keyboard navigation invisible | Critical | `applications.$arn.tsx` L128, `_app.applications.tsx` L39–47, `FormFieldRenderer.tsx` L63–72 |
| 28 | Accessibility | `<select>` in `FormFieldRenderer` inherits `baseInput` class which has no `focus-visible:ring` — browser default focus ring removed by `focus:outline-none` with only `focus:ring-2 focus:ring-brand-teal/30` (low contrast at 30% opacity) | Major | `FormFieldRenderer.tsx` L17–18 |
| 29 | Accessibility | Toast `Toaster` is positioned `top-center` on mobile (correct) but has no `aria-live` region configuration beyond Sonner's default — error persistence for payment failures not guaranteed | Minor | `__root.tsx` L143, `sonner.tsx` |
| 30 | Responsiveness | App shell constrains all views to `max-w-[420px]` — on desktop/tablet the layout renders as a narrow column with no responsive grid adaptation; tablet/desktop breakpoints effectively unused | Major | `_app.tsx` L20, `apply.$serviceId.tsx` L173, `applications.$arn.tsx` L74 |
| 31 | Responsiveness | `AppHeader` breadcrumb wraps at narrow widths but the title+action row (`flex items-center justify-between`) can cause the `<h1>` to be severely truncated when the action chip is wide | Minor | `AppHeader.tsx` L44 |
| 32 | Responsiveness | `BottomTabBar` is hidden on desktop layouts — no equivalent side navigation or top navigation is added at ≥768px breakpoints | Major | `BottomTabBar.tsx` — no `md:hidden` or alternative desktop nav |
| 33 | Responsiveness | `DetailRow` in application detail uses `grid-cols-[120px_1fr]` fixed left column — on very narrow screens (<360px) the 120px column leaves insufficient space for the value | Minor | `applications.$arn.tsx` L344 |

---

## Detailed Findings

### 1. Typography

#### Compliant
- A single consistent font family (`Inter` via Google Fonts) is used across the entire application, loaded in `__root.tsx`.
- Font weights are limited to 400 (implicit), 500 (`font-medium`), 600 (`font-semibold`), and 700 (`font-bold`) — within the 2–3 weight guideline.
- Line-height behaviour uses Tailwind's defaults which approximate the 1.37× body requirement for text content.
- The `<h1>` semantic element is correctly used for page-level titles on wizard steps (`apply.$serviceId.tsx`) and auth page (`auth.tsx`).

#### Gaps

**Gap 1 — Collapsed scale with no distinct heading levels**
The application's visual type scale effectively uses only three sizes: approximately 11px (arbitrary), 12–13px (`text-xs`), and 14–16px (`text-sm`/`text-base`). The DIGIT scale requires six distinct heading levels plus three body levels. Section headings on every page (`<h2>`) use `text-sm font-semibold` — the same computed size as body paragraph text and label text — making semantic hierarchy invisible to sighted users. There are no tokens for `--font-size-heading-l`, `--font-size-heading-m`, etc.
*Recommended fix:* Define `--font-size-heading-xl` through `--font-size-body-xs` in the `@theme inline` block and replace ad-hoc Tailwind size classes with semantic utility classes mapped to those tokens.

**Gap 2 — Page `<h1>` visually underpowered**
In `apply.$serviceId.tsx` (L179) the step title `<h1>` uses `text-lg font-bold` (18px). The page-level title on home (`_app.home.tsx` L45, `AppHeader.tsx` L45) uses `text-lg font-semibold`. Neither reaches the 32–40px range expected for `headingXl`. In `auth.tsx` (L77) `text-[22px]` is closer but is an arbitrary bracket value.
*Recommended fix:* Establish a `headingXl` token at ≥28px and apply it to all route `<h1>` elements.

**Gap 3 — Arbitrary pixel sizes outside any scale**
The codebase uses `text-[11px]` (many files), `text-[10px]` (`_app.applications.tsx` L79), `text-[9px]` (`_app.home.tsx` L67), and `text-[22px]` (`auth.tsx` L77). These are not on the 4px grid and have no token backing. Nine separate instances of `text-[11px]` were found across route files.
*Recommended fix:* Map all three sizes to named tokens: `captionS` → 10px, `captionM` → 12px. Remove all bracket values.

**Gap 4 — Form label casing violates DIGIT rule**
`FormFieldRenderer.tsx` (L20) renders all field labels as `uppercase tracking-wide` — forced ALL CAPS via CSS, not reflecting sentence case. DIGIT mandates sentence case for labels. The same pattern appears in `auth.tsx` (L91, L116, L144) and `applications.$arn.tsx` section sub-labels.
*Recommended fix:* Remove `uppercase` class from label elements; apply sentence case in the label strings directly.

**Gap 5 — Inconsistent button label casing**
Primary CTA buttons ("Send OTP", "Verify & Continue", "Pay Now", "Submit" — Title Case) are correct. However, the skip button in `WizardFooter.tsx` (L30) reads "Skip for now" (sentence case) and the "See all" links on the home page use sentence case. Consistency is required.
*Recommended fix:* Apply Title Case to all interactive button/link labels.

---

### 2. Colour & Contrast

#### Compliant
- All colours in component files reference Tailwind utility classes that resolve to CSS custom properties (`--brand-teal`, `--success`, `--warning`, `--destructive`, etc.). No hardcoded hex values were found in any component or route file.
- Semantic colours are applied coherently: `text-destructive` and `bg-destructive` are used exclusively for error states and destructive actions across all files reviewed.
- `--success`, `--success-soft`, `--warning`, `--warning-soft`, `--destructive` tokens all exist in `:root`.
- OKLCH colour space is used throughout, which allows perceptually uniform contrast evaluation.
- Dark mode token overrides are defined in `.dark {}` — theme switching is architecturally supported.

#### Gaps

**Gap 6 — StatusChip uses colour as sole status differentiator (Critical)**
`StatusChip.tsx` (L4–10): the `submitted` and `in_review` variants both map to `bg-info-soft text-brand-navy` — they are visually identical. A user who cannot distinguish colours cannot tell whether their application has been submitted or is under review. The component renders only a text label; no icon is included.
Similarly, `approved` and `issued` share the same `bg-success-soft text-success` class, with no icon or shape difference.
*Recommended fix:* Add a variant-specific icon beside the label in `StatusChip` (e.g. Clock for `in_review`, CheckCircle for `approved`, Award for `issued`, AlertCircle for `rejected`) and differentiate `submitted` vs `in_review` with distinct background tokens (`bg-info-soft` vs `bg-brand-teal/10`).

**Gap 7 — `StatusBadge` in Applications page repeats the same colour-only problem (Critical)**
`_app.applications.tsx` (L117–128): `submitted` and `in_review` both render `bg-info-soft text-brand-teal-deep` with no icon.
*Recommended fix:* Consolidate `StatusChip` and `StatusBadge` into one component and apply the icon fix above.

**Gap 8 — Missing `--info` (foreground) token**
`styles.css`: The system defines `--info-soft` (background tint) but no `--info` foreground token. The DIGIT colour system requires `info` and `info-bg` as distinct named roles. Code works around this by using `text-brand-teal-deep` as the info text colour — an informal alias that is not semantically named and could break if the brand colour is updated.
*Recommended fix:* Add `--info: oklch(0.48 0.12 200)` and `--color-info: var(--info)` to the token system.

**Gap 9 — Warning foreground contrast on soft background**
`styles.css` (L119–120): `--warning: oklch(0.75 0.16 75)` (a light amber) is used as the text colour on `--warning-soft: oklch(0.95 0.07 80)` background. Both are very light; the contrast ratio between `oklch(0.75…)` text and `oklch(0.95…)` background is estimated at approximately 2.5:1 — below the 4.5:1 WCAG AA requirement for normal text. The "Payment Pending" badge and payment card label are affected.
*Recommended fix:* Use `--warning-foreground` (`oklch(0.22 0.05 260)`) consistently as the text colour on `warning-soft` backgrounds, as is done in `WizardFooter`'s Pay Now banner but not in `StatusChip`/`StatusBadge`.

**Gap 10 — Active nav tab is colour-only**
`BottomTabBar.tsx` (L22–23): the active tab is indicated solely by switching from `text-muted-foreground` to `text-brand-teal`. There is no bold weight change, no top/bottom border, no underline, and no background fill to provide a non-colour indicator.
*Recommended fix:* Add `font-semibold` and a 2px top border (`border-t-2 border-brand-teal`) to the active tab's `activeProps`.

---

### 3. Spacing

#### Compliant
- Section-level spacing uses Tailwind's 4/5/6 scale classes (`mt-4`, `mt-5`, `mt-6`, `space-y-4`) which correspond to 16/20/24px — consistent with DIGIT's `spacer4`–`spacer6` range.
- Card internal padding is consistently `p-3` or `p-4` (12/16px) across the application.
- Gap between icon and label in navigation items is consistently `gap-1` or `gap-2`.

#### Gaps

**Gap 11 — No custom spacing token layer**
`styles.css`: The `@theme inline` block defines radius tokens and colour tokens but zero spacing tokens. DIGIT requires all spacing values to come from named tokens (`--spacing-4`, `--spacing-8`, etc.) so that the base grid can be changed globally. Currently the app relies entirely on Tailwind's default spacing scale, which includes non-4px-grid values (1.5 = 6px, 2.5 = 10px, 3.5 = 14px) used liberally throughout.
*Recommended fix:* Add `--spacing-1` through `--spacing-12` in `@theme inline` mapped to 4px increments; then audit and replace all `.5` fractional Tailwind classes.

**Gap 12 — Widespread use of fractional spacing classes**
A non-exhaustive sample of values outside the 4px grid: `px-2.5` (10px), `py-1.5` (6px), `gap-1.5` (6px), `py-0.5` (2px), `pb-[max(env(safe-area-inset-bottom),0.25rem)]` (variable), `mt-0.5` (2px), `gap-0.5` (2px). These appear in `WizardFooter.tsx` (L27), `FormFieldRenderer.tsx` (L18), `AppHeader.tsx` (L19), `BottomTabBar.tsx` (L24), and most route files.
*Recommended fix:* After defining spacing tokens, systematically replace: `py-1.5` → `py-1` or `py-2`; `px-2.5` → `px-2` or `px-3`; `gap-1.5` → `gap-2`.

---

### 4. Component Behaviour

#### Compliant
- `WizardProgress` correctly shows step count and progress to the user, fulfilling the Stepper requirement for multi-step forms.
- `WizardFooter` always provides a Back button, preserving entered data between steps (draft is saved via `saveDraft`).
- The wizard validates on Next (blur-equivalent for multi-step) and preserves user input on validation errors — `setErrors` replaces rather than clears form values.
- `FormFieldRenderer` renders labels above every input field, never using placeholder as the sole label.
- Required fields are marked with `*` (L22: `<span className="ml-0.5 text-destructive">*</span>`).
- Inline error messages appear directly below each field using `text-destructive` (`FormFieldRenderer.tsx` L124).
- The Dialog component (`dialog.tsx`) is built on Radix UI `DialogPrimitive` which handles focus trapping, Escape-to-close, and `role="dialog"` automatically.
- The shadcn/ui `Button` component includes proper `disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed` states.
- Toast notifications use Sonner with `richColors` and `position="top-center"`.

#### Gaps

**Gap 13 — Radio buttons are `<button>` elements, breaking keyboard semantics (Critical)**
`FormFieldRenderer.tsx` (L57–77): the `radio` field type renders a row of `<button type="button">` elements styled to look like radio chips. This breaks the standard radio-group interaction contract: arrow-key navigation between options does not work (Tab would move between each chip individually), there is no `role="radio"` or `role="radiogroup"`, and screen readers will announce each as a generic button with no indication that these are mutually exclusive choices.
*Recommended fix:* Replace with `<input type="radio">` inside a `<fieldset>/<legend>` grouping, or use `role="radiogroup"` on the container and `role="radio"` with `aria-checked` on each button.

**Gap 14 — File input label association broken**
`FormFieldRenderer.tsx` (L82–103, L119): The component renders two separate label elements — the visible field label (`labelEl`) generated at L19–24 and the file drop target `<label>` at L82. The inner `<input type="file" className="hidden">` is correctly wrapped by the drop-target label (so clicking the drop zone opens the file picker). However, the visible field label above (rendered via `{labelEl}` at L119) has no `htmlFor` pointing to the `<input>` id. The `<input>` itself has no `id` attribute at all. Screen readers cannot associate the field name with the file picker.
*Recommended fix:* Add `id={field.id}` to the `<input type="file">` and `htmlFor={field.id}` to `labelEl`.

**Gap 15 — WizardProgress not accessible to screen readers**
`WizardProgress.tsx` (L14–19): The progress bar segments are bare `<div>` elements. There is no `role="progressbar"`, no `aria-valuenow={current + 1}`, no `aria-valuemax={total}`, and no `aria-label`. The "Step X of Y" text above is visually present but is not programmatically linked to the progress indicator.
*Recommended fix:* Add `role="progressbar" aria-valuenow={current + 1} aria-valuemax={total} aria-label={`Step ${current + 1} of ${total}: ${stepLabel}`}` to the container div.

**Gap 16 — Multiple primary-emphasis buttons on one view**
`applications.$arn.tsx` (L163–168 and L307–313): The application detail page can simultaneously show a teal "Pay Now" CTA inside the payment card and a teal "Start New Application" button in the "What next?" section. Both use `bg-brand-teal` — the same primary colour. DIGIT mandates one primary action per view.
*Recommended fix:* Demote "Go to Home" and "View My Applications" to outline/ghost variants and keep only "Start New Application" as primary. If "Pay Now" is present, that becomes the single primary action and the "What next?" section should use secondary/outline buttons only.

**Gap 17 — Auth form lacks `<form>` element**
`auth.tsx`: All three stages (phone, OTP, name) render inputs and buttons as sibling `<div>` children with no wrapping `<form>` element. This means the Enter key does not trigger submission, browser autofill is not associated, and password managers cannot identify the field purpose.
*Recommended fix:* Wrap each stage's content in `<form onSubmit={...}>` with a `<button type="submit">` for the primary action.

**Gap 18 — Loading states not communicated to assistive technology**
Multiple files render `<div className="grid min-h-svh place-items-center text-sm text-muted-foreground">Loading…</div>` (e.g. `_app.tsx` L13, `apply.$serviceId.tsx` L81, `pay.$arn.tsx` L24) with no `role="status"` or `aria-live="polite"`. Screen readers will not announce these loading states.
*Recommended fix:* Add `role="status" aria-live="polite"` to all loading placeholder elements.

**Gap 19 — Empty states lack illustration/icon and CTA**
The documents page (`_app.documents.tsx` L27, L44), notifications page (`notifications.tsx` L27), and home page recent applications (`_app.home.tsx` L103) all use plain text inside dashed borders for empty states. DIGIT requires an illustrated icon + descriptive message + call-to-action.
*Recommended fix:* Add a relevant Lucide icon (e.g. `Inbox`, `Bell`, `FileX`) and a `<Link>` CTA (e.g. "Apply for a service") to each empty state container.

---

### 5. Accessibility

#### Compliant
- The Radix Dialog primitive (`dialog.tsx`) provides correct focus trap, `role="dialog"`, `aria-modal`, `aria-labelledby`, and Escape-to-close out of the box.
- Download icon buttons in `DocumentRow` (`applications.$arn.tsx` L376) have `aria-label="Download"`.
- `<img>` elements use `alt=""` when decorative (logo images in headers) — correct for decorative usage.
- The `<html lang="en">` attribute is set in `__root.tsx` (L119), enabling correct screen reader language selection.
- Interactive disabled states are implemented on form buttons via `disabled` HTML attribute.
- Viewport meta tag includes `width=device-width, initial-scale=1` (`__root.tsx` L81) — no zoom-blocking `user-scalable=no`.
- `BottomTabBar` uses a `<ul>/<li>` list structure — correct for navigation item groups.

#### Gaps

**Gap 20 — Multiple unlabelled `<nav>` landmarks**
`AppHeader.tsx` (L28): breadcrumb `<nav>` has no `aria-label`. `BottomTabBar.tsx` (L14): bottom tab `<nav>` has no `aria-label`. Every authenticated page therefore has two unnamed navigation landmarks, making it impossible for screen reader users to distinguish them via landmark navigation (e.g. "navigate to navigation").
*Recommended fix:* Add `aria-label="Breadcrumb"` to the breadcrumb nav and `aria-label="Main navigation"` to the BottomTabBar nav.

**Gap 22 — Notification bell icon button has no accessible name (Critical)**
`_app.home.tsx` (L30–37): The bell icon button is rendered as `<Link … className="relative grid h-9 w-9 place-items-center rounded-full …">` with only a `<Bell>` SVG icon child and a badge `<span>` for count. There is no `aria-label` on the link. Screen readers will announce this as an unlabelled interactive element.
*Recommended fix:* Add `aria-label={unreadCount > 0 ? \`${unreadCount} unread notifications\` : "Notifications"}` to the Link element.

**Gap 23 — Active nav tab lacks `aria-current`**
`BottomTabBar.tsx` (L20–32): The `Link` component sets active styling via `activeProps.className` but adds no `aria-current="page"` attribute to the active link. Screen reader users cannot identify the current section.
*Recommended fix:* Add `activeProps={{ className: "text-brand-teal font-semibold border-t-2 border-brand-teal", "aria-current": "page" }}` to each Link.

**Gap 24 — "View" button in DocumentRow is ambiguous for screen readers**
`applications.$arn.tsx` (L381–388): The "View" button has no `aria-label`. When a page contains multiple document rows, a screen reader user will hear "View, button" repeated with no context of which document is being viewed.
*Recommended fix:* Add `aria-label={\`View \${title}\`}` to each View button, and similarly `aria-label={\`Download \${title}\`}` to complement the existing generic `aria-label="Download"`.

**Gap 26 — Focus ring too thin in shadcn Button primitive**
`button.tsx` (L8): `focus-visible:ring-1` produces a 1px focus ring. WCAG 2.1 Success Criterion 2.4.11 (Focus Appearance, AA in WCAG 2.2) requires a focus indicator with at least a 2px perimeter and 3:1 contrast against adjacent colours. A 1px ring that uses `--ring` (a mid-tone teal) against a white card background may not meet this threshold.
*Recommended fix:* Change to `focus-visible:ring-2 focus-visible:ring-offset-2` in `buttonVariants`.

**Gap 27 — Inline buttons throughout route files have no keyboard focus ring (Critical)**
Many `<button>` elements in route files are composed with manual Tailwind classes without a `focus-visible:` variant. Examples:
- Filter tabs in `_app.applications.tsx` (L39–47): `rounded-full px-3 py-1.5 text-xs font-semibold` — no `focus-visible:ring`.
- Payment card accordion button in `applications.$arn.tsx` (L128–135): no `focus-visible:`.
- Radio chip buttons in `FormFieldRenderer.tsx` (L63–72): no `focus-visible:ring`.
These inline buttons are effectively invisible to keyboard users navigating with Tab.
*Recommended fix:* Add `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal focus-visible:ring-offset-2` to all manually composed interactive buttons, or refactor to use the shared `Button` component.

**Gap 28 — Focus ring contrast degraded by opacity on inputs**
`FormFieldRenderer.tsx` (L17–18): All inputs use `focus:ring-2 focus:ring-brand-teal/30`. The `/30` opacity modifier on the ring colour reduces contrast of the focus indicator to approximately 30% of the base colour's contrast ratio — likely falling below 3:1 against a white background.
*Recommended fix:* Use `focus:ring-brand-teal` (full opacity) or `focus:ring-2 focus:ring-offset-1 focus:ring-brand-teal`.

---

### 6. Responsiveness

#### Compliant
- All route-level view containers use `max-w-[420px] mx-auto` — content never overflows horizontally at mobile widths.
- `BottomTabBar` and `WizardFooter` use `pb-[max(env(safe-area-inset-bottom),…)]` to handle iOS safe-area insets correctly.
- The `BottomTabBar` uses a 5-column CSS grid (`grid-cols-5`) that remains legible at 320px minimum width.
- `AppHeader` breadcrumbs use `flex-wrap` to prevent horizontal overflow on narrow screens.
- The authentication page and wizard apply flow constrain to `max-w-[420px]` — no horizontal scroll risk.
- The `DetailRow` `break-words` class on value cells prevents text overflow.

#### Gaps

**Gap 30 — No responsive adaptation above 420px (Major)**
`_app.tsx` (L20), `apply.$serviceId.tsx` (L173), `applications.$arn.tsx` (L74): every screen is constrained to `max-w-[420px]` with no responsive breakpoint that widens the layout for tablet (768px+) or desktop (1025px+). On a 1440px desktop, the entire application renders as a 420px strip in the centre with empty grey margins. DIGIT requires two-column layouts at tablet and full layouts at desktop.
*Recommended fix:* At `md:` breakpoint, convert the main authenticated shell (`_app.tsx`) to a two-column layout with a persistent side navigation replacing the `BottomTabBar`. At `lg:` breakpoint, allow content areas to expand to a wider grid (e.g. `max-w-3xl` with a form sidebar).

**Gap 32 — No desktop/tablet navigation — BottomTabBar is the only nav (Major)**
`BottomTabBar.tsx`: There is no `md:hidden` on the BottomTabBar and no side navigation component at wider breakpoints. At tablet and desktop widths the BottomTabBar remains at the bottom, which is an uncommon and less usable pattern outside of mobile. DIGIT specifies "Side nav collapses; hamburger toggle visible on mobile/tablet" implying a side nav for desktop.
*Recommended fix:* Create a `SideNav` component shown at `md:` and above; hide `BottomTabBar` on `md:` and above using `md:hidden` on the nav element.

**Gap 33 — Fixed 120px column in DetailRow can break on very narrow screens**
`applications.$arn.tsx` (L344): `grid-cols-[120px_1fr]` means on a 320px-wide screen, the value column is only 200px minus padding. For longer values like application IDs this is acceptable due to `break-words`, but short label text (e.g. "ID Type") in a fixed column with no wrapping can produce whitespace waste.
*Recommended fix:* Use `grid-cols-[auto_1fr]` with a `min-w-[80px] max-w-[120px]` constraint on the label column, or switch to a stacked layout on very narrow screens.

---

## Severity Definitions

| Severity | Definition |
|----------|-----------|
| **Critical** | Fails WCAG AA / breaks core usability for users with disabilities or in degraded conditions |
| **Major** | Inconsistent with DIGIT principles; degrades experience or creates meaningful inconsistency |
| **Minor** | Polish or consistency issue; does not break usability but diverges from the standard |
