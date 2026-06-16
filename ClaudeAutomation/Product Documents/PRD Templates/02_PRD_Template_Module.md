# [Module Name] — Module PRD

> **How to use this Module PRD Template:** This is the detailed PRD for a single product module. It provides sufficient detail for design, engineering, and QA to build and test the module without ambiguity. If you are writing a high-level product overview, use the Master Product PRD Template (`01_PRD_Template_MasterProduct.md`) instead.
>
> Before writing, read: `../../ContextforAutomations/user_persona_context.md`, `../../ContextforAutomations/design_principles.md`, `../../ContextforAutomations/DIGIT_Design_Principles.md`
>
> Writing standards: `./00_PRD_Writing_Guide.md`
>
> Delete all instructional callouts (blockquotes like this one) before moving to "In Review."

---

## 1. Document Control

| Field | Value |
|---|---|
| **Product Name** | License & Permits |
| **Module Name** | |
| **Document Title** | [Module Name] — Module PRD |
| **Version** | 0.1 |
| **Status** | Draft |
| **Date** | YYYY-MM-DD |
| **Author** | |
| **Reviewers** | |
| **Approvers** | |
| **Parent Document** | `../[Master PRD filename].md` |

**Version History**

| Version | Date | Author | Summary of Changes |
|---|---|---|---|
| 0.1 | YYYY-MM-DD | | Initial draft |

---

## 2. Module Overview

> One paragraph. Identify the module, which product it belongs to, and what high-level purpose it serves. Link back to the Master PRD and note the module's current status from the Master PRD's Module Overview table (Section 8).

**Module:** _[Name of the module]_
**Product:** License & Permits
**Status:** _[Planned / In Design / In Build / In Testing / Live]_
**Master PRD reference:** `../[Master PRD filename].md` — Section 8, Module #[N]

_[One paragraph: What is this module? What part of the license or permit journey does it cover? What does a user accomplish in this module? What comes before and after it in the overall workflow?]_

---

## 3. Problem Statement

> The specific, scoped problem this module addresses. More granular than the product-level problem statement in the Master PRD. Describe what fails today — for whom, how often, and with what consequence — if this module did not exist or did not work well.

**Who experiences this problem:**
_[Use canonical persona names from `../../ContextforAutomations/user_persona_context.md`]_

**What happens today (current state):**
_[Step-by-step or narrative description of the current process. Be specific about manual steps, error-prone handoffs, or missing capabilities.]_

**Pain and consequences:**
_[What does this cost users? Time, errors, trips to an office, missed deadlines, compliance failures?]_

**Evidence:**
_[Data, observations, or quotes that validate this is a real and significant problem. If unvalidated, mark as an Open Question.]_

---

## 4. Goals & Objectives

### Goals

> 3–5 specific outcomes this module should achieve. Link to product-level OKRs in the Master PRD where applicable.

