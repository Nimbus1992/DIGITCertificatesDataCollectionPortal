# [Product Name] — Master Product PRD

> **How to use this Master Product PRD Template:** This is the top-level, product-wide PRD. It gives every reader a complete picture of the product in one document. Keep each section at summary level — detail belongs in the Module PRDs linked from Section 8 and indexed in Section 9. Delete all instructional callouts (blockquotes like this one) before moving to "In Review."
>
> Before writing, read: `../../ContextforAutomations/user_persona_context.md`, `../../ContextforAutomations/design_principles.md`, `../../ContextforAutomations/company_context.md`
>
> Writing standards: `./00_PRD_Writing_Guide.md`

---

## 1. Document Control

| Field | Value |
|---|---|
| **Product Name** | |
| **Document Title** | Master Product PRD |
| **Version** | 0.1 |
| **Status** | Draft |
| **Date** | YYYY-MM-DD |
| **Author** | |
| **Reviewers** | |
| **Approvers** | |
| **Parent Document** | — (this is the top-level document) |

**Version History**

| Version | Date | Author | Summary of Changes |
|---|---|---|---|
| 0.1 | YYYY-MM-DD | | Initial draft |

---

## 2. Terminology

> This section defines key terms used throughout this PRD and its associated Module PRDs. Use these definitions consistently across all documents. If a term is used differently in a source regulation or government document, note the deviation inline.

| Term | Definition |
|---|---|
| **License** | A government-issued formal authorization permitting a business or individual to operate in a regulated activity on an ongoing, recurring basis (e.g., Trade License, Food Business License). |
| **Permit** | A time-limited or activity-specific government authorization for a defined action or project (e.g., Building Permit, Event Permit). Unlike a license, a permit is typically tied to a single activity rather than ongoing operations. |
| **Service** | A specific license or permit type offered by a government department through the L&P platform (e.g., "Food Business License" is a Service). Each Service has a defined workflow, set of required documents, and fee structure. |
| **Application** | A formal request submitted by an Applicant to obtain, renew, amend, or cancel a license or permit. Note: "Application" also refers to the software product — context should make this clear. |
| **Applicant** | A person or registered business entity that submits an Application. Synonymous with the "Citizen / Entity (Applicant)" persona. |
| **Module** | A discrete functional area of the L&P product that groups a set of related features (e.g., Application Submission module, Payment module). Each Module has its own Module PRD. |
| **Feature** | A specific capability within a Module that enables a user to perform a defined task (e.g., "Upload supporting documents," "View application status"). |
| **Workflow** | The configured sequence of steps, roles, decisions, and transitions involved in processing an Application from submission to final resolution (approval, rejection, or withdrawal). |
| **Interface** | A distinct application or portal through which users interact with the L&P product (e.g., Citizen Portal, Employee Portal, Admin Portal). Each Interface serves one or more personas. |
| **Persona** | A named representation of a distinct user type who interacts with the L&P product. All canonical personas are defined in `../../ContextforAutomations/user_persona_context.md`. |
| **Master Product PRD** | The top-level PRD for the entire L&P product. Describes the vision, interfaces, modules, and high-level features at a summary level. Created using the Master Product PRD Template. |
| **Module PRD** | A detailed PRD for a single functional module. Contains user stories, feature requirements, business rules, and edge cases. Created using the Module PRD Template. |
| **Master Product PRD Template** | The standardized template used to write a Master Product PRD. File: `01_PRD_Template_MasterProduct.md`. |
| **Module PRD Template** | The standardized template used to write a Module PRD. File: `02_PRD_Template_Module.md`. |
| **MVP (Minimum Viable Product)** | The first production-ready version of the product, containing the minimum set of features required to deliver core value to users and validate key assumptions. The current product scope is limited to MVP. |
| **Open Question** | A documented uncertainty or decision point that must be resolved before a module can be built or launched. Tracked in `ValidationTracker.md` with an owner and due date. |
| **ValidationTracker** | The shared document (`ValidationTracker.md`) that tracks all Open Questions across all PRDs, with owners, priorities, and resolution status. |
| **ULB (Urban Local Body)** | A local government entity (city or town municipality) that is typically the jurisdiction deploying and operating the L&P platform to serve its citizens. |
| **RBAC (Role-Based Access Control)** | A method of managing system access permissions by assigning users to roles, where each role carries a defined set of permissions. |
| **SLA (Service Level Agreement)** | A defined time commitment for how long a government department will take to process an Application (e.g., "Applications reviewed within 5 working days"). |
| **Prototype** | An interactive visual representation of the product used to validate design and UX before build. Prototypes are stored in the Lovable code folder (`../../Lovable code/`). PRDs link to prototypes; they do not embed screenshots. |

