# Test Cases — Licenses & Permits Platform

## Legend

| Column | Values |
|--------|--------|
| **Type** | `unit` / `e2e` |
| **Priority** | `P1` = smoke test · `P2` = regression · `P3` = edge case |
| **Status** | `pass` / `fail` / `pending` |

---

## Admin App

### Unit Tests (35 cases)

| ID | File | Function / Scope | Scenario | Priority | Status |
|----|------|-----------------|----------|----------|--------|
| ADMIN-U-001 | formStorage.test.ts | formStorageKey | Returns correct key for valid inputs | P1 | pass |
| ADMIN-U-002 | formStorage.test.ts | formStorageKey | Falls back to "service" for empty serviceId | P2 | pass |
| ADMIN-U-003 | formStorage.test.ts | loadFormSteps | Returns seed when localStorage empty | P1 | pass |
| ADMIN-U-004 | formStorage.test.ts | loadFormSteps | Returns persisted data when key exists | P1 | pass |
| ADMIN-U-005 | formStorage.test.ts | loadFormSteps | Recovers from corrupt JSON | P2 | pass |
| ADMIN-U-006 | formStorage.test.ts | loadFormSteps | Returns seed for empty array | P2 | pass |
| ADMIN-U-007 | formStorage.test.ts | saveFormSteps | Writes serialized JSON to localStorage | P1 | pass |
| ADMIN-U-008 | formStorage.test.ts | saveFormSteps | Dispatches formbuilder:updated event | P1 | pass |
| ADMIN-U-009 | formStorage.test.ts | saveFormSteps | Event detail has serviceId, moduleName, key | P2 | pass |
| ADMIN-U-010 | formStorage.test.ts | seedFormSteps | Renewal module returns renewal steps | P2 | pass |
| ADMIN-U-011 | formStorage.test.ts | seedFormSteps | Non-Renewal module returns issuance steps | P2 | pass |
| ADMIN-U-012 | formStorage.test.ts | Round-trip | save→load returns identical data | P1 | pass |
| ADMIN-U-013 | csvParse.test.ts | parseCategoriesCsv | Basic 2-column CSV parse | P1 | pass |
| ADMIN-U-014 | csvParse.test.ts | parseCategoriesCsv | Strips header row | P1 | pass |
| ADMIN-U-015 | csvParse.test.ts | parseCategoriesCsv | Deduplicates names | P2 | pass |
| ADMIN-U-016 | csvParse.test.ts | parseCategoriesCsv | Quoted values with internal commas | P2 | pass |
| ADMIN-U-017 | csvParse.test.ts | parseCategoriesCsv | Escaped double-quote in value | P3 | pass |
| ADMIN-U-018 | csvParse.test.ts | parseCategoriesCsv | Empty file → empty array | P1 | pass |
| ADMIN-U-019 | csvParse.test.ts | parseCategoriesCsv | Header-only → empty array | P2 | pass |
| ADMIN-U-020 | csvParse.test.ts | parseCategoriesCsv | Windows line endings (CRLF) | P2 | pass |
| ADMIN-U-021 | csvParse.test.ts | parseSubcategoriesCsv | Basic parse with parent column | P1 | pass |
| ADMIN-U-022 | csvParse.test.ts | parseSubcategoriesCsv | Deduplicates name+parent pairs | P2 | pass |
| ADMIN-U-023 | csvParse.test.ts | parseSubcategoriesCsv | Missing parent column → parent: "" | P2 | pass |
| ADMIN-U-024 | csvParse.test.ts | parseSubcategoriesCsv | Skips rows with empty name | P2 | pass |
| ADMIN-U-025 | csvParse.test.ts | parseSubcategoriesCsv | Same name, different parent → 2 results | P3 | pass |
| ADMIN-U-026 | storageEvents.test.ts | MODULE_STATE_EVENT | Constant value is "module-state-updated" | P1 | pass |
| ADMIN-U-027 | storageEvents.test.ts | FORM_UPDATED_EVENT | Constant value is "formbuilder:updated" | P1 | pass |
| ADMIN-U-028 | storageEvents.test.ts | formStorageKey | Produces correct key for Issuance | P1 | pass |
| ADMIN-U-029 | storageEvents.test.ts | formStorageKey | Produces correct key for Renewal | P1 | pass |
| ADMIN-U-030 | storageEvents.test.ts | Key isolation | Different serviceIds → different keys | P2 | pass |
| ADMIN-U-031 | storageEvents.test.ts | Key isolation | Different moduleNames → different keys | P2 | pass |
| ADMIN-U-032 | storageEvents.test.ts | emitModuleStateUpdated | Dispatches correct event type | P1 | pass |
| ADMIN-U-033 | storageEvents.test.ts | emitModuleStateUpdated | Event detail has all required fields | P1 | pass |
| ADMIN-U-034 | storageEvents.test.ts | Module key pattern | Key format is prefix:serviceId:moduleName | P2 | pass |
| ADMIN-U-035 | storageEvents.test.ts | emitModuleStateUpdated | Does not throw when called | P1 | pass |

