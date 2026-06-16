## Two bugs to fix in `ServiceConfig.tsx` + branding

### Bug 1 — Overview tab silently renders the Manage screen

In `src/pages/ServiceConfig.tsx` (line 286), the content router is:

```tsx
{mode === "overview" && service ? (
  <OverviewWorkspace ... />
) : mode === "configure" ? ( ... )
  : mode === "preview" ? ( ... )
  : mode === "operations" ? ( ... )
  : ( <DeploymentWorkspace /> )   // catch-all = Manage
}
```

When `mode === "overview"` but `service` is `undefined` (service not yet hydrated from localStorage, or `id` doesn't match an entry in `state.services`), the condition fails and the chain falls through to the final `else` — which renders **Manage** (the screenshot the user just sent: Overview tab active, Manage content shown).

Fix:
- Split the overview branch from the service-existence check. Render `OverviewWorkspace` whenever `mode === "overview"` and the service exists; when the service isn't found, render a small empty state ("Loading service…" or "Service not found") instead of falling through to Manage.
- Add an explicit `mode === "deployment"` guard before the final `DeploymentWorkspace` render so an unknown mode never silently lands on Manage again.

### Bug 2 — Theme color flips when switching services/screens

Two sources of inconsistency:

1. **Conflicting default brand colors.**
   - `src/hooks/useBranding.ts` → `DEFAULT_BRANDING.primaryColor = "#0D9488"` (teal).
   - `src/pages/BrandingTheme.tsx` → first-time form defaults to `"#C84C0E"` (DIGIT orange).
   Result: a service that has never been opened in Branding & Theme uses **teal**, but as soon as the user saves Branding the service flips to **orange** (or whatever they picked). The orange `Go Live` button in the screenshot is exactly this — a saved per-service branding overriding the default.
   
   Fix: pick a single canonical default and use it in both files. Per memory the project default is the deep blue / teal accent, so set both to the same `DEFAULT_BRANDING` value imported from `useBranding.ts` (BrandingTheme should initialize its state from `DEFAULT_BRANDING`, not from a hardcoded orange).

2. **Preview wraps in `<BrandingScope>` without `applyToRoot`.**
   `src/components/preview/ServicePreview.tsx` (line 140) sets CSS vars only on its inner div, while `AppLayout` writes them to `<html>` via `applyToRoot`. Portals (tooltips, dropdowns, toasts) rendered while in Preview keep the previous root vars, so the theme appears to "jump" between Preview and other tabs.
   
   Fix: pass `applyToRoot` to the Preview's `BrandingScope` so portals inherit the same brand vars consistently. (The cleanup function already restores values on unmount, so leaving Preview returns to the AppLayout-managed vars.)

### Files touched
- `src/pages/ServiceConfig.tsx` — split overview branch, add explicit deployment guard, add not-found fallback.
- `src/hooks/useBranding.ts` — confirm canonical `DEFAULT_BRANDING`.
- `src/pages/BrandingTheme.tsx` — initialize state from `DEFAULT_BRANDING` instead of hardcoded `#C84C0E` / `"Roboto"` / `"4px"`.
- `src/components/preview/ServicePreview.tsx` — add `applyToRoot` to the `BrandingScope` wrapper.

### Out of scope
- No business logic changes, no schema changes, no new routes or components.
- Existing per-service saved branding values are preserved untouched.