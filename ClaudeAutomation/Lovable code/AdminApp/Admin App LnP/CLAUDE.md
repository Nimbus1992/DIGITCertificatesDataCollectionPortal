# Admin DIGIT Certificates — Project Context

## What this is

An admin console for **DIGIT Certificates**, a no-code platform that lets government organisations configure and deploy citizen-facing licensing/permit services (e.g. Business License, Trade Permit, Birth Certificate). Built as a prototype/demo using Vite + React + TypeScript, with shadcn/ui components and Tailwind CSS. It was scaffolded via Lovable.

The demo org is **City of Cape Town**. All data is mocked — there is no live backend; state lives in React context (persisted to `localStorage` via `OnboardingContext`).

---

## Tech stack

| Layer | Choice |
|---|---|
| Build | Vite 5, TypeScript 5 |
| UI framework | React 18 |
| Routing | react-router-dom v6 |
| State | React Context (`OnboardingContext`, `ServiceConfigContext`) |
| Data fetching | TanStack Query (wired up but largely unused — no real API) |
| Component library | shadcn/ui (Radix primitives + Tailwind) |
| Styling | Tailwind CSS v3 |
| PDF generation | jsPDF |
| Backend (stub) | Supabase JS client — types generated but not actively used |
| Testing | Vitest + Testing Library |
| E2E | Playwright |

---

## Running locally

```bash
cd "Admin-DIGITCertificates (1)"
npm install        # first time only
npm run dev        # starts on http://localhost:8080
```

Other scripts: `npm run build`, `npm run preview`, `npm run test`.

---

## Project structure

```
src/
  pages/              # Top-level route components
  components/
    ui/               # shadcn/ui primitives (do not edit directly)
    AppLayout.tsx     # Shell with sidebar + outlet
    AppSidebar.tsx    # Left nav (collapsed/expanded)
    audit/            # Audit log table + detail drawer
    go-live/          # Go-Live wizard steps
    onboarding/       # Sign-in / org setup screens
    operations/       # Analytics, queues, SLA, reports views
    preview/          # Mobile emulator preview (citizen + employee views)
    service-config/   # Per-service configurators (form, fees, workflow, etc.)
    template-setup/   # Template initialisation wizard steps
    users-access/     # Invite user + role detail sheets
  contexts/
    OnboardingContext.tsx     # Global app state (org info, list of services, branding)
    ServiceConfigContext.tsx  # Per-service slice of OnboardingContext
  data/               # Static seed data / templates
  lib/                # PDF generators, form storage, hooks
  hooks/              # use-mobile, use-toast, useBranding
  integrations/       # Supabase client + generated types
```

---

## Routing map

| Path | Page | Notes |
|---|---|---|
| `/` | → redirect to `/onboarding` | |
| `/onboarding` | `Onboarding` | Sign-in + org setup flow |
| `/dashboard` | `Dashboard` | Summary of services |
| `/services` | `Services` | Template catalogue (pick a template to create a service) |
| `/templates/:templateId/setup` | `TemplateSetup` | 5-step wizard to initialise a service from a template |
| `/service/:id/configure` | `ServiceConfig` | Per-service module configurator (form, fees, workflow, etc.) |
| `/service/:id/preview` | `ServicePreview` | Mobile emulator — citizen + employee views |
| `/service/:id/manage` | `ServiceManage` | Operations workspace for a live service |
| `/go-live` | `GoLive` | Go-live checklist wizard |
| `/setup/organization` | `OrganizationProfile` | Org name, logo, country, currency |
| `/setup/users` | `UsersAccess` | Team members + role access |
| `/setup/deployment` | placeholder | Application areas / zones |
| `/setup/auth` | placeholder | Authentication method |
| `/config/branding` | `BrandingTheme` | Colour presets, fonts, logo |
| `/config/languages` | placeholder | |
| `/config/integrations` | placeholder | |
| `/audit-log` | `AuditLogs` | Unified audit table with tabs |

---

## State architecture

All persistent state flows through **`OnboardingContext`** (`src/contexts/OnboardingContext.tsx`):

- `state.services[]` — array of `ServiceItem`, one per service the admin has created
- `state.orgName`, `state.country`, `state.currency`, etc. — organisation-level config
- `updateService(id, patch)` — the canonical mutation for any per-service change

