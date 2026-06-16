# PRD: Role-Based Access Control & User Onboarding

**Status:** Draft  
**Date:** 2026-06-02  
**Author:** Tahera Bharmal

---

## 1. Problem Statement

Today, when a partner sets up a new government org on the platform, there is no structured way to delegate access. Either everyone gets full access or no one does. The platform needs a tiered permission model that lets an org admin progressively hand off responsibility — to additional admins, to service owners, and to service-level users — without granting blanket access.

---

## 2. Goals

- Define three distinct role tiers with clear, non-overlapping responsibilities
- Deliver a guided onboarding flow that moves a new org from zero users to a fully configured, staffed service
- Ensure every user sees only what is relevant to their role — no more, no less
- Provide a central Users & Roles management surface for admins

## 3. Non-Goals (V1)

- SSO or federated identity setup (separate PRD)
- Citizen self-registration (handled at service config level, not here)
- Granular permission customization per user (roles are the unit of permissions in V1)
- Mobile app onboarding

---

## 4. Role Definitions

The platform has **two tiers**: Platform roles (org-wide) and Service roles (scoped to a specific service).

### 4.1 Platform Roles

| Role | Created By | Count | Scope |
|---|---|---|---|
| **Super Admin** | Partner (external, via email) | 1 per org | Org-wide |
| **Admin** | Super Admin or another Admin | Unlimited | Org-wide |

**Super Admin vs Admin — the one difference:**
Super Admin is the only user who can **create and delete Admin users**. All other permissions are identical between Super Admin and Admin.

**What Admins (and Super Admin) CAN do:**
- Confirm and edit org profile details
- Select and activate service templates
- Create/remove Admin users (Super Admin only for creating/deleting Admins)
- Add and remove Service Owners for any service
- View and manage all users in Users & Roles tab
- Access platform settings, billing, reports, and org-level configuration
- Assign service roles (document verifier, inspector, approver, etc.)

**What Admins CANNOT do:**
- Apply for a license (citizen action)
- Approve/reject a license application (service role action)
- Perform field inspections (service role action)
- Any application-level workflow action — these are reserved for service roles

---

### 4.2 Service Roles

Service roles are scoped to a specific service (e.g., Trade License). A user with a service role only sees the service(s) they are assigned to.

These map directly to the existing role definitions in `usersAccess.ts`:

| Role | Description | Workflow Stages |
|---|---|---|
| **Service Owner** | Configures service, manages service users, monitors adoption | Platform-level (no workflow stage) |
| **Document Verifier** | Reviews and verifies submitted documents | Document Verification |
| **Field Inspector** | Conducts site inspections, submits reports | Inspection |
| **Approver** | Final authority on application approval/rejection | Approval |
| **Counter Operator** | Accepts applications and payments at counter | Submission, Payment |
| **Viewer** | Read-only access to applications and reports | All (view only) |
> **Note on Service Owner:** In the current codebase, the closest existing role is `service_designer` (configure templates, forms, workflows). Service Owner is a superset: `service_designer` permissions **plus** the ability to add/remove users scoped to their service. This distinction needs to be implemented.

> **Note on Citizen:** Citizens are **not** invited platform users and are not managed through the Users & Roles tab. They are external actors who self-register through the citizen-facing portal and interact with the service at the Submission, Resubmission, and Payment stages. Citizen account management is handled at the service configuration level and is out of scope for this PRD.

---

## 5. Onboarding Journey

The onboarding flow is sequential and role-gated. Each step unlocks the next.

### Step 1 — Partner Creates Super Admin *(Outside Product)*
- Partner generates credentials (email + temporary password) for the org's Super Admin
- Credentials are shared via email outside the product
- **V1 constraint:** This is a manual, offline step. No in-product partner portal for this in V1.
- **Post-V1 consideration:** Replace with an in-product partner workflow that sends a magic link directly to the Super Admin's email.

### Step 2 — Super Admin Logs In & Confirms Org Details
- Super Admin receives email, logs in, and is forced through a password reset
- After reset, they land on the **Confirm Organisation** screen
- They review and confirm: org name, department, country, currency, contact email, phone
- On confirmation → onboarding continues
- *Maps to existing `ConfirmOrganization` step in `Onboarding.tsx`*

### Step 3 — Add Additional Admins *(Optional)*
- After org confirmation, Super Admin is prompted: *"Do you want to add additional admin users?"*
- If yes: enters email addresses; each receives an invite email with a setup link
- Invited admins appear in Users & Roles with status `invited` until they accept
- Super Admin can skip this step and proceed; admins can be added later from Users & Roles
- **This step does not currently exist in the onboarding flow and needs to be built.**

### Step 4 — Select a Service Template
- Super Admin (or any Admin) selects from available service templates:
  - Trade License
  - Building Permit
  - Fire NOC
- Before confirming, the Admin sees a **template preview panel** showing exactly what is included in that template:
  - **Workflow stages** — the full stage sequence (e.g. Submitted → Document Verification → Inspection → Approval → Payment → Issued / Rejected)
  - **Roles** — which roles are active in this template and what stage each owns
  - **Form sections** — the default application form fields and sections
  - **Checklists** — default verification, inspection, and approval checklists
  - **Notifications** — which events trigger email/SMS and to whom
- The preview is informational at this step; the Admin confirms to proceed
- Selecting a template creates a `draft` service instance in their org
- Multiple templates can be selected; each gets its own preview before confirmation
- **This same template detail view is accessible to the Service Owner** from their service dashboard at any time via "View Template Details" — so they can always see the baseline their service was built on
- *Maps to existing service selection in `OnboardingContext` — `ServiceItem` with `templateId`*

### Step 5 — Assign Service Owners *(Optional, per service)*
- After selecting a template, Admin is asked: *"Do you want to add a Service Owner for [Service Name]?"*
- If yes: enters email(s) of Service Owner(s)
- Service Owner receives an invite email; on acceptance they log in and see only their assigned service
- Admin can skip and add Service Owners later from the service's settings page
- **This step does not currently exist and needs to be built.**

### Step 6 — Service Owner Logs In & Completes Guided Setup
- Service Owner accepts invite, resets password, and lands on their service dashboard
- Their dashboard shows **only the service(s) they are assigned to** — no cross-service visibility
- On **first login**, the Service Owner sees a persistent **Getting Started checklist** (see Section 5a below) that guides them through configuration before the dashboard data view is fully surfaced
- Once all checklist steps are complete, the checklist collapses and the standard service dashboard is shown

---

### Section 5a — Service Owner First Login: Guided Setup Flow

When a Service Owner logs in for the first time, they are placed into a **Getting Started** flow before reaching their standard dashboard. This is a sequential checklist of 4 steps. Progress is persisted across sessions — if they close the browser, they resume where they left off.

#### Step 1 of 4: Review Your Service Template
- Service Owner is shown the same **template preview panel** from Step 4 (workflow stages, roles, form sections, checklists, notifications)
- They cannot modify anything here — this is orientation only
- CTA: *"Looks good, let's customise"* → proceeds to Step 2

#### Step 2 of 4: Configure Your Service
- Service Owner is taken into the service configuration screen
- They can customise: form fields, workflow stage labels, fee rules, notification templates, and branding
- Items that have been configured are marked with a checkmark
- A minimum viable set must be confirmed before proceeding (form + workflow at minimum)
- CTA: *"Service configured, continue"* → proceeds to Step 3

#### Step 3 of 4: Add Your Team
- Service Owner is shown the **Invite Users** panel scoped to their service
- They invite users by email and assign each a role (Document Verifier, Field Inspector, Approver, Counter Operator, Viewer)
- Can add multiple users in one session
- This step is skippable — they can add users later from the Users tab
- CTA: *"Team added, continue"* or *"Skip for now"* → proceeds to Step 4

