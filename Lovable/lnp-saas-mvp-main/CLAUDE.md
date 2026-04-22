# CLAUDE.md — License & Permits SaaS Platform

## Commands

```bash
npm run dev          # Start dev server at http://localhost:8080
npm run build        # Production build (outputs to dist/)
npm run build:dev    # Development build
npm run preview      # Preview production build locally
npm run lint         # Run ESLint
npm run test         # Run unit tests (Vitest, single run)
npm run test:watch   # Run tests in watch mode
```

---

## Tech Stack

| Layer | Library | Version |
|---|---|---|
| Framework | React | 18.3.1 |
| Language | TypeScript | 5.8.3 |
| Bundler | Vite (SWC) | 7.3.2 |
| Routing | React Router DOM | 6.30.1 |
| State | React Context API | (built-in) |
| Server state | TanStack React Query | 5.83.0 |
| UI primitives | Radix UI | various |
| Component lib | shadcn/ui | (via Radix) |
| Styling | Tailwind CSS | 3.4.17 |
| Forms | React Hook Form | 7.61.1 |
| Validation | Zod | 3.25.76 |
| Backend client | Supabase JS | 2.102.1 |
| Icons | Lucide React | 0.462.0 |
| Toasts | Sonner | 1.7.4 |
| Unit tests | Vitest + Testing Library | 3.2.4 / 16.0.0 |
| E2E tests | Playwright | 1.57.0 |

Path alias: `@/` maps to `src/`.

---

## Folder Structure

```
src/
├── components/
│   ├── ui/                        # shadcn/Radix primitives — do not edit directly
│   ├── service-config/            # Config builder panels (FormBuilder, RolesDesigner, etc.)
│   ├── go-live/                   # Pre-launch checklist step components
│   ├── onboarding/                # 6-step onboarding wizard components
│   ├── AppLayout.tsx              # App shell — renders sidebar + <Outlet />
│   ├── AppSidebar.tsx             # Left nav sidebar
│   └── NavLink.tsx                # Active-state aware nav link
├── pages/
│   ├── Onboarding.tsx             # Onboarding flow orchestrator (renders step components)
│   ├── Dashboard.tsx              # Main dashboard
│   ├── ServiceConfig.tsx          # Service configuration hub (module selector + tiles)
│   ├── GoLive.tsx                 # Go-live checklist orchestrator
│   ├── BrandingTheme.tsx          # Theme/branding customization
│   ├── setup/                     # Setup sub-pages (org profile, users, deployment, etc.)
│   └── placeholder/PlaceholderPage.tsx  # Generic "Coming Soon" stub
├── contexts/
│   └── OnboardingContext.tsx      # Global app state + localStorage persistence
├── data/
│   ├── serviceTemplates.ts        # 8 hardcoded service templates
│   ├── serviceModules.ts          # Module/tile definitions for ServiceConfig
│   └── onboardingGuidance.ts      # Guidance text shown during onboarding steps
├── integrations/
│   └── supabase/
│       ├── client.ts              # Supabase client (initialized, not yet used)
│       └── types.ts               # Auto-generated DB types (currently empty)
├── hooks/
│   ├── use-toast.ts               # Toast hook
│   └── use-mobile.tsx             # Mobile breakpoint detection
├── lib/
│   └── utils.ts                   # cn() utility (clsx + tailwind-merge)
├── App.tsx                        # Root: providers + all route definitions
└── main.tsx                       # React DOM entry point
```

---

## Coding Patterns

### Naming
- **Components**: PascalCase files and function names (`FormBuilder.tsx`, `export default function FormBuilder`)
- **Hooks**: camelCase prefixed with `use` (`useOnboarding`, `use-mobile.tsx`)
- **Types/interfaces**: PascalCase (`OnboardingState`, `ServiceTemplate`, `TeamMember`)
- **Union type aliases**: PascalCase (`ApprovalLevel`, `ServiceStatus`, `AuthMethod`)
- **Data files**: camelCase exports from camelCase files (`serviceTemplates.ts` → `export const serviceTemplates`)
- **Routes**: kebab-case paths (`/service/:id/configure`, `/go-live`, `/config/branding`)

### Imports
- Always use the `@/` alias for src-relative imports: `import { useOnboarding } from "@/contexts/OnboardingContext"`
- shadcn components imported from `@/components/ui/*`
- Lucide icons imported individually: `import { Building2, HardHat } from "lucide-react"`
- No barrel `index.ts` files — import from the file directly

### State Management
- **Global state**: `OnboardingContext` — single context object, updated via `updateState(Partial<OnboardingState>)`
- **Persistence**: Context auto-syncs to localStorage under key `lnp-onboarding-state` via `useEffect`
- **Local UI state**: `useState` within individual components (tab selection, form field edits, modal open/close)
- **No Redux, no Zustand** — keep new state in Context or local component state
- React Query is installed for future server state but not yet used

### Components
- Functional components only, with explicit TypeScript props interfaces
- Page-level components are in `src/pages/`, reusable UI in `src/components/`
- Config sub-panels (`FormBuilder`, `RolesDesigner`, etc.) receive `onBack: () => void` and a module name as props from `ServiceConfig.tsx`
- `PlaceholderPage` accepts `title` and `description` props — use it for any not-yet-built route