> Instructions: Add new terms as the product vocabulary evolves. If a term is unclear or contested across teams, add it here with the agreed definition rather than leaving it implicit.

---

## 3. Executive Summary

> 3–4 sentences. What is this product? What problem does it solve? Who benefits? What is the expected outcome? This should be readable by a non-technical executive in under 60 seconds.

[Product Name] is a [type of product] that enables [primary users] to [primary action] without [primary friction]. Today, [brief description of the problem: who suffers, what they have to do instead, and what the cost is]. The product [summary of the solution approach] and is designed to serve [mention of government/city/state context]. When successful, [one sentence on the measurable change in the world].

---

## 4. Product Vision & Strategic Context

> State the long-term vision in one sentence. Then explain how this product fits into eGov Foundation's strategy and the broader government digitisation context. Reference `../../ContextforAutomations/company_context.md` for company context — do not copy it here.

**Vision Statement:**
_[One sentence: the north star for what this product will become. Written as a future state, not a feature list.]_

**Strategic Context:**
_[2–3 sentences. Why does eGov Foundation need to build this? What market or policy context makes this the right time? Reference `../../ContextforAutomations/company_context.md` for full company background.]_

**Product Positioning:**
_[Who is this sold to / deployed for? State government departments? Urban Local Bodies? What distinguishes this from alternatives (manual process, competing software, or in-house builds)?]_

---

## 5. Problem Statement

> Describe the core pain this product addresses. Use specific evidence: user quotes, data points, or operational failures. The problem statement must be observable and verifiable — not an assertion about what users "must" want.

**Who has the problem:**
_[Which personas are most affected — use names from `../../ContextforAutomations/user_persona_context.md`]_

**What the problem is:**
_[Describe the current state — the friction, the manual process, the failure mode, or the gap. Be specific.]_

**Why the current solution fails:**
_[What do people do today? Why is it inadequate — inefficient, error-prone, inaccessible, non-compliant?]_

**Evidence:**
_[Data, research findings, user quotes, or operational metrics that validate this is a real problem. If evidence is pending, mark as an Open Question.]_

**Impact of not solving it:**
_[What continues to happen if this product is not built or deployed? Quantify where possible.]_

---

## 6. Users & Personas

> List every persona that interacts with this product. Use canonical names from `../../ContextforAutomations/user_persona_context.md` exactly. Do not re-document persona details here — link to the context file for full profiles.

**Full persona profiles:** `../../ContextforAutomations/user_persona_context.md`

| Persona | Interface(s) Used | Role (Primary / Secondary) | Key Need This Product Addresses |
|---|---|---|---|
| Citizen / Entity (Applicant) | Citizen Portal | Primary | |
| Field and Office Employee (Licensing Clerk / Processor) | Employee Portal | Primary | |
| Administrator | Admin Portal | Primary | |
| Service Owner | Admin Portal | Primary | |
| End User / Enforcement Officer | Mobile / Field App | Secondary | |
| SI Partner / Implementation Partner | Admin Portal, Configuration | Platform-level | |
| eGov Product / Operations Team | Backend / Platform | Platform-level | |

> Instructions: Fill in the "Key Need" column for each persona relevant to this deployment. Remove rows for personas that have no interaction with this product. Do not add new persona names — see `./00_PRD_Writing_Guide.md` if you believe a new persona is needed.