#### Step 4 of 4: Review & Go Live
- Summary screen showing: service name, configured workflow stages, number of team members added, deployment scope
- Two actions:
  - **Publish to Staging** — service is available for internal testing, not citizen-facing
  - **Save as Draft** — service stays in draft; can be published later
- After either action, the Getting Started checklist collapses and the standard service dashboard is shown

#### Checklist Persistence Rules
- The checklist is shown on every login until all 4 steps are complete
- Completed steps show a ✅ and remain accessible for review
- After all 4 steps are done once, the checklist is collapsible/dismissible
- The checklist is accessible from a "Setup Guide" link in the service dashboard header at all times

---

### Step 7 — Service Owner Adds Service Users
- From within their service dashboard, Service Owner can invite users and assign service roles (Document Verifier, Field Inspector, Approver, Counter Operator, Viewer)
- Each invite includes the service name and role in the email
- Service users can only see and act on their assigned service, scoped to their workflow stage(s)
- *Role-to-stage scoping already exists in `stageAccess` in `UsersAccess.tsx`*

### Step 8 — Admin Manages All Users from Users & Roles Tab

The Users & Roles page has **two tabs**:

#### Tab 1: Users
- Any Admin can view **all users across all services**
- Filter by: All / System (Platform roles) / Service (Service roles) / Invited
- Actions: reassign roles, disable users, resend invites, remove users
- Cannot see or manage users from other orgs
- *User management screen already exists at `UsersAccess.tsx` with `InviteUserSheet` and `RoleDetailSheet`*

#### Tab 2: Activity Log *(new — needs to be built)*
- Immutable, chronological log of all user and role actions within the org
- Visible to: Super Admin and Admin only
- **Columns:**

| Timestamp | Actor | Action | Affected User | Role | Service |
|---|---|---|---|---|---|
| 2026-06-01 14:32 | Tahera Ahmed | Invited | rahul@gov.in | Field Inspector | Trade License |
| 2026-06-01 15:10 | Tahera Ahmed | Role changed | meera@gov.in | Approver → Document Verifier | Trade License |
| 2026-06-02 09:00 | Joanna Lee | Accepted invite | joanna@gov.in | Service Owner | Building Permit |
| 2026-06-02 11:45 | Tahera Ahmed | Disabled | david@gov.in | Viewer | — |

- **Logged action types:** Invited, Accepted invite, Role changed, Disabled, Re-enabled, Removed, Resent invite, Admin created, Admin deleted
- **Filters:** Date range, Action type, Actor, Affected user, Service
- Log is read-only — no actions can be taken from this tab
- Entries are never deleted, even if the affected user is subsequently removed

---

## 6. Permission Matrix

| Action | Super Admin | Admin | Service Owner | Service Role Users |
|---|---|---|---|---|
| Create/Delete Admin users | ✅ | ❌ | ❌ | ❌ |
| Edit org profile | ✅ | ✅ | ❌ | ❌ |
| Select service templates | ✅ | ✅ | ❌ | ❌ |
| Add/remove Service Owners | ✅ | ✅ | ❌ | ❌ |
| Configure service (forms, workflow, branding) | ✅ | ✅ | ✅ (own service only) | ❌ |
| Add service-level users | ✅ | ✅ | ✅ (own service only) | ❌ |
| View all users (Users & Roles tab) | ✅ | ✅ | ❌ (own service only) | ❌ |
| Monitor service adoption/reports | ✅ | ✅ | ✅ (own service only) | View only |
| Apply for a license | ❌ | ❌ | ❌ | Citizen only |
| Verify documents | ❌ | ❌ | ❌ | Document Verifier only |
| Conduct inspection | ❌ | ❌ | ❌ | Field Inspector only |
| Approve/reject application | ❌ | ❌ | ❌ | Approver only |
| Access billing & licensing | ✅ | ✅ | ❌ | ❌ |

---

## 7. Dashboard Views by Role

### Super Admin / Admin Dashboard
- All services in the org
- Org-level metrics (total applications, SLA summary, adoption across services)
- Quick links: Users & Roles, Org Settings, Billing