### Forms
- React Hook Form and Zod are installed but currently unused — all form state is managed via local `useState`
- When building real forms, use React Hook Form with Zod resolvers via `@hookform/resolvers/zod`

### Routing
- All authenticated/app routes are nested inside the `<AppLayout />` route in `App.tsx`
- `/onboarding` and `*` (404) are standalone (no sidebar)
- Route `"/"` always redirects to `"/onboarding"`

---

## What's Done

- [x] Full onboarding wizard (6 steps: welcome, auth, org setup, template selection, service details, auto-setup)
- [x] Global state with localStorage persistence (`OnboardingContext`)
- [x] App shell with sidebar navigation (`AppLayout`, `AppSidebar`)
- [x] Dashboard with service status cards and quick actions
- [x] Service configuration hub with module selector and 9 config tile types
- [x] FormBuilder — drag-and-drop field designer with validation rules and field dependencies
- [x] RolesDesigner — 5 pre-built roles with customizable permissions
- [x] NotificationsManager — email/SMS template editor with variable insertion
- [x] ChecklistBuilder — stage-based checklist creator
- [x] DocumentDesigner — permit/certificate document layout builder (UI only)
- [x] Go-live checklist (deployment scope, add users, auth method, license key)
- [x] Branding & Theme page — preset themes, custom colors, font selection, logo upload, live preview
- [x] Organization Profile page
- [x] Supabase client configured (reads from env vars)

---

## What Needs Building

### Backend / Data Layer
- [ ] Wire Supabase — define DB schema and connect all UI actions to real API calls
- [ ] Replace all `updateState()` saves with Supabase mutations
- [ ] Seed real geographic data (cities, districts) — currently fake placeholders
- [ ] Add Supabase table types to `src/integrations/supabase/types.ts`

### Authentication
- [ ] Implement real auth in `SSOSignIn.tsx` — Google OAuth + email/password via Supabase Auth
- [ ] Protect all `/dashboard`, `/service/*`, `/go-live`, `/setup/*`, `/config/*` routes behind auth guard
- [ ] Enforce role-based access (currently roles are display-only)

### Placeholder Pages (stubs to implement)
- [ ] `/services` — list and manage all services
- [ ] `/setup/users` — invite team members, assign roles
- [ ] `/setup/deployment` — deployment zone configuration
- [ ] `/setup/auth` — auth method configuration
- [ ] `/setup/license` — license key validation and billing
- [ ] `/config/languages` — i18n / translation management
- [ ] `/config/integrations` — payment gateways, document verification, external APIs
- [ ] `/audit-log` — compliance audit trail
- [ ] `/settings` — platform settings, data export
- [ ] `/help` — documentation and support

### Service Configuration (incomplete tiles)
- [ ] Workflow tile — visual workflow/stage builder
- [ ] Payments tile — payment gateway setup and fee schedules
- [ ] Billing tile — fee calculation rules
- [ ] Plugins tile — SLA tracking, escalation rules, audit logs
- [ ] FormBuilder conditional logic tab — currently shows "Coming Soon"
- [ ] DocumentDesigner — connect to actual PDF generation

### Infrastructure
- [ ] Add React Query `useQuery`/`useMutation` hooks for all data fetching and mutations
- [ ] Add error boundaries around page-level components
- [ ] Add input validation using Zod schemas + React Hook Form
- [ ] Implement real license key validation on go-live
- [ ] Implement real email sending for team invitations
- [ ] Add file upload/storage for logos and brand assets (Supabase Storage)
- [ ] Add multitenancy — org isolation for all data

### Testing
- [ ] Write component tests (Testing Library + Vitest)
- [ ] Write integration tests for onboarding flow
- [ ] Set up Playwright E2E tests (configured but no tests written)

### Other
- [ ] Add error tracking (Sentry or similar)
- [ ] Add analytics
- [ ] Internationalise hardcoded English strings
- [ ] Write actual README

---

## Environment Variables

Required in `.env`:

```
VITE_SUPABASE_URL=https://<project-id>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<anon-key>
```

`VITE_SUPABASE_PUBLISHABLE_KEY` is the Supabase **anon/public** key — safe to expose in the browser. Never put the `service_role` key in a `VITE_` variable.

---

## Key Decisions & Constraints

- **Frontend-only MVP**: No backend calls anywhere today. All state lives in React + localStorage. This is intentional for demo/prototyping purposes.
- **shadcn components are in `src/components/ui/`**: These are copied source files (not an npm package). Edit them directly if you need to customise a primitive.
- **`OnboardingContext` is overloaded**: It holds both onboarding wizard state and persistent app config (org name, auth method, service status). When adding real backend auth, split user/session state into a separate context.
- **Dev server runs on port 8080** (not 3000) — set in `vite.config.ts`.
- **`lovable-tagger`** is a dev dependency used by the Lovable.dev editor to tag components. It only runs in development mode and can be ignored.
