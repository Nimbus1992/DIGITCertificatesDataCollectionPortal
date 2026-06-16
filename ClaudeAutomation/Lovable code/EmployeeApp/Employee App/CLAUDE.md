# EmployeeApp — Licenses & Permits (Employee/Officer Portal)

## Purpose
Internal portal for government employees/officers to process applications, conduct inspections, manage approvals, handle inbox queues, and generate reports for the Licenses & Permits system.

## Stack
- **Framework**: React 19 + TanStack Router v1 (file-based routing in `src/routes/`)
- **Meta-framework**: TanStack Start (SSR-capable, Cloudflare Workers compatible)
- **Build**: Vite 7 via `@lovable.dev/vite-tanstack-config`
- **UI**: Tailwind CSS v4, shadcn/ui (Radix primitives), Lucide icons
- **State**: TanStack Query v5
- **Forms**: react-hook-form + Zod
- **Spreadsheets**: xlsx (for report exports)
- **PDF**: jspdf
- **QR codes**: qrcode

## Dev
```bash
npm run dev        # starts dev server (port assigned by config — check terminal output)
npm run build
npm run lint
```

## Key Routes (file-based in `src/routes/`)
| File | Route | Description |
|------|-------|-------------|
| `index.tsx` | `/` | Root redirect |
| `login.tsx` | `/login` | Employee login |
| `_authenticated/route.tsx` | `/_authenticated/*` | Auth-gated layout |
| `_authenticated/dashboard.tsx` | `/_authenticated/dashboard` | Officer dashboard |
| `_authenticated/inbox.index.tsx` | `/_authenticated/inbox` | Application inbox |
| `_authenticated/inbox.$appId.tsx` | `/_authenticated/inbox/:appId` | Application detail & processing |
| `_authenticated/approvals.tsx` | `/_authenticated/approvals` | Approvals queue |
| `_authenticated/inspections.tsx` | `/_authenticated/inspections` | Inspections scheduling & management |
| `_authenticated/search.tsx` | `/_authenticated/search` | Search across applications |
| `_authenticated/reports.tsx` | `/_authenticated/reports` | Reports & analytics |
| `_authenticated/profile.tsx` | `/_authenticated/profile` | Employee profile |

## Source Layout
```
src/
  components/
    brand/           # Logo / branding components
    op/              # Operational processing components (application review, decisions)
    reports/
      tabs/          # Report tab views (by type/period)
    ui/              # shadcn/ui base components
  hooks/             # Custom React hooks
  lib/               # Utility functions
  routes/
    _authenticated/  # Auth-gated route components
```

## Notes
- `_authenticated/route.tsx` is the auth guard — all protected routes live under `_authenticated/`
- TanStack Router uses file-based routing — new routes = new files in `src/routes/`
- `wrangler.jsonc` is for Cloudflare Workers production deploy — not needed for local dev
- Do NOT manually add plugins already included by `@lovable.dev/vite-tanstack-config` (see vite.config.ts comments)
- `xlsx` is included for report export functionality (not in CitizenApp)