---

## 7. Product Interfaces

> Describe each application or portal that is part of this product. One paragraph per interface explaining what it is, who uses it, and its primary purpose. Do not spec features here — that is Section 10. If an interface is out of scope for MVP, note it and move it to Section 11 (Non-Goals).

### 7.1 Citizen Portal

**Primary Personas:** Citizen / Entity (Applicant)
**Channel:** Web (desktop and mobile browser)

_[Describe what the Citizen Portal is: what can a citizen do here? What is the entry point — applying for a license, tracking status, paying fees, downloading certificates? What experience are we optimising for (ease of use, self-service, minimising visits to offices)?]_

---

### 7.2 Employee / Department Portal

**Primary Personas:** Field and Office Employee (Licensing Clerk / Processor)
**Channel:** Web (desktop-first)

_[Describe what the Employee Portal is: what does a licensing clerk or processor do here? Reviewing applications, requesting documents, conducting inspections, approving or rejecting? What workflow does this interface support?]_

---

### 7.3 Admin Portal

**Primary Personas:** Administrator, Service Owner
**Channel:** Web (desktop)

_[Describe what the Admin Portal is: configuring services, managing users, viewing dashboards, setting workflows, running reports? Who has admin access vs. service owner access?]_

---

### 7.4 Mobile / Field Application _(if in scope)_

**Primary Personas:** End User / Enforcement Officer
**Channel:** Mobile (Android / iOS)

_[Describe what the mobile app does: field inspections, license verification, enforcement checks? If this interface is not in MVP scope, move it to Non-Goals.]_

---

### 7.5 Platform / Configuration Layer _(if applicable)_

**Primary Personas:** SI Partner / Implementation Partner, eGov Product / Operations Team
**Channel:** Admin tools, config files, deployment pipelines

_[Describe any configuration or deployment interface used by implementors and the eGov platform team. If not user-facing, this may be a short note rather than a full interface description.]_

---

## 8. Product Modules Overview

> List every module in the product. Each row is a self-contained area of functionality. For each module, link to its Module PRD once it exists. Keep descriptions to one line — the Module PRD contains the detail. The Module PRDs Index in Section 9 provides the navigation links.

| # | Module Name | One-Line Description | Primary Personas | Status | Module PRD |
|---|---|---|---|---|---|
| 1 | | | | Planned | — |
| 2 | | | | Planned | — |
| 3 | | | | Planned | — |
| 4 | | | | Planned | — |
| 5 | | | | Planned | — |
| 6 | | | | Planned | — |

**Status values:** Planned / In Design / In Build / In Testing / Live / Deprecated

> Instructions: Add or remove rows as needed. "Planned" is the correct status for a module that has not yet started design. Once a Module PRD is created, replace "—" with a relative link to the file and update the index in Section 9.

---

## 9. Module PRDs Index

> This section is the single navigation point for all Module PRDs associated with this product. Update this table every time a Module PRD is created or its status changes. Each Module PRD provides the detailed requirements — user stories, acceptance criteria, business rules, and edge cases — for its module.

| # | Module Name | Module PRD | PRD Status | Last Updated |
|---|---|---|---|---|
| 1 | | — | Pending | — |
| 2 | | — | Pending | — |
| 3 | | — | Pending | — |
| 4 | | — | Pending | — |
| 5 | | — | Pending | — |
| 6 | | — | Pending | — |

> PRD Status values: Pending / Draft / In Review / Approved / Deprecated
>
> Instructions: Replace "—" in the Module PRD column with a relative link (e.g. `./Module PRDs/PRD_ApplicationSubmission.md`) once the file exists. "Last Updated" tracks the Module PRD's last modification date, not this table's.

---

## 10. High-Level Feature Summary

> Per module, list the top features at summary level. This is a navigation table — readers can scan to understand what the product does. Detail (acceptance criteria, business rules, edge cases) belongs in the Module PRD.
>
> Priority: **P0** = must have for MVP to function. **P1** = important but not launch-blocking. **P2** = desirable; can be deferred within MVP. Features not included in MVP must appear in Section 11 (Non-Goals), not here.

