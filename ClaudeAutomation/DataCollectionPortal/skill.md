# Claude Code Working Instructions — Data Collection Portal

## Project Summary

Guided configuration wizard for low-capacity government users to set up DIGIT services. Data is collected and reviewed by eGov/partner admins before deployment. See `context.md` for full project context.

## Core Rules

### Simplicity is non-negotiable
Users are non-technical government staff. Every UI change must pass this check: *"Would someone who has never used DIGIT understand this?"*
- Use plain English labels, not DIGIT API names
- Every non-obvious field needs a `hint` or descriptive text
- Error messages must say what to do, not just what went wrong

### Never use "Tenant" — always "Account"
This is a hard rule across all UI text, code comments, variable names, and documents.

### Do not deploy to Netlify without explicit instruction
`npm run build` is fine. `netlify deploy` is not, unless the user specifically asks.

### Logo base64 must be stripped before Supabase upsert
Supabase REST rejects large payloads. Replace `logoDataUrl` with `"__has_logo__"` before saving. Already handled in `saveConfig()` — do not bypass this.

## Step Numbering (current)

| Step | Label | Component | Group |
|------|-------|-----------|-------|
| 1 | Overview | `Step1AccountProfile.tsx` | Account Profile |
| 2 | Branding | `Step2Branding.tsx` | Account Profile |
| 3 | Boundary | `Step3Deployment.tsx` | Account Profile |
| 4 | Integrations | `StepIntegrations.tsx` | Account Profile |
| 5 | Application Form | `Step4FormConfig.tsx` | Application Details |
| 6 | Roles & Staff | `Step5RolesStaff.tsx` | Application Details |
| 7 | Fees | `Step6Fees.tsx` | Application Details |
| 8 | Workflow | `StepWorkflow.tsx` | Application Details |
| 9 | Notifications & Payments | `Step7PaymentsNotifications.tsx` | Application Details |
| 10 | Review & Export | `Step8ReviewExport.tsx` | — |

Note: file names do not match step numbers for steps 7–9 (historical). Do not rename files without updating all imports.

## Sidebar Ticks

Ticks are driven by `src/lib/stepValidation.ts`. A tick only appears when mandatory fields for that step are filled. When adding/changing required fields in a step, update the corresponding `case` in `isStepComplete()`.

Current mandatory fields per step:
- **1:** `organizationName` + valid `adminEmail`
- **2:** `portalName` non-empty
- **3:** `availabilityScope` + at least one non-empty `city`
- **4:** `idTypes.length > 0` + `tradeCategories.length > 0`
- **5:** At least one role with `staffEmails.length > 0`
- **6:** `applicationFee > 0`
- **7:** `approvalLevels >= 1` + `processingSlaDays > 0`
- **8:** `paymentGateway` + valid `adminEmail` + at least one notification channel
- **9:** `metadata.status === "submitted"`

## Auth Model

- **Admin:** checks `VITE_ADMIN_PASSWORD` client-side — no Supabase auth
- **Super user:** `getAccountByEmail()` searches `super_user_emails` array via `.contains()` — no passwords
- Multiple super users per account are supported; all can log in and edit the same config

## ImplementationConfig Shape

The full type is in `src/types.ts`. Key nested objects:
- `account` — Step 1 fields
- `branding` — Step 2 fields
- `deployment` — Step 3 fields (boundary/geographic scope)
- `formConfig` — Step 4 fields
- `roles` — Step 5 (array of `StaffRole`)
- `fees` — Step 6 fields
- `workflow` — Step 7 fields (added 2026-07)
- `paymentsNotifications` — Step 8 fields
- `metadata` — `status`, `lastStep`, timestamps

When loading old configs from Supabase that predate the `workflow` field, add a guard:
```ts
if (!loaded.workflow) loaded.workflow = DEFAULT_CONFIG.workflow;
```
This guard is already in `App.tsx` for `handleSuperUserLogin` and `handleOpenAccountFromAdmin`.

## Supabase Patterns

- Always use `import.meta.env.VITE_*` for env vars — never cast `import.meta as any`
- `saveConfig()` uses `upsert` with `onConflict: "org_name"`
- `getAccountByEmail()` uses `.contains("super_user_emails", [email])`
- `verifyAccount()` and `updateSuperUsers()` use `.eq("org_name", orgName)`
- Schema cache errors (PGRST205) mean a column is missing — provide the `ALTER TABLE` SQL

## Adding a New Step

1. Create `src/steps/StepNew.tsx` — use `StepWrapper` for consistent nav/save-draft UI
2. Add the new field type to `src/types.ts` → `ImplementationConfig`
3. Add default value to `src/defaults.ts` → `DEFAULT_CONFIG`
4. Add import + render in `src/App.tsx` (update `TOTAL_STEPS`, `STEP_LABEL`, `STEP_GROUPS`, render block)
5. Add validation in `src/lib/stepValidation.ts`
6. Update `StepWrapper.tsx` "of N" count if total steps changed

## Adding a New Service (future)

When this portal expands beyond Business License:
- Add a service selector on the login/admin flow
- Each service gets its own `ImplementationConfig` subtype and defaults file
- Steps may be shared (account, branding, boundary) or service-specific (form, fees, workflow)
- The `implementation_configs` table will need a `service_type` column
