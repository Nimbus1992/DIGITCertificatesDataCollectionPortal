# CitizenApp — Licenses & Permits (Citizen Portal)

## Purpose
Public-facing portal for citizens to apply for licenses and permits (Business Licence, Building Permit, Fire NOC), track application status, pay fees, and download certificates.

## Stack
- **Framework**: React 19 + TanStack Router v1 (file-based routing in `src/routes/`)
- **Meta-framework**: TanStack Start (SSR-capable, Cloudflare Workers compatible)
- **Build**: Vite 7 via `@lovable.dev/vite-tanstack-config`
- **UI**: Tailwind CSS v4, shadcn/ui (Radix primitives), Lucide icons
- **State**: TanStack Query v5
- **Forms**: react-hook-form + Zod
- **PDF**: jspdf + html2canvas
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
| `index.tsx` | `/` | Landing / redirect |
| `auth.tsx` | `/auth` | Login / OTP |
| `_app.tsx` | `/_app/*` | Authenticated shell layout |
| `_app.home.tsx` | `/_app/home` | Dashboard |
| `_app.services.tsx` | `/_app/services` | Service catalogue |
| `_app.applications.tsx` | `/_app/applications` | My applications list |
| `_app.documents.tsx` | `/_app/documents` | My documents/certificates |
| `_app.profile.tsx` | `/_app/profile` | Profile settings |
| `apply.$serviceId.tsx` | `/apply/:serviceId` | Multi-step application form |
| `applications.$arn.tsx` | `/applications/:arn` | Application detail |
| `pay.$arn.tsx` | `/pay/:arn` | Payment flow |
| `success.$arn.tsx` | `/success/:arn` | Success screen |
| `notifications.tsx` | `/notifications` | Notifications list |

## Source Layout
```
src/
  components/
    citizen/         # All citizen-facing UI components
    ui/              # shadcn/ui base components
  config/
    services/        # Service definitions & configuration
  context/           # Auth, Config, Applications, Notifications contexts
  hooks/             # Custom React hooks
  lib/
    citizen/         # Business logic (application state machines, fee calc, etc.)
  routes/            # TanStack Router file-based routes
```

## Notes
- TanStack Router uses file-based routing — new routes = new files in `src/routes/`
- `_app.tsx` is the authenticated layout; `auth.tsx` is the public auth page
- `wrangler.jsonc` is for Cloudflare Workers production deploy — not needed for local dev
- Do NOT manually add plugins already included by `@lovable.dev/vite-tanstack-config` (see vite.config.ts comments)
- The `_` prefix in route files is a TanStack Router layout convention, not a private file marker
