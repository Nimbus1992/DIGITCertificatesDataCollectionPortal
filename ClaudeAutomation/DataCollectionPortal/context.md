# Data Collection Portal — Project Context

## What This Is

A guided, step-by-step web portal for government and programme staff to configure a DIGIT service (starting with Business License). The configured data is reviewed by the eGovernments Foundation (eGov) or a partner team before actual system setup.

It is **not** a self-service setup tool. It is a **data collection and review interface** — the portal collects structured configuration from the account, which eGov then uses to deploy the service.

## Who Uses It

**Two roles:**

| Role | How they access | What they do |
|------|----------------|--------------|
| **eGov / Partner Admin** | Password login (`digitadmin2024`) | Creates account tiles, assigns super users, verifies submissions, exports data |
| **Account Super User** | Email lookup | Fills in configuration data for their government account |

**User profile: Low-capacity users.**
Both roles may include non-technical programme managers, municipal officers, or government IT staff with limited software experience. The portal must assume:
- Users are unfamiliar with DIGIT terminology
- Users may not complete the form in one sitting
- Users may be working on mobile or slow connections
- Instructions must be plain-language, not technical

## Design Principles

1. **Simplicity first.** No jargon. No unexplained acronyms. Every field must have a label and, where non-obvious, a hint.
2. **Progressive, not overwhelming.** Steps are grouped into two logical sections (Account Profile, Application Details). Users can move freely between sections.
3. **Defaults where possible.** Pre-fill sensible defaults; label them clearly so users know what is suggested vs. what needs their input.
4. **Save often.** Auto-save to localStorage on every change. Explicit "Save Draft" pushes to Supabase. No work should be lost.
5. **Completion is visible.** Sidebar ticks only appear when mandatory fields in a section are genuinely filled — not just "visited."

## Portal Structure

```
Login
├── Admin Dashboard (eGov/partner admin)
│   ├── Account tiles (all governments)
│   ├── Create Account (org name, super users, country)
│   ├── Manage super users per account (add / remove)
│   ├── Verify / add notes per account
│   └── Export account data as Excel
│
└── Configuration Wizard (account super user)
    ├── Account Profile
    │   ├── Overview        (Step 1) — org name, region, admin contact, domain
    │   ├── Branding        (Step 2) — portal name, colour, logo
    │   └── Boundary        (Step 3) — geographic deployment scope
    ├── Application Details
    │   ├── Application Form (Step 4) — ID types, trade categories, documents
    │   ├── Roles & Staff    (Step 5) — staff email assignments per role
    │   ├── Fees             (Step 6) — application fee, slabs, surcharges
    │   ├── Workflow         (Step 7) — approval levels, SLA, escalation
    │   └── Notifications & Payments (Step 8) — gateway, channels, receipt email
    └── Review & Export (Step 9)
```

## Technology

- **Frontend:** React 18 + TypeScript + Vite (port 5175)
- **Styling:** Tailwind CSS (no component library — hand-styled)
- **Backend/DB:** Supabase (project: `lsonxqtfpxrboawzgprs`) — table: `implementation_configs`
- **Auth:** Password-based admin (`VITE_ADMIN_PASSWORD`), email-lookup super user (no passwords)
- **Export:** jsPDF (PDF), SheetJS/xlsx (Excel)
- **Local persistence:** localStorage for auto-save; Supabase for cross-session/cross-device

## Supabase Table: `implementation_configs`

Key columns:
| Column | Type | Notes |
|--------|------|-------|
| `org_name` | text | Primary key (unique conflict target) |
| `config_data` | jsonb | Full `ImplementationConfig` object |
| `super_user_email` | text | Primary super user (first in array) |
| `super_user_emails` | text[] | All super users for this account |
| `status` | text | `draft` or `submitted` |
| `current_step` | int | Last step reached |
| `admin_verified` | boolean | eGov admin sign-off |
| `admin_notes` | text | Admin review notes |

## Future Scope

This portal is designed to eventually support **multiple DIGIT services** (e.g., Property Tax, Trade Licence, Building Plan Approval). The Business License implementation is the first. When adding new services:
- A new service template replaces `tradeLicenseTemplate.ts`
- Steps may differ per service (some may be shared)
- The admin dashboard will show service type per account tile