> Repeat the table below for each module from Section 8.

### Module: [Module Name]

| Feature ID | Feature Name | Brief Description | Priority | Primary Persona(s) |
|---|---|---|---|---|
| [MOD]-F01 | | | P0 | |
| [MOD]-F02 | | | P0 | |
| [MOD]-F03 | | | P1 | |
| [MOD]-F04 | | | P2 | |

---

## 11. Non-Goals & Out of Scope

> Be explicit about what this product deliberately does not do. Non-goals prevent scope creep and set correct expectations with stakeholders and implementation partners. Include items that are common assumptions or frequent requests.

The following are explicitly out of scope for this product:

- **[Feature or capability]** — [One sentence on why: not in MVP scope, handled by another system, policy constraint, etc.]
- **[Feature or capability]** — [Reason]
- **[Feature or capability]** — [Reason]
- **[Interface or channel]** — [Reason, e.g. "Mobile app for citizens is not in MVP scope."]

---

## 12. Success Metrics

> Define 3–5 measurable outcomes that signal this product is working. These are product-level OKRs. Module-level metrics are defined in each Module PRD and should roll up to these.

| # | Metric | Target | Measurement Method | Timeframe |
|---|---|---|---|---|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |
| 4 | | | | |
| 5 | | | | |

> Instructions: Metrics must be measurable, not qualitative. "User satisfaction" is not a metric. "80% of applicants complete submission in one session" is. If measurement methodology is unknown, add it as an Open Question.

---

## 13. MVP Scope

> Define what is included in MVP. Every feature listed in Section 10 must align with this scope. Features or modules not included here belong in Non-Goals (Section 11).

**Objective:** _[One sentence: what is the MVP designed to prove or deliver?]_

| Module | Features Included | Key Constraint or Dependency |
|---|---|---|
| | | |
| | | |
| | | |

---

## 14. Dependencies & Assumptions

### External Dependencies

| Dependency | Type | Owner | Risk if Unavailable |
|---|---|---|---|
| | Platform / Data / Policy / Integration | | |
| | | | |

### Key Assumptions

> These are beliefs the team holds that, if proven false, would require the PRD to be revised. Do not hide assumptions in requirements — surface them here.

- **[Assumption]:** _[State the assumption clearly. If there is evidence supporting it, note it. If it is unvalidated, add it as an Open Question.]_
- **[Assumption]:** _[...]_
- **[Assumption]:** _[...]_

---

## 15. Open Questions

> Every open question must have an ID, owner, and target resolution date. All open questions must also be logged in `../ValidationTracker.md` under their category. P0 = blocks design/build. P1 = must resolve before handoff. P2 = target before launch.

| ID | Question | Category | Priority | Owner | Due Date | Status |
|---|---|---|---|---|---|---|
| MASTER-001 | | User Research / Product Decision / Technical / Market | P0 | | YYYY-MM-DD | Open |
| MASTER-002 | | | P1 | | YYYY-MM-DD | Open |

---

## 16. Related Documents

### Module PRDs
_[See Section 9 for the full Module PRDs Index with links and status.]_

### Context & Reference
- User Personas: `../../ContextforAutomations/user_persona_context.md`
- Design Principles: `../../ContextforAutomations/design_principles.md`
- DIGIT Design System: `../../ContextforAutomations/DIGIT_Design_Principles.md`
- Company Context: `../../ContextforAutomations/company_context.md`

### Frameworks & Tools
- PRD Writing Guide: `./00_PRD_Writing_Guide.md`
- PRD Template (Frameworks): `../../Frameworks/PRD Template`
- Socratic PRD Review: `../../Frameworks/socratic-questioning-prd.md`
- Devil's Advocate Framework: `../../Frameworks/devils-advocate-product-strategy.md`

### Supporting Documents
- Validation Tracker: `../ValidationTracker.md`
- Prototypes: `../../Lovable code/`
