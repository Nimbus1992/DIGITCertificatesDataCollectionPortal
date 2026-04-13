

# Branding & Theme — Inline Side Panel Layout

## Changes (all in `src/pages/BrandingTheme.tsx`)

### 1. Replace Sheet with inline left panel
Remove the `Sheet` component and the "Customize Theme" button. Instead, render the theme config controls as a permanent left panel in a 2-column flex layout: left panel (~380px, scrollable) with all config sections, right side (flex-1) with the live preview.

### 2. DIGIT Theme background → light grey
Change line 37: `bgColor: "#FFFFFF"` → `bgColor: "#F8FAFC"` (matching Civic Blue's light grey).

### 3. Layout structure

```text
┌──────────────────────────────────────────────────────────────┐
│  Header: Branding & Theme                      [Apply Theme] │
├─────────────────┬────────────────────────────────────────────┤
│ THEME CONFIG    │  LIVE PREVIEW                              │
│ (left, ~380px)  │  (right, flex-1)                           │
│                 │                                            │
│ Theme Presets   │  Citizen Portal mockup                     │
│ Font Family     │                                            │
│ Primary Colour  │                                            │
│ Logo Upload     │                                            │
│ Brand Guidelines│                                            │
│ Footer Copyright│                                            │
│ [Apply Theme]   │                                            │
└─────────────────┴────────────────────────────────────────────┘
```

### 4. Implementation details
- Remove `Sheet`, `SheetContent`, `SheetHeader`, `SheetTitle` imports and usage
- Remove `sheetOpen` state and "Customize Theme" button
- Remove `Settings2` icon import (no longer needed)
- Wrap content in a `flex gap-6` container; left panel is a `div` with `w-[380px] shrink-0 overflow-y-auto` and a border-right; right panel is `flex-1 min-w-0`
- Move all config sections (presets, font, swatches, logo, guidelines, copyright, apply button) into the left panel
- Keep the preview Card in the right panel

## File

| File | Action |
|------|--------|
| `src/pages/BrandingTheme.tsx` | Edit — restructure to inline 2-panel layout, update DIGIT bgColor |

