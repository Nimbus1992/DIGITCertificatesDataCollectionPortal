# DIGIT Design System Principles

> Source: [design.digit.org](https://design.digit.org) and [docs.digit.org — DIGIT UI Components v0.2.0](https://docs.digit.org/platform/guides/developer-guide/ui-developer-guide/digit-ui-components0.2.0)
> License: Creative Commons Attribution 4.0 International

---

## How to Use This Document

This document defines the **principles and standards** that must be followed. It does not prescribe specific component libraries — components from shadcn/ui, Radix, MUI, or any other library are acceptable as long as they uphold these principles.

### What is customisable
| Area | Rule |
|------|------|
| **Theme colours** | May be customised per product/municipality brand |
| **Font family** | May be replaced with any legible typeface |
| **Font sizes** | Specific pixel values may be adjusted per product |
| **Component library** | Any library may be used |

### What must always be maintained
| Area | Non-negotiable |
|------|---------------|
| **Typographic hierarchy** | Clear, consistent size relationships across heading levels and body text |
| **Colour contrast** | WCAG 2.1 AA contrast ratios between all text and backgrounds |
| **Semantic colour roles** | Error, success, warning, info must be visually distinct and consistently applied |
| **Colour independence** | Colour must never be the only indicator of status or state |
| **Spacing system** | Consistent spacing scale — no arbitrary values |
| **Interactive states** | All interactive components must implement hover, active, focus, keyboard focus, and disabled states |
| **Accessibility** | Keyboard navigation, focus management, ARIA where needed |
| **Responsive behaviour** | All screens work across mobile, tablet, and desktop |
| **UX patterns** | Form validation, navigation structure, feedback patterns |

---

## 1. Design Philosophy

The DIGIT Design System is a universal design language built for digital public infrastructure. It rests on three core pillars:

| Pillar | What it means |
|--------|--------------|
| **Themeable** | All visual properties (colours, typography, spacing) are defined as tokens, not hardcoded values, enabling brand customisation without breaking consistency |
| **Responsive** | Every component adapts across mobile, tablet, and desktop breakpoints |
| **Accessible** | Built to WCAG 2.1 AA: sufficient contrast, keyboard navigation, screen reader support, no colour-only information |

### Atomic Design Structure

The system follows an atomic hierarchy:

```
Atoms  →  Molecules  →  Organisms
```

- **Atoms**: Smallest indivisible building blocks (Button, Input, Checkbox, etc.)
- **Molecules**: Two or more atoms working together as a functional unit (Header, Side Nav, Modal, etc.)
- **Organisms**: Complete interface sections composed of molecules and atoms

---

## 2. Foundation

### 2.1 Typography

Font family, specific pixel sizes, and font weights may be customised per product. The **relationships and hierarchy between levels must be preserved**.

#### Typographic Scale — Hierarchy Principles

The scale must include these distinct levels. Specific sizes may vary but the visual hierarchy between levels must be unambiguous:

| Level | Role | Hierarchy rule |
|-------|------|---------------|
| `headingXl` | Page-level titles, hero headings | Largest size in the system |
| `headingL` | Section headings | Clearly smaller than headingXl |
| `headingM` | Subsection headings | Clearly smaller than headingL |
| `headingS` | Card titles, grouped labels | Clearly smaller than headingM |
| `headingXS` | Overlines, micro-labels | Smallest heading level |
| `bodyL` | Primary body text | Comfortable reading size |
| `bodyS` | Secondary body, supporting text | Smaller than bodyL |
| `bodyXS` | Helper text, metadata | Smallest body level |
| `buttonL/linkL` | Large CTA labels, primary navigation links | — |
| `buttonM/linkM` | Standard buttons and links | — |
| `buttonS/linkS` | Compact buttons, inline links | — |
| `captionL/M/S` | Chart labels, image captions, timestamps | Below body scale |

**DIGIT reference sizes** (may be adjusted but proportions should be respected):
- headingXl: 32–40px, headingL: 24–32px, headingM: 20–24px, headingS: 16px, headingXS: 12–14px
- bodyL: 16–20px, bodyS: 14–16px, bodyXS: 12–14px
- Line height: 1.14× for headings, 1.37× for body and links

#### Typography Rules (mandatory regardless of customisation)

- **Maintain clear visual hierarchy** — each level must be unambiguously distinct from adjacent levels
- **Sentence case** for body text and labels
- **Title Case** for button labels (capitalise first letter of each word, except articles/conjunctions)
- **Underlines reserved exclusively for links** — never use underline for emphasis
- **Optimal line width**: 50–120 characters per line (target ~70) for readability
- **Tabular numbers** for numerical/data content, right-aligned
- Do not use full justification or right-alignment for body text
- Do not use more than 2–3 font weights — ensure weight differences are visually meaningful
- Responsive scale: heading and body sizes must increase or stay the same at wider breakpoints — never decrease

---

### 2.2 Colour

Exact colour values are customisable per product theme. The **roles, contrast requirements, and relationships between colours are mandatory**.

#### Required Colour Roles

Every product must define tokens for each of these roles:

| Role | Purpose | DIGIT reference |
|------|---------|----------------|
| `primary` | Primary actions, key interactive elements | `#C84C0E` |
| `primary-secondary` | Secondary brand, headers, accents | `#0B4B66` |
| `primary-bg` | Light tint background for primary colour | `#FBEEE8` |
| `text-primary` | Main body and heading text | `#363636` |
| `text-secondary` | Supporting, secondary text | `#787878` |
| `text-disabled` | Disabled state text | `#C5C5C5` |
| `surface-primary` | Main card/panel backgrounds | `#FFFFFF` |
| `surface-secondary` | Subtle alternate surface | `#FAFAFA` |
| `background` | Page-level background | `#EEEEEE` |
| `divider` | Lines and separators | `#D6D5D4` |
| `input-border` | Input field borders | `#505A5F` |
| `success` / `success-bg` | Positive outcomes, confirmation | `#00703C` / `#F1FFF8` |
| `error` / `error-bg` | Errors, destructive actions | `#B91900` / `#FFF5F4` |
| `warning` / `warning-bg` | Caution, pending, requires attention | `#EA8D00` / `#FFF9F0` |
| `info` / `info-bg` | Informational, neutral status | `#0057BD` / `#DEEFFF` |

#### Contrast Requirements (WCAG 2.1 AA — mandatory)

| Text type | Minimum contrast ratio |
|-----------|----------------------|
| Normal text (below 18px regular / 14px bold) | **4.5:1** against its background |
| Large text (18px+ regular or 14px+ bold) | **3:1** against its background |
| UI components (icons, borders, focus rings, buttons) | **3:1** against adjacent colours |
| Disabled elements | Exempt — but should be visually distinct from enabled |

#### Colour Usage Rules (mandatory)

- All colours must be defined as **design tokens** — no hardcoded hex values in component code
- **Semantic colours must be applied consistently**: error states always use the error colour, success always uses the success colour — never mixed
- Colour must **never be the sole indicator** of information — always pair with:
  - An icon (e.g. error icon with error colour)
  - A label or text (e.g. "Error: field is required")
  - A pattern or shape difference
- Limit visible colours on a single screen to **3–4 main colours** for visual coherence
- Custom theme colours must still pass WCAG contrast requirements

---

### 2.3 Spacing

A consistent spacing scale prevents visual inconsistency. The 4px base grid may be adjusted (some products use 8px base) but the principle of **using only predefined increments** is mandatory.

#### DIGIT Spacing Scale (reference — 4px base grid)

| Token | Value |
|-------|-------|
| `spacer1` | 4px |
| `spacer2` | 8px |
| `spacer3` | 12px |
| `spacer4` | 16px |
| `spacer5` | 20px |
| `spacer6` | 24px |
| `spacer7` | 28px |
| `spacer8` | 32px |
| `spacer9` | 36px |
| `spacer10` | 40px |
| `spacer11` | 44px |
| `spacer12` | 48px |

#### Spacing Rules (mandatory)

- Use only the predefined spacing scale — **no arbitrary values** (e.g. no 13px, 17px, 22px gaps)
- Small tokens (spacer1–3) for tight, inline spacing (icon-label gap, list item padding)
- Mid tokens (spacer4–6) for component internal padding
- Large tokens (spacer7–12) for section-level layout separation
- Avoid excessive whitespace — it reduces visual coherence and wastes screen area

---

## 3. Component Principles

> Components may come from any library (shadcn/ui, Radix, MUI, Ant Design, etc.). The following are the **behavioural and visual principles** each component type must uphold.

### 3.1 Buttons

| Principle | Requirement |
|-----------|------------|
| Variant hierarchy | Must have at minimum: Primary (high emphasis), Secondary (medium), Tertiary or Ghost (low emphasis) |
| Primary button rule | **One Primary button per view** — do not stack multiple high-emphasis actions |
| Label casing | Title Case |
| Interactive states | Hover, Active, Focus (mouse), Focus (keyboard), Disabled — all required |
| Disabled state | Visually distinct; `cursor: not-allowed`; no click event |
| Label length | Short, action-oriented text. Truncate on overflow with full text on hover/tooltip |
| Icon usage | Icons are supplementary — never icon-only buttons without tooltip or aria-label |
| Accessibility | Keyboard activatable; visible focus ring; meets contrast requirements |

### 3.2 Form Inputs

| Principle | Requirement |
|-----------|------------|
| Labels | Always visible above the input field — never use placeholder as the only label |
| Placeholder | Hint text only (example value), not a substitute for a label |
| Error state | Inline error message directly below the field in error colour + error icon |
| Helper text | Displayed below the field in secondary text colour |
| Required fields | Marked with `*`; explained at the top of the form ("* Required") |
| States | Default, Focus, Filled, Error, Disabled — all required |
| Input borders | Clearly visible in default state; changes on focus and error |

### 3.3 Alert / Status Indicators

| Principle | Requirement |
|-----------|------------|
| Semantic variants | Info, Success, Warning, Error — each visually distinct |
| Icon required | Each variant must include a corresponding icon (not colour alone) |
| Placement | Inline (within content) or as toast/notification — must not block primary content |
| Dismissibility | Toasts auto-dismiss; inline alerts may be persistent |

### 3.4 Navigation

| Principle | Requirement |
|-----------|------------|
| Global nav | Header (top) + Side Navigation (left) for authenticated app views |
| Contextual nav | Breadcrumbs below the header to reflect page hierarchy |
| Within-page | Tabs component for switching between content sections |
| Step flows | Stepper component for multi-step forms and workflows |
| Active state | Current page/section clearly distinguished in nav (not colour-only) |
| Mobile | Side nav collapses; hamburger toggle visible on mobile/tablet |
| Back navigation | Always available in multi-step flows |

### 3.5 Modals / Pop-ups

| Principle | Requirement |
|-----------|------------|
| Variants | Informational/action modal; Critical/destructive alert modal (distinct styling) |
| Focus trap | Focus must be trapped within the modal while open |
| Dismiss | Overlay click and close (×) button as standard dismiss mechanisms |
| Action limit | No more than 2 primary action buttons in a modal footer |
| Escape key | Must close the modal |
| Accessibility | `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing to heading |

### 3.6 Tables and Lists

| Principle | Requirement |
|-----------|------------|
| Column headers | Left-aligned for text; right-aligned for numbers |
| Status | Status values must use semantic colours + icons or labels (not colour alone) |
| Empty state | Illustrated empty state with a clear message and call-to-action |
| Loading state | Skeleton loaders or spinner while data loads |
| Pagination | Available for large datasets; page size configurable |

### 3.7 Loading States

| Principle | Requirement |
|-----------|------------|
| Inline loaders | Spinner or skeleton for component-level async operations |
| Page loaders | Full-page loader for initial page load or critical operations |
| Never block silently | A loading state must always be communicated to the user |

---

## 4. Interaction & Accessibility Standards

### 4.1 Interactive States

**Every interactive element must implement all states:**

| State | Visual treatment required |
|-------|--------------------------|
| Default | Resting appearance |
| Hover | Subtle background or colour change |
| Active / Mousedown | More prominent visual feedback (darker, bolder) |
| Focus (mouse) | Visible, or same as hover |
| **Focus (keyboard)** | **Clearly visible focus ring — meets 3:1 contrast** |
| Disabled | Greyed out; `pointer-events: none`; excluded from tab order |

### 4.2 Keyboard Accessibility

- All interactive elements reachable via `Tab` key
- Tab order follows the visual reading order (top-left → bottom-right)
- `Enter` or `Space` activates buttons, links, and controls
- `Escape` closes modals, drawers, dropdowns, and tooltips
- Arrow keys navigate within grouped controls (radio groups, tabs, dropdowns)
- Focus is returned to the trigger element when a modal or popover is closed

### 4.3 Colour Independence

- Status must never be communicated by colour alone
- Required: colour + icon, colour + label, or colour + pattern
- Examples:
  - Error field: red border + error icon + error text below
  - Success toast: green background + checkmark icon + "Saved successfully" text
  - Active nav item: accent colour + bold text + left border indicator

### 4.4 ARIA and Semantic HTML

- Use semantic HTML elements (`<button>`, `<nav>`, `<main>`, `<header>`, `<aside>`, etc.)
- `aria-label` or `aria-labelledby` on all interactive elements without visible text
- `aria-live="polite"` on dynamic content regions (toast notifications, form validation errors)
- `role="dialog"` + `aria-modal="true"` on modals
- `aria-expanded` on accordion and dropdown triggers
- `aria-current="page"` on active navigation items

### 4.5 Responsiveness

All screens must function at these breakpoints:

| Breakpoint | Range | Key behaviour |
|------------|-------|--------------|
| Mobile | 320px – 767px | Single column; hamburger nav; larger tap targets |
| Tablet | 768px – 1024px | 2-column layouts; collapsed or icon-only side nav |
| Desktop | 1025px+ | Full layouts; visible side nav; multi-column grids |

Rules:
- No horizontal scroll on any breakpoint
- Tap targets minimum **44×44px** on mobile
- Text does not overflow containers at any breakpoint
- Images and media are fluid, not fixed-width

---

## 5. UX Patterns

### 5.1 Form Patterns

- Label always above the input (not inside as placeholder)
- Validate on field blur (not on keystroke); validate all on submit
- Inline error message per field — directly below the input
- Mark required fields with `*` and explain at the top of the form
- Multi-step forms must show a Stepper component with progress
- Primary submit button disabled until all required fields are valid
- Provide a clear "Back" mechanism on multi-step forms that preserves entered data
- Never reset the form on a validation error — preserve user input

### 5.2 List / Inbox Patterns

- Filter controls above the list/table
- Sort available via column headers or filter bar
- Status shown via semantic colour + icon or label
- Empty state: illustration/icon + descriptive message + CTA
- Loading state: skeleton rows or spinner
- Pagination or infinite scroll for large datasets

### 5.3 Summary / Review Screens

- Read-only display of all data entered in previous steps
- Two-column label–value layout preferred
- Section-level "Edit" links to return to specific steps
- Primary confirm/submit button at the bottom

### 5.4 Feedback and Notifications

- Toast notifications for transient feedback (success/error after actions)
- Auto-dismiss toasts after 4–6 seconds; persist error toasts
- Toast positioned top-right (desktop) or top-centre (mobile)
- Alert Cards for persistent inline status messages
- Destructive actions (delete, cancel) require a confirmation modal

### 5.5 Navigation Structure

- **Global**: Header + Side Navigation for authenticated views
- **Contextual**: Breadcrumbs below the header for deep page hierarchies
- **Within-page**: Tabs for co-equal content sections
- **Step flows**: Stepper for multi-step forms and onboarding
- The current active item must always be visible and clearly indicated in navigation

### 5.6 Data Display and Analytics

- Use chart components for analytics — all charts must include text legends/labels (never colour-only)
- KPI/metric cards for dashboard summary statistics
- Status chips or tags for categorical data
- Tables for structured, sortable data

---

## 6. Token System

All visual properties must be defined as design tokens, not hardcoded values:

```
Design Tokens  →  CSS Custom Properties (--var-name)  →  Component Styles
```

| Token category | Examples |
|---------------|---------|
| `color.*` | `--color-primary`, `--color-error`, `--color-text-primary` |
| `typography.*` | `--font-family`, `--font-size-heading-l`, `--line-height-body` |
| `spacing.*` | `--spacing-4`, `--spacing-16` |
| `border-radius.*` | `--radius-sm`, `--radius-md` |
| `shadow.*` | `--shadow-sm` (use sparingly) |

**Rules:**
- No hardcoded hex, px, or rem values in component files — reference tokens
- Product/municipality themes override tokens, not component code
- All token overrides must still satisfy WCAG contrast requirements

---

## 7. Known Gaps in DIGIT Component Library (v0.2.0)

These are acknowledged incomplete areas in the DIGIT design system itself — flag these as **DIGIT-side gaps**, not app-side failures:

| Area | Status |
|------|--------|
| Screen reader / ARIA support | Incomplete across most components |
| Content/copywriting guidelines | Not yet defined |
| Dark mode system-wide theming | Partially supported (Header and Side Nav only) |
| Organism-level templates | Partially documented |

---

## 8. Audit Checklist

Use this when reviewing any screen or component:

### Typography
- [ ] Clear typographic hierarchy — heading levels unambiguously distinct from each other and from body text
- [ ] Consistent use of the defined type scale throughout (no ad-hoc sizes)
- [ ] Sentence case for body and labels; Title Case for buttons
- [ ] Underlines only on links
- [ ] Line length within 50–120 characters for body text
- [ ] Numerical data right-aligned with tabular figures

### Colour
- [ ] All colours reference design tokens — no hardcoded hex in components
- [ ] Semantic colours used correctly and consistently (error = error colour, always)
- [ ] Colour never the sole indicator — always paired with icon or label
- [ ] 4.5:1 contrast for body text; 3:1 for large text and UI components
- [ ] Focus ring visible with ≥ 3:1 contrast
- [ ] Maximum 3–4 dominant colours visible on any single screen

### Spacing
- [ ] All spacing values are multiples of the base grid (4px or 8px)
- [ ] No arbitrary spacing values
- [ ] Consistent internal padding within component types

### Components (any library)
- [ ] Button variant hierarchy respected (max 1 Primary per view)
- [ ] Input labels visible above fields; placeholder is hint-only
- [ ] Inline error messages present for all validation failures
- [ ] Modal traps focus; Escape to close; aria-modal applied
- [ ] Status indicators use icon + colour + text (never colour-only)

### Accessibility
- [ ] All interactive states implemented: hover, active, focus (mouse + keyboard), disabled
- [ ] Keyboard navigable — all interactive elements reachable via Tab
- [ ] Visible focus ring on keyboard focus
- [ ] Semantic HTML used throughout
- [ ] ARIA attributes on dynamic regions, modals, and unlabelled interactive elements

### Responsiveness
- [ ] No horizontal overflow at mobile (320px) breakpoint
- [ ] Navigation collapses to hamburger on mobile
- [ ] Tap targets ≥ 44×44px on mobile
- [ ] Text does not overflow containers at any breakpoint

---

*Based on DIGIT UI Components v0.2.0. Reference: [design.digit.org](https://design.digit.org) and [docs.digit.org](https://docs.digit.org/platform/guides/developer-guide/ui-developer-guide/digit-ui-components0.2.0)*