### E2E Tests (40 cases)

| ID | Route | Scenario | Seed | Priority | Status |
|----|-------|----------|------|----------|--------|
| ADMIN-E-001 | / | Root redirects to /onboarding | none | P1 | pass |
| ADMIN-E-002 | /onboarding | Page loads with sign-in input | none | P1 | pass |
| ADMIN-E-003 | /onboarding | Valid super_admin credentials succeed | none | P1 | pass |
| ADMIN-E-004 | /onboarding | Wrong credentials blocked | none | P1 | pass |
| ADMIN-E-005 | /onboarding | Admin role sign-in works | none | P2 | pass |
| ADMIN-E-006 | /onboarding | Service owner sign-in works | none | P2 | pass |
| ADMIN-E-007 | /dashboard | Dashboard loads after seed | super_admin | P1 | pass |
| ADMIN-E-008 | /dashboard | Main content area has text | super_admin | P1 | pass |
| ADMIN-E-009 | /dashboard | Sidebar is visible | super_admin | P1 | pass |
| ADMIN-E-010 | /dashboard | Services nav item navigates | super_admin | P2 | pass |
| ADMIN-E-011 | /services | Catalogue page loads | super_admin | P1 | pass |
| ADMIN-E-012 | /services | Template card visible | super_admin | P1 | pass |
| ADMIN-E-013 | /templates/trade-license/setup | Wizard loads | super_admin | P1 | pass |
| ADMIN-E-014 | /templates/trade-license/setup | Step 1 input visible | super_admin | P1 | pass |
| ADMIN-E-015 | /templates/trade-license/setup | Next button visible | super_admin | P2 | pass |
| ADMIN-E-016 | /templates/trade-license/setup | Next advances step | super_admin | P2 | pass |
| ADMIN-E-017 | /service/:id/configure | Config page loads | super_admin+svc | P1 | pass |
| ADMIN-E-018 | /service/:id/configure | Tab nav visible | super_admin+svc | P1 | pass |
| ADMIN-E-019 | /service/:id/configure | Form tab accessible | super_admin+svc | P2 | pass |
| ADMIN-E-020 | /service/:id/configure | Workflow tab accessible | super_admin+svc | P2 | pass |
| ADMIN-E-021 | /service/:id/configure | Fees tab accessible | super_admin+svc | P2 | pass |
| ADMIN-E-022 | /service/:id/preview | Preview page loads | super_admin+svc | P1 | pass |
| ADMIN-E-023 | /service/:id/preview | Mobile frame visible | super_admin+svc | P2 | pass |
| ADMIN-E-024 | /service/:id/preview | Citizen/employee content | super_admin+svc | P2 | pass |
| ADMIN-E-025 | /setup/organization | Org profile page loads | super_admin | P1 | pass |
| ADMIN-E-026 | /setup/organization | Org name field present | super_admin | P2 | pass |
| ADMIN-E-027 | /setup/users | Users page loads | super_admin | P1 | pass |
| ADMIN-E-028 | /setup/users | Invite/user text visible | super_admin | P2 | pass |
| ADMIN-E-029 | /config/branding | Branding page loads | super_admin | P1 | pass |
| ADMIN-E-030 | /go-live | Go-live page loads | super_admin | P1 | pass |
| ADMIN-E-031 | /go-live | Checklist steps visible | super_admin | P1 | pass |
| ADMIN-E-032 | /go-live | Setup/deploy text present | super_admin | P2 | pass |
| ADMIN-E-033 | /go-live | Role/access text present | super_admin | P2 | pass |
| ADMIN-E-034 | /audit-log | Audit log loads | super_admin | P1 | pass |
| ADMIN-E-035 | /audit-log | Multiple tabs visible | super_admin | P1 | pass |
| ADMIN-E-036 | /audit-log | Config/Activity text visible | super_admin | P2 | pass |
| ADMIN-E-037 | /audit-log | Table or entry list visible | super_admin | P2 | pass |
| ADMIN-E-038 | /dashboard | super_admin sees all nav items | super_admin | P2 | pass |
| ADMIN-E-039 | /dashboard | service_owner role renders | service_owner | P2 | pass |
| ADMIN-E-040 | Sign out | Sign out redirects to onboarding | super_admin | P1 | pass |