### Service Owner Dashboard
- Only their assigned service(s)
- Service-level metrics: applications in each stage, SLA breaches, user count
- Quick links: Configure Service, Add Users, View Reports

### Service Role User Dashboard (EmployeeApp)
- Role-specific queue (e.g., Document Verifier sees only applications in Document Verification stage)
- Navigation built dynamically by role (`buildNav()` in `route.tsx` — already implemented)

---

## 8. User Invitation & Lifecycle

```
Partner creates credentials → Super Admin invited (offline, V1)
Super Admin logs in → Password reset forced
Admin invites additional Admin(s) → Status: Invited
Admin/Service Owner invites service users → Status: Invited
User accepts invite → Status: Active
Admin disables user → Status: Disabled (retains history, no access)
Admin removes user → Soft delete (audit trail retained)
```

- All invites are email-based
- Invite links expire after 72 hours (to be confirmed with engineering)
- Users with `invited` status cannot access the platform
- Disabled users retain all their historical actions for audit purposes

---

## 9. What Needs to Be Built vs. What Exists

| Feature | Status | File Reference |
|---|---|---|
| Role definitions (system + service roles) | ✅ Exists | `usersAccess.ts` |
| Permission matrix per role | ✅ Exists | `usersAccess.ts` lines 135–174 |
| Users & Roles management page | ✅ Exists | `UsersAccess.tsx` |
| Invite user flow (InviteUserSheet) | ✅ Exists | `InviteUserSheet.tsx` |
| Role-gated navigation (EmployeeApp) | ✅ Exists | `route.tsx` — `buildNav()` |
| Stage-scoped access per role | ✅ Exists | `stageAccess` in `UsersAccess.tsx` |
| Onboarding: SignIn + Password Reset + Confirm Org | ✅ Exists | `Onboarding.tsx` |
| Onboarding: Step 3 — Add Admins prompt | ❌ Not built | Needs new onboarding step |
| Onboarding: Step 4 — Template selection in onboarding | ⚠️ Partial | Exists in context, not wired to onboarding flow |
| Onboarding: Step 5 — Add Service Owners prompt | ❌ Not built | Needs new onboarding step |
| Service Owner role (distinct from service_designer) | ⚠️ Partial | `service_designer` exists; user-management scope not added |
| Super Admin exclusive: create/delete Admin users | ❌ Not built | Needs permission check in user management |
| Service Owner scoped dashboard | ❌ Not built | Needs filtered view in AdminApp |
| Template preview panel (Step 4 + Service Owner view) | ❌ Not built | Needs template detail drawer/panel component |
| Service Owner guided setup flow (Section 5a) | ❌ Not built | New first-login checklist flow |
| Users & Roles: Activity Log tab | ❌ Not built | New tab with immutable action history |

---

## 10. Open Questions

1. **Invite expiry:** Should invite links expire? If so, after how long? Can they be resent?
2. **Service Owner scope:** Can a Service Owner be assigned to multiple services, or strictly one?
3. **Citizen registration:** Citizens aren't part of admin-managed users — they self-register through the citizen-facing app. Should admins have visibility into citizen accounts, or is that fully outside scope?
4. **Super Admin transfer:** If the Super Admin leaves the org, how does a new Super Admin get created? Does the partner have to intervene again?
5. ~~**Audit log:** All role/permission changes should be logged. Is this in scope for V1 or post-V1?~~ **Resolved:** Activity Log tab is in scope for V1. See Section 5, Step 8 (Tab 2).

---

## 11. Success Criteria

| Metric | Target |
|---|---|
| Onboarding completion rate (Super Admin completes all steps) | ≥ 80% complete without support ticket |
| Time to first Service Owner invited (from Super Admin login) | < 10 minutes |
| Zero unauthorized access incidents (user sees data outside their role) | 0 incidents in first 3 months |
| Admin can manage all org users from single screen | 100% user coverage in Users & Roles tab |