**`ServiceConfigContext`** (`src/contexts/ServiceConfigContext.tsx`) wraps a single service and exposes typed helpers (`setStructure`, `setEnabledModules`, `setRenewalPolicy`, `setWorkflowScope`, `renameCategory`, `removeCategory`) so configurator components don't interact with `OnboardingContext` directly.

State is serialised to `localStorage` on every change (see `useEffect` in `OnboardingContext`).

---

## Key data types (OnboardingContext)

```ts
ServiceItem {
  id, name, templateId, status            // "draft" | "published" | "live"
  customModules: string[]                 // enabled module names
  templateSetup: TemplateSetup            // categories / subcategories structure
  renewalPolicy: RenewalPolicy            // global / per-category / per-subcategory
  workflowScope: WorkflowScope            // "shared" | "by_category" | "by_subcategory"
  deployment: { availabilityScope, selectedItems }
  teamMembers: TeamMember[]
  authMethod: AuthMethod                  // "email" | "sso" | "otp"
  roleAccess: RoleAccessConfig[]
  branding: BrandingConfig
  subdomain?: string
}
```

---

## Module configurators (service-config/)

Each tab in `ServiceConfig` renders one configurator:

| Tab | Component | Persisted via |
|---|---|---|
| Overview | `OverviewWorkspace` | `ServiceConfigContext` |
| Form | `FormBuilder` | `useModuleState` / `formStorage` |
| Checklist | `ChecklistBuilder` | `useModuleState` |
| Fees | `FeesConfigurator` | `useModuleState` |
| Workflow | `WorkflowDesigner` | `useServiceWorkflow` |
| Roles | `RolesDesigner` | `useServiceRoles` |
| Notifications | `NotificationsManager` | `useServiceNotifications` |
| Documents | `DocumentDesigner` | `useModuleState` |
| Payments | `PaymentsConfigurator` | `useModuleState` |

Storage helpers in `src/lib/` persist per-module state to `localStorage` keyed by `serviceId + moduleName` (+ category suffix when `workflowScope === "by_category"`).

---

## Preview system (components/preview/)

`ServicePreview` renders a mobile emulator frame (`MobileFrame`) that shows either the **citizen** or **employee** view of the configured service. It reads live config from `ServiceConfigContext` and `usePreviewConfig` to reflect the current form fields, workflow steps, branding, etc.

Citizen screens: `CitizenHome`, `ServiceCatalogue`, `ApplicationIntro`, `ApplicationForm`, `MyApplications`, `ApplicationDetail`, `LicenseView`, `InvoiceView`, `DemandNoticeView`, `PaymentScreen`, `SuccessScreen`.

Employee screens: `EmployeeHome`, `InboxView`, `ApplicationReview`, `SearchApplications`.

---

## PDF generation (src/lib/)

- `licensePdf.ts` — issues the digital license certificate
- `invoicePdf.ts` — payment invoice
- `demandNoticePdf.ts` — demand notice document
- `applicationPdf.ts` — application receipt
- `pdfBranding.ts` — applies `BrandingConfig` colours/logo to any PDF
- `pdfUtils.ts` — shared helpers

All use **jsPDF** directly (no React).

---

## Conventions

- Components use shadcn/ui primitives from `src/components/ui/` — never reach into Radix directly.
- Tailwind utility classes only; no CSS modules or styled-components.
- No global CSS beyond `src/index.css` (Tailwind base) and `src/App.css` (minimal).
- Form state managed with `react-hook-form` + `zod` for validation.
- Toasts via `sonner` (`useToast` hook wraps it).
- All icons from `lucide-react`.
- Mock/seed data lives in `src/data/` — templates, form seeds, workflow seeds, audit log fixtures.

---

## Placeholder pages

Several routes render `<PlaceholderPage>` — they are intentional stubs for features not yet built: Languages, Application Areas, Authentication setup, Integrations, Help, Settings.

---

## Supabase

A Supabase client is wired up (`src/integrations/supabase/`) but the app does not make live DB calls. Types are generated (`types.ts`) for future use. Auth is also stubbed — the onboarding sign-in screen is UI-only.