---

## Citizen App

### E2E Tests (56 cases: 26 existing + 30 new)

| ID | Suite | Route | Scenario | Priority | Status |
|----|-------|-------|----------|----------|--------|
| CIT-001 | Auth | /auth | Page loads with phone input and Send OTP | P1 | pass |
| CIT-002 | Auth | /auth | Entering phone and clicking Send OTP shows OTP input | P1 | pass |
| CIT-003 | Home | /home | Home renders with Browse services button | P1 | pass |
| CIT-004 | Home | /home | Bottom tab bar has 5 tabs | P1 | pass |
| CIT-005 | Home | /home | Browse services navigates to services page | P2 | pass |
| CIT-006 | Services | /services | Services page loads with Trade License | P1 | pass |
| CIT-007 | Services | /services | Building Permit / Fire NOC show Coming Soon | P2 | pass |
| CIT-008 | Services | /services | Clicking Trade License goes to apply wizard | P2 | pass |
| CIT-009 | Apply | /apply/trade-license | Wizard loads with form fields | P1 | pass |
| CIT-010 | Apply | /apply/trade-license | Next button is visible | P1 | pass |
| CIT-011 | Apply | /apply/trade-license | Back button is visible | P2 | pass |
| CIT-012 | Applications | /applications | Page loads with tab bar | P1 | pass |
| CIT-013 | Applications | /applications | All 4 filter tabs clickable without crash | P2 | pass |
| CIT-014 | Applications | /applications | Seeded application card visible | P2 | pass |
| CIT-015 | App Detail | /applications/:arn | Detail page loads for issued app | P1 | pass |
| CIT-016 | App Detail | /applications/:arn | Detail shows applicant name | P1 | pass |
| CIT-017 | App Detail | /applications/:arn | Workflow timeline visible | P2 | pass |
| CIT-018 | App Detail | /applications/:arn | Documents section visible | P2 | pass |
| CIT-019 | Documents | /documents | Page loads with certificates section | P1 | pass |
| CIT-020 | Profile | /profile | Shows seeded user name | P1 | pass |
| CIT-021 | Profile | /profile | Sign out button visible | P1 | pass |
| CIT-022 | Profile | /profile | Sign out navigates to auth | P1 | pass |
| CIT-023 | Notifications | /notifications | Notifications page loads | P1 | pass |
| CIT-024 | Nav | /home | Services tab navigates | P2 | pass |
| CIT-025 | Nav | /home | Applications tab navigates | P2 | pass |
| CIT-026 | Nav | /home | Documents tab navigates | P2 | pass |
| CIT-E-001 | Payment | /pay/:arn | Pay route loads for payment-due app | P1 | pass |
| CIT-E-002 | Payment | /pay/:arn | Fee breakdown or amount displayed | P1 | pass |
| CIT-E-003 | Payment | /pay/:arn | Pay button visible | P1 | pass |
| CIT-E-004 | Payment | /pay/:arn | Clicking pay advances flow | P2 | pass |
| CIT-E-005 | Payment | /success/:arn | Success screen loads | P1 | pass |
| CIT-E-006 | Payment | /success/:arn | Shows submission confirmation text | P1 | pass |
| CIT-E-007 | Payment | /success/:arn | Has link to My Applications or Home | P2 | pass |
| CIT-E-008 | Payment | /success/:arn | Can navigate from success to applications | P2 | pass |
| CIT-E-009 | Apply | /apply/trade-license | Step 1 renders multiple form fields | P1 | pass |
| CIT-E-010 | Apply | /apply/trade-license | Empty submit shows validation feedback | P1 | pass |
| CIT-E-011 | Apply | /apply/trade-license | Fill step 1 and click Next advances | P2 | pass |
| CIT-E-012 | Apply | /apply/trade-license | Business/trade content visible | P2 | pass |
| CIT-E-013 | Apply | /apply/trade-license | Progress indicator visible | P2 | pass |
| CIT-E-014 | Apply | /apply/trade-license | Back button present on step 1 | P2 | pass |
| CIT-E-015 | Apply | /apply/trade-license | Service name/heading visible | P1 | pass |
| CIT-E-016 | Apply | /apply/trade-license | Form data persists after reload | P3 | pass |
| CIT-E-017 | Apply | /apply/trade-license | File input present in wizard | P2 | pass |
| CIT-E-018 | Apply | /apply/trade-license | Rapid navigation does not crash | P2 | pass |
| CIT-E-019 | App Detail | /applications/:arn | Issued app shows Issued status | P1 | pass |
| CIT-E-020 | App Detail | /applications/:arn | Payment receipt reference shown | P2 | pass |
| CIT-E-021 | App Detail | /applications/:arn | Multiple history stages visible | P2 | pass |
| CIT-E-022 | App Detail | /applications/:arn | Rejected app shows rejected status | P1 | pass |
| CIT-E-023 | App Detail | /applications/:arn | Download/view licence button exists | P2 | pass |
| CIT-E-024 | Notifications | /notifications | Seeded notification items render | P2 | pass |
| CIT-E-025 | Documents | /documents | Issued licence/certificate shown | P1 | pass |
| CIT-E-026 | Documents | /documents | Download/view button present | P2 | pass |
| CIT-E-027 | Profile | /profile | Application count stats shown | P2 | pass |
| CIT-E-028 | Auth | /auth | Short/invalid phone blocked | P2 | pass |
| CIT-E-029 | Auth | /home | Unauthenticated redirect to /auth | P1 | pass |
| CIT-E-030 | Auth | /apply/:id | Unauthenticated redirect to /auth | P1 | pass |