1. _[Goal: observable, achievable within this module's scope]_
2. _[Goal]_
3. _[Goal]_

### Key Results (measurable targets per goal)

| Goal # | Key Result | Target | Measurement Method |
|---|---|---|---|
| 1 | | | |
| 2 | | | |
| 3 | | | |

### Non-Goals

> What this module explicitly does not do. Be specific — include items that are natural assumptions or frequently requested scope extensions.

- _[Out of scope item and brief reason]_
- _[Out of scope item and brief reason]_

---

## 5. Users of This Module

> Specify which personas interact with this module, their role within it, and how frequently. Use names from `../../ContextforAutomations/user_persona_context.md` exactly. Remove personas with no interaction.

| Persona | Role in This Module | Frequency of Use | Touchpoints |
|---|---|---|---|
| Citizen / Entity (Applicant) | | | |
| Field and Office Employee (Licensing Clerk / Processor) | | | |
| Administrator | | | |
| Service Owner | | | |
| End User / Enforcement Officer | | | |
| SI Partner / Implementation Partner | | | |
| eGov Product / Operations Team | | | |

---

## 6. User Stories & Scenarios

> Group stories by persona. Each user story must follow the standard format. Add edge-case scenarios (non-happy paths) separately. Stories should cover the full range of use — common, uncommon, and failure modes.
>
> Format: `As a [persona], I want to [action] so that [outcome].`
>
> Each story gets an ID in format `[MOD]-US-###`. These IDs are referenced in Section 7 Feature Requirements.

### 6.1 [Persona: e.g. Citizen / Entity (Applicant)]

| Story ID | User Story | Priority (P0/P1/P2) | Notes |
|---|---|---|---|
| [MOD]-US-001 | As a Citizen / Entity (Applicant), I want to … so that … | P0 | |
| [MOD]-US-002 | | P0 | |
| [MOD]-US-003 | | P1 | |

### 6.2 [Persona: e.g. Field and Office Employee (Licensing Clerk / Processor)]

| Story ID | User Story | Priority (P0/P1/P2) | Notes |
|---|---|---|---|
| [MOD]-US-010 | As a Field and Office Employee (Licensing Clerk / Processor), I want to … so that … | P0 | |

### 6.3 Edge-Case & Error Scenarios

> Scenarios that are not the happy path but must be handled. These inform the Edge Cases section (Section 14) and UX error states.

| Scenario ID | Scenario Description | Affected Persona(s) | Expected System Behaviour |
|---|---|---|---|
| [MOD]-EC-001 | | | |
| [MOD]-EC-002 | | | |

---

## 7. Detailed Feature Requirements

> One block per feature or feature cluster. Each feature must have: an ID, a clear name, a plain-language description, a user story reference, acceptance criteria (testable conditions), a priority, and any notable notes or constraints.
>
> Priority: **P0** = must have for MVP to function. **P1** = important but not launch-blocking. **P2** = desirable; can be deferred within MVP. **Out of Scope** = explicitly excluded from MVP — must appear in Non-Goals.
>
> Acceptance criteria should be phrased as: "Given [context], when [action], then [expected outcome]."

### Feature: [Feature Name]

**Feature ID:** [MOD]-F01
**User Story Reference:** [MOD]-US-001
**Priority:** P0
**Description:** _[Plain-language description of what this feature does. 2–4 sentences. No implementation language — describe behaviour, not mechanism.]_

**Acceptance Criteria:**

| # | Given | When | Then |
|---|---|---|---|
| 1 | | | |
| 2 | | | |
| 3 | | | |

**Notes / Constraints:**
_[Any known constraints, dependencies, or open questions specific to this feature. Reference open question IDs where relevant.]_

---

### Feature: [Feature Name]

**Feature ID:** [MOD]-F02
**User Story Reference:** [MOD]-US-002
**Priority:** P0
**Description:** _[...]_

**Acceptance Criteria:**

| # | Given | When | Then |
|---|---|---|---|
| 1 | | | |

**Notes / Constraints:** —

---

> Repeat the feature block above for each feature. Group related features under a sub-heading (e.g. `### Application Submission Features`, `### Document Upload Features`) if the module is large.

---

## 8. UX / UI Requirements

> Describe flows and UX requirements in plain language. Reference the DIGIT design system for component and accessibility standards. Do not embed wireframes or mockups here — link to the prototype instead.

**Prototype Reference:** _[Link to the relevant prototype in `../../Lovable code/` — replace this placeholder with the specific file or screen path]_
**DIGIT Design System:** `../../ContextforAutomations/DIGIT_Design_Principles.md`
**Product Design Principles:** `../../ContextforAutomations/design_principles.md`

### Key User Flows

> For each significant flow (happy path, error path, edge case), describe the steps in plain language. Use numbered lists. Note where branching occurs.

**Flow 1: [Flow Name] (e.g. Happy Path — Citizen submits application)**

1. _[Step 1 — what the user sees / does]_
2. _[Step 2]_
3. _[System response / transition]_
4. _[...]_

**Flow 2: [Flow Name] (e.g. Application returned for correction)**

1. _[Step 1]_
2. _[...]_

### UX Principles for This Module

> Note any specific UX principles from `../../ContextforAutomations/design_principles.md` that are especially relevant to this module, and how they should be applied.

- **[Principle Name]:** _[How it applies in this module specifically]_
- **[Principle Name]:** _[...]_

### Accessibility Requirements

- Must meet WCAG 2.1 AA minimum across all interfaces.
- All form fields must have visible labels and error states (reference DIGIT components).
- Colour must not be the sole indicator of status or error.
- _[Add any module-specific accessibility requirements here]_

---

## 9. Integration Requirements

> List every external system or internal service this module must connect to. Names only — not API specs. For each, note the direction of data flow and the criticality if the integration is unavailable.

| System / Service | Integration Type | Data Flow Direction | Criticality if Unavailable | Notes |
|---|---|---|---|---|
| | API / Webhook / File transfer / Manual | Inbound / Outbound / Both | Blocks feature / Degrades gracefully / No impact | |

---

## 10. Business Rules & Validation Logic

> Define the conditional logic, eligibility rules, approval thresholds, and validation constraints that govern how this module behaves. These are product decisions, not engineering decisions. Be precise — vague rules cause inconsistent implementations.

| Rule ID | Rule Description | Applies To | Condition | Outcome |
|---|---|---|---|---|
| [MOD]-BR-001 | | | | |
| [MOD]-BR-002 | | | | |

> Examples of business rules: "An application cannot be submitted unless all mandatory documents are uploaded." "If the applicant has an outstanding penalty, the application is held pending clearance." "Renewal applications submitted within 30 days of expiry follow the standard flow; applications submitted after expiry follow the reinstatement flow."

---

## 11. Assumptions

> Conditions that must be true for this module to work as designed. If an assumption is unvalidated, add it as an Open Question too.

- **[Assumption]:** _[State it clearly. If there is evidence, note it. If unvalidated, add an Open Question reference.]_
- **[Assumption]:** _[...]_
- **[Assumption]:** _[...]_

---

## 12. Open Questions

> Every open question must have an ID, owner, and due date. All open questions must also be logged in `../ValidationTracker.md`.
>
> Priority: **P0** = blocks design or build. **P1** = must resolve before engineering handoff. **P2** = must resolve before launch.

| ID | Question | Category | Priority | Owner | Due Date | Status |
|---|---|---|---|---|---|---|
| [MOD]-OQ-001 | | User Research / Product Decision / Technical / Market Research | P0 | | YYYY-MM-DD | Open |
| [MOD]-OQ-002 | | | P1 | | YYYY-MM-DD | Open |

---

## 13. Risks & Mitigations

| Risk ID | Risk Description | Likelihood (H/M/L) | Impact (H/M/L) | Mitigation | Owner |
|---|---|---|---|---|---|
| [MOD]-R-001 | | | | | |
| [MOD]-R-002 | | | | | |

---

## 14. Edge Cases

> Specific scenarios that require special handling beyond the standard happy path and error flows. These should inform QA test cases and engineering implementation. Cross-reference with the Scenarios in Section 6.3.

| Edge Case ID | Description | Affected Persona(s) | Required System Behaviour | Notes |
|---|---|---|---|---|
| [MOD]-EC-001 | | | | See [MOD]-US-### |
| [MOD]-EC-002 | | | | |

---

## 15. Success Criteria & Metrics

> Module-level measurable outcomes. These should roll up to the product-level OKRs in the Master PRD. At least one metric per goal defined in Section 4.

| Goal # | Success Metric | Target | Measurement Method | Reporting Frequency |
|---|---|---|---|---|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |

---

## 16. Related Documents

### Upward References
- Master Product PRD: `../[Master PRD filename].md`
- Validation Tracker: `../ValidationTracker.md`

### Sibling Module PRDs
_[Link to other Module PRDs that share a dependency or reference with this module]_

| Module | Relationship | Link |
|---|---|---|
| | Shared business rule / Upstream dependency / Downstream consumer | |

### Context & Reference
- User Personas: `../../ContextforAutomations/user_persona_context.md`
- Design Principles: `../../ContextforAutomations/design_principles.md`
- DIGIT Design System: `../../ContextforAutomations/DIGIT_Design_Principles.md`
- Company Context: `../../ContextforAutomations/company_context.md`

### Frameworks
- PRD Writing Guide: `./00_PRD_Writing_Guide.md`
- Socratic PRD Review: `../../Frameworks/socratic-questioning-prd.md`
- Devil's Advocate Framework: `../../Frameworks/devils-advocate-product-strategy.md`

### Supporting Documents
- Review Notes (if any): `../PRD_ReviewNotes_[ModuleName].md`
- Prototypes: `../../Lovable code/`