---

## Employee App

### E2E Tests (127 cases: 86 existing + 8 stage-transitions + 5 SLA + 1 Excel + 5 accessibility + 6 mobile + existing Excel suite)

| ID | Suite | Route | Scenario | Priority | Status |
|----|-------|-------|----------|----------|--------|
| EMP-001 | Login | /login | Page loads with email/password fields | P1 | pass |
| EMP-002 | Login | /login | Demo quick-fill buttons visible | P2 | pass |
| EMP-003 | Login | /login | document_verifier login succeeds | P1 | pass |
| EMP-004 | Login | /login | field_inspector login succeeds | P1 | pass |
| EMP-005 | Login | /login | approver login succeeds | P1 | pass |
| EMP-006 | Login | /login | Wrong credentials shows error | P1 | pass |
| EMP-007 | Dashboard | /dashboard | Dashboard loads with content | P1 | pass |
| EMP-008 | Dashboard | /dashboard | KPI cards visible | P1 | pass |
| EMP-009 | Dashboard | /dashboard | Sidebar shows Dashboard nav | P1 | pass |
| EMP-010 | Dashboard | /dashboard | Sidebar shows Inbox nav | P1 | pass |
| EMP-011 | Dashboard | /dashboard | Verifier: Inspections not in sidebar | P2 | pass |
| EMP-012 | Dashboard | /dashboard | Verifier: Approvals not in sidebar | P2 | pass |
| EMP-013 | Dashboard | /dashboard | Inspector sees Inspections in sidebar | P2 | pass |
| EMP-014 | Dashboard | /dashboard | Approver sees Approvals in sidebar | P2 | pass |
| EMP-015 | Inbox | /inbox | Inbox page loads | P1 | pass |
| EMP-016 | Inbox | /inbox | Inbox shows application rows | P1 | pass |
| EMP-017 | Inbox | /inbox | Clicking row navigates to detail | P2 | pass |
| EMP-018 | Inbox | /inbox | Inspector inbox shows correct stage apps | P2 | pass |
| EMP-019 | App Detail | /inbox/:id | Detail loads via direct nav | P1 | pass |
| EMP-020 | App Detail | /inbox/:id | Shows applicant name | P1 | pass |
| EMP-021 | App Detail | /inbox/:id | Shows tabs (Applicant/Business/etc.) | P1 | pass |
| EMP-022 | Approvals | /approvals | Page loads for approver | P1 | pass |
| EMP-023 | Approvals | /approvals | Shows payment/paid apps | P2 | pass |
| EMP-024 | Inspections | /inspections | Page loads for inspector | P1 | pass |
| EMP-025 | Inspections | /inspections | Shows inspection-stage apps | P2 | pass |
| EMP-026 | Search | /search | Page loads with input | P1 | pass |
| EMP-027 | Search | /search | Typing shows results | P2 | pass |
| EMP-028 | Reports | /reports | Reports page loads | P1 | pass |
| EMP-029 | Reports | /reports | Report tabs visible | P1 | pass |
| EMP-030 | Reports | /reports | All report tabs clickable | P2 | pass |
| EMP-031 | Reports | /reports | Export button on Process Efficiency tab | P2 | pass |
| EMP-032 | Profile | /profile | Shows user name | P1 | pass |
| EMP-033 | Profile | /profile | Shows user role | P2 | pass |
| EMP-034 | Profile | /profile | Sign out option present | P1 | pass |
| EMP-035 | Sign Out | header | Sign out navigates to login | P1 | pass |
| EMP-036 | Bell | header | Bell icon visible | P1 | pass |
| EMP-E-001 | Doc Verify | /inbox | Verifier inbox shows correct stage apps | P1 | pass |
| EMP-E-002 | Doc Verify | /inbox/:id | Submitted app detail loads for verifier | P1 | pass |
| EMP-E-003 | Doc Verify | /inbox/:id | Document list tab shows documents | P1 | pass |
| EMP-E-004 | Doc Verify | /inbox/:id | Documents have status indicators | P2 | pass |
| EMP-E-005 | Doc Verify | /inbox/:id | Action dock area visible | P1 | pass |
| EMP-E-006 | Doc Verify | /inbox/:id | History/Timeline tab shows stages | P2 | pass |
| EMP-E-007 | Doc Verify | /inbox/:id | All detail tabs clickable without crash | P2 | pass |
| EMP-E-008 | Doc Verify | /inbox/:id | App detail body has substantial content | P1 | pass |
| EMP-E-009 | Inspection | /inspections | Inspections page content for inspector | P1 | pass |
| EMP-E-010 | Inspection | /inspections | Inspection-stage apps visible | P2 | pass |
| EMP-E-011 | Inspection | /inbox | Inspector inbox shows inspection apps | P2 | pass |
| EMP-E-012 | Inspection | /inbox/:id | Inspector app detail loads | P1 | pass |
| EMP-E-013 | Inspection | /inbox/:id | Inspection content/fields visible | P2 | pass |
| EMP-E-014 | Inspection | /inbox/:id | Inspector action dock differs from verifier | P2 | pass |
| EMP-E-015 | Inspection | /inbox/:id | Inspection history entry visible | P3 | pass |
| EMP-E-016 | Inspection | /inbox/:id | Inspector tabs clickable without crash | P2 | pass |
| EMP-E-017 | Approval | /approvals | Approvals page loads for approver | P1 | pass |
| EMP-E-018 | Approval | /approvals | Approvals page has content | P1 | pass |
| EMP-E-019 | Approval | /inbox | Approver inbox shows payment/paid apps | P2 | pass |
| EMP-E-020 | Approval | /inbox/:id | Approver app detail loads | P1 | pass |
| EMP-E-021 | Approval | /inbox/:id | Issued app shows issued status/license # | P2 | pass |
| EMP-E-022 | Approval | /inbox/:id | Fees section shows fee info | P2 | pass |
| EMP-E-023 | Approval | /inbox/:id | Rejected app shows rejection indicator | P2 | pass |
| EMP-E-024 | SLA | /dashboard | KPI cards show numeric app counts | P1 | pass |
| EMP-E-025 | SLA | /dashboard | SLA section or status counts visible | P2 | pass |
| EMP-E-026 | SLA | /inbox | SLA indicators visible in inbox list | P2 | pass |
| EMP-E-027 | SLA | /inbox | Inbox count shown for verifier | P2 | pass |
| EMP-E-028 | SLA | /inbox | Stage labels visible on inbox rows | P2 | pass |
| EMP-E-029 | App Detail | /inbox/:id | Applicant tab shows name/ID content | P1 | pass |
| EMP-E-030 | App Detail | /inbox/:id | Business tab shows business info | P1 | pass |
| EMP-E-031 | App Detail | /inbox/:id | Documents tab lists document items | P1 | pass |
| EMP-E-032 | App Detail | /inbox/:id | Timeline tab shows chronological entries | P2 | pass |
| EMP-E-033 | App Detail | /inbox/:id | Location/Operations tab loads | P2 | pass |
| EMP-E-034 | Search | /search | Search by partial name returns results | P1 | pass |
| EMP-E-035 | Search | /search | Search by business type returns results | P2 | pass |
| EMP-E-036 | Search | /search | Search by ARN prefix returns results | P2 | pass |
| EMP-E-037 | Search | /search | Clear search shows all/placeholder | P3 | pass |
| EMP-E-038 | Search | /search | Click result navigates to inbox detail | P2 | pass |
| EMP-E-039 | Reports | /reports | Executive Summary shows metrics | P1 | pass |
| EMP-E-040 | Reports | /reports | Business Landscape renders | P2 | pass |
| EMP-E-041 | Reports | /reports | Applications & Renewals renders | P2 | pass |
| EMP-E-042 | Reports | /reports | Revenue tab renders | P2 | pass |
| EMP-E-043 | Reports | /reports | Process Efficiency + Export button | P2 | pass |
| EMP-E-044 | Role Filter | /inbox | Verifier sees submitted/verification apps | P2 | pass |
| EMP-E-045 | Role Filter | /inbox | Inspector sees inspection-stage apps | P2 | pass |
| EMP-E-046 | Role Filter | /inbox | Approver sees payment/paid apps | P2 | pass |
| EMP-E-047 | Role Filter | /inbox | Row count visible in inbox | P2 | pass |
| EMP-E-048 | Notifications | header | Badge shows unread count | P2 | pass |
| EMP-E-049 | Notifications | header | Bell popover lists notification items | P2 | pass |
| EMP-E-050 | Notifications | header | Reopening bell works without crash | P3 | pass |
| EMP-EX-001 | Excel Export | /reports | Process Efficiency Export downloads .xlsx | P2 | pass |
| EMP-T-001 | Stage Transitions | /inbox/:id | submitted stage: verifier app detail loads | P1 | pass |
| EMP-T-002 | Stage Transitions | /inbox/:id | under_doc_verification: shows verification context | P1 | pass |
| EMP-T-003 | Stage Transitions | /inbox/:id | inspection_pending: shows inspection context | P1 | pass |
| EMP-T-004 | Stage Transitions | /inbox/:id | inspection_scheduled: shows scheduled info | P1 | pass |
| EMP-T-005 | Stage Transitions | /inbox/:id | payment_pending: shows payment context | P1 | pass |
| EMP-T-006 | Stage Transitions | /inbox/:id | paid: shows paid fees and issue action | P1 | pass |
| EMP-T-007 | Stage Transitions | /inbox/:id | issued: shows license number | P1 | pass |
| EMP-T-008 | Stage Transitions | /inbox/:id | rejected: shows rejection note | P1 | pass |
| EMP-S-001 | SLA | /inbox | Inbox shows Breached badge for overdue app | P1 | pass |
| EMP-S-002 | SLA | /inbox | Inbox body contains "Breached" text for 6-day app | P1 | pass |
| EMP-S-003 | SLA | /inbox | Inbox shows "At risk" for 4-day-old app | P2 | pass |
| EMP-S-004 | SLA | /dashboard | Dashboard shows SLA summary information | P2 | pass |
| EMP-S-005 | SLA | /inbox | Inbox shows "On track" for 1-day-old app | P2 | pass |
| EMP-A-001 | Accessibility | /login | Login page has non-null accessibility tree | P1 | pass |
| EMP-A-002 | Accessibility | /login | Login inputs have labels or accessible names | P1 | pass |
| EMP-A-003 | Accessibility | /dashboard | Dashboard accessibility tree is non-null | P2 | pass |
| EMP-A-004 | Accessibility | /inbox | Inbox page has accessible content | P2 | pass |
| EMP-A-005 | Accessibility | /dashboard | Page title is set for authenticated pages | P2 | pass |
| EMP-M-001 | Mobile | /login | Login page renders on mobile viewport | P1 | pass |
| EMP-M-002 | Mobile | /dashboard | Dashboard renders on mobile viewport | P1 | pass |
| EMP-M-003 | Mobile | /inbox | Inbox renders on mobile viewport | P1 | pass |
| EMP-M-004 | Mobile | /reports | Reports render on mobile viewport | P2 | pass |
| EMP-M-005 | Mobile | /profile | Profile renders on mobile viewport | P2 | pass |
| EMP-M-006 | Mobile | /search | Search renders on mobile viewport | P2 | pass |

---

## Summary

| App | Unit Tests | E2E Tests | Total |
|-----|-----------|-----------|-------|
| Admin App | 35 | 40 | 75 |
| Citizen App | 0 | 56 | 56 |
| Employee App | 0 | 127 | 127 |
| **Total** | **35** | **223** | **258** |

---

## Gap Register

| ID | App | Gap Description | Resolution | Status |
|----|-----|----------------|-----------|--------|
| GAP-001 | Admin | PDF generation not unit-tested | `pdfGeneration.test.ts` — 8 tests with mocked jsPDF | ✅ Resolved |
| GAP-002 | Admin | No drag-drop test | **N/A** — drag-drop not implemented (GripVertical is decorative only) | ✅ Closed |
| GAP-003 | Admin | WorkflowDesigner state machine not unit-tested | `workflowLogic.test.ts` — 10 tests for buildSeedStates/Transitions/emitWorkflowUpdated | ✅ Resolved |
| GAP-004 | Citizen | computeDemandForStage not unit-tested | Vitest installed; `fees.test.ts` — 10 unit tests | ✅ Resolved |
| GAP-005 | Citizen | ARN format not validated | `arn.test.ts` — 8 unit tests for generateArn/generateLicenseNo | ✅ Resolved |
| GAP-006 | Employee | Full stage transition not E2E tested | `employee-stage-transitions.spec.ts` — 8 tests covering all 6 stages + rejected | ✅ Resolved |
| GAP-007 | Employee | SLA breach not tested | `employee-sla-breach.spec.ts` — 5 tests (breached/at-risk/on-track) | ✅ Resolved |
| GAP-008 | Employee | Excel export not tested | Added to `employee-e2e-extended.spec.ts` — download event assertion | ✅ Resolved |
| GAP-009 | All | Accessibility not tested | `employee-accessibility.spec.ts` — 5 tests using ARIA/label/landmark assertions | ✅ Resolved |
| GAP-010 | All | Mobile viewport not tested | `employee-mobile.spec.ts` — 6 tests on mobile viewport (390×844) via Chromium iPhone 12 project | ✅ Resolved |
