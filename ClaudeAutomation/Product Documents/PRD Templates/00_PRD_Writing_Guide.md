# PRD Writing Guide — License & Permits Product

**Version:** 1.1
**Last Updated:** 2026-06-12
**Owner:** Product Team

---

## Purpose

This guide governs how Product Requirements Documents (PRDs) are written for the License & Permits (L&P) product. It defines the two-tier PRD system, pre-writing requirements, writing standards, and a complete set of dos and don'ts. Read this before writing or reviewing any PRD.

This guide does not replace the Frameworks PRD Template — it extends it with product-specific standards for L&P.

**Related:** `../../Frameworks/PRD Template`

---

## The Two-Tier PRD System

The L&P product uses two types of PRDs that serve different audiences and purposes.

| | Master Product PRD Template | Module PRD Template |
|---|---|---|
| **Template file** | `01_PRD_Template_MasterProduct.md` | `02_PRD_Template_Module.md` |
| **Audience** | Executive sponsors, new team members, cross-functional stakeholders, SI partners | Engineering, design, QA, product — anyone building or reviewing a specific area |
| **Scope** | Entire product: vision, interfaces, all modules, high-level features | One module: user stories, acceptance criteria, business rules, edge cases |
| **Level of detail** | Summary — enough to understand the whole product, not enough to build it | Sufficient to build and test without ambiguity |
| **Number of files** | One file for the whole product | One file per module |
| **When to create** | At product inception and updated at major milestones | When a module moves into active design or build |

**Rule:** If a reader needs to know WHAT the product does at a glance → use the Master Product PRD Template. If a builder needs to know HOW a feature should behave → use the Module PRD Template.

---

## Mandatory Pre-Reads

Before writing any PRD section that references users, design, or strategy, you must be familiar with the following files. Do not duplicate content from them — link to them.

| File | What it covers | Why it matters |
|---|---|---|
| `../../ContextforAutomations/user_persona_context.md` | All user personas: goals, frustrations, key needs | All persona names in PRDs must come from this file exactly |
| `../../ContextforAutomations/design_principles.md` | 13 product design principles | Requirements must align with these; Citizen First is the tiebreaker |
| `../../ContextforAutomations/DIGIT_Design_Principles.md` | DIGIT design system: typography, colour, components, accessibility | UX requirements must reference, not contradict, these standards |
| `../../ContextforAutomations/company_context.md` | eGov Foundation background, strategic positioning | Provides the "why this product exists" context for Master PRD Section 4 |

---

## Persona Quick-Reference

All seven personas recognized in the L&P product. Use these names exactly — no abbreviations, no paraphrasing, no new names invented inline.

| # | Persona Name | Type |
|---|---|---|
| 1 | Service Owner | Product-level |
| 2 | Citizen / Entity (Applicant) | Product-level |
| 3 | Field and Office Employee (Licensing Clerk / Processor) | Product-level |
| 4 | Administrator | Product-level |
| 5 | End User / Enforcement Officer | Product-level |
| 6 | SI Partner / Implementation Partner | Platform-level |
| 7 | eGov Product / Operations Team | Platform-level |

For full persona profiles (goals, frustrations, key needs, value props) refer to `../../ContextforAutomations/user_persona_context.md`.

**If you need a persona not in this list:** Do not invent one. Flag it in an Open Question with the suggested new persona name and rationale. Ask the product owner whether a new persona should be added to the context file before using it in a PRD.

---

## PRD Lifecycle & Status Definitions

Every PRD must carry one of the following status values in its Document Control section.

| Status | Meaning | Who can move to this status |
|---|---|---|
| **Draft** | In progress; not ready for review | Author |
| **In Review** | Shared for structured feedback; no major changes until review is closed | Author after self-review checklist complete |
| **Approved** | Reviewed and signed off; safe to hand off to engineering | Product Owner + at least one reviewer |
| **Deprecated** | Superseded by a newer version or descoped; kept for reference | Product Owner |

Version number increments: minor (x.1) for non-structural edits, major (x+1) for scope or persona changes.

---

## How to Update the ValidationTracker

Every numbered Open Question in a PRD must have a corresponding entry in `../ValidationTracker.md`.

When you add an Open Question:
1. Assign it a unique ID: `[MODULE-###]` (e.g. `APP-001`, `MASTER-003`)
2. Add it to ValidationTracker with: ID, question text, category (User Research / Market Research / Product Decision / Technical Decision), priority (P0/P1/P2), owner, due date, and status (Open)
3. When resolved, update both the PRD and the ValidationTracker — mark status as Resolved and add the resolution note

P0 = blocks design or build. P1 = needs resolution before handoff. P2 = nice to resolve before launch.

---

## DOs

**Writing and structure:**

1. **State the problem before the solution.** Every PRD section that proposes a feature or requirement must first explain the problem it solves. The "what" is only meaningful after the "why."

2. **Use canonical persona names verbatim.** Copy names exactly from the table above. Case, slash, and parenthetical must match (e.g. "Field and Office Employee (Licensing Clerk / Processor)" not "Licensing Clerk").

3. **Assign an owner and due date to every Open Question.** "TBD" with no owner is a dead end. If no owner is known at writing time, flag it as a meta-question ("Who owns this decision?") and assign it to the Product Owner.

4. **Specify priority for every feature.** Use P0 / P1 / P2 to indicate importance within MVP scope. A feature without a priority cannot be triaged when scope cuts are needed. If a feature is not in MVP scope, it must appear in Non-Goals — not assigned a future-version label.

5. **Reference context documents; never copy them.** Use a relative Markdown link. Duplicating content creates drift — the source file will be updated and your copy will not.

6. **Keep the Master PRD at summary level.** If you are writing more than 3 sentences about how a feature behaves, that content belongs in a Module PRD. The Master PRD is a navigation document, not a spec.

7. **Write in plain language.** Assume the reader is a competent professional unfamiliar with the specific domain. Avoid acronyms on first use; define them inline.

8. **Document non-goals explicitly.** Readers need to know what the product deliberately does not do, as clearly as what it does. Non-goals prevent scope creep and misaligned expectations.

9. **Include measurable success criteria.** "Users can submit faster" is not a criterion. "80% of applications submitted without assistance" is. Tie module-level metrics back to product-level OKRs.

10. **Identify primary vs. secondary personas per feature.** A feature may touch multiple personas but have one who is the primary beneficiary. This determines whose needs take priority when trade-offs arise.

11. **Specify priority for every module and feature.** Use P0 / P1 / P2 to indicate relative importance within MVP scope. If a module or feature is not in MVP scope, state it explicitly in Non-Goals.

12. **Update the ValidationTracker every time you add or close an Open Question.** The tracker is the single source of truth for what is unresolved across all PRDs.

---

## DON'Ts

**Persona and scope:**

1. **Don't invent persona names.** If the person you're describing doesn't match any of the 7 canonical personas, flag it and ask — don't create an inline variant like "State Admin" or "License Inspector."

2. **Don't put module-level detail in the Master PRD.** Acceptance criteria, business rules, and edge cases belong in the relevant Module PRD. The Master PRD links to them; it does not contain them.

3. **Don't conflate features with user stories.** A feature is WHAT the system does. A user story is WHO needs it and WHY. Both are required, but they answer different questions and belong in different sections.

**Completeness and quality:**

4. **Don't leave "TBD" without an owner and date.** Every TBD is a commitment that something will be resolved. Ownerless TBDs accumulate and block build work.

5. **Don't treat Open Questions as optional.** They represent real uncertainty that will become a build blocker if unaddressed. Minimal open questions is a sign of a mature PRD; zero open questions in a first draft is a sign of overconfidence.

6. **Don't spec technical implementation.** PRDs define WHAT the product must do and WHY. HOW it is built belongs in the Engineering Design Document. Avoid database schemas, API contracts, infrastructure choices, and technology stack decisions.

7. **Don't embed wireframes or mockups.** Insert a prototype link instead. Embedded images bloat the file, go stale, and cannot be commented on. All visual references must link to the designated prototype in the Lovable code folder — not copied or attached inline.

8. **Don't write requirements as implementation instructions.** "The system shall display a modal" is a design decision. "The user must be able to confirm before submitting irreversible actions" is a requirement. Write the second form; let design decide the first.

**Consistency:**

9. **Don't use different status labels across PRDs.** Use only: Draft, In Review, Approved, Deprecated. Using "WIP," "Final," "Ready," or "Active" breaks the shared lifecycle system.

10. **Don't describe the same feature in two Module PRDs.** If two modules share a behaviour (e.g. notification logic), pick one module to own it and have the other reference it. Duplication creates contradictions.

11. **Don't write the same business rule in multiple places.** Define it once in the authoritative Module PRD and reference it from others. This prevents the rule from diverging across documents.

12. **Don't skip the Non-Goals section.** It is as important as the Goals section. Stakeholders often assume scope that was never intended. Make the boundaries explicit.

---

## Self-Review Checklist Before Moving to "In Review"

Use this before sharing a PRD for structured feedback.

- [ ] Document Control is filled in: version, date, author, status, reviewers named
- [ ] All persona names match the canonical list exactly
- [ ] Every feature has a priority (In Scope / Out of Scope; P0/P1/P2 for in-scope features)
- [ ] Every Open Question has an ID, owner, due date, and a ValidationTracker entry
- [ ] No wireframes or mockups embedded (prototype links used instead)
- [ ] No technical implementation decisions made in the PRD
- [ ] Non-Goals section is present and non-empty
- [ ] Success criteria are measurable (not qualitative statements)
- [ ] All references to context documents use relative Markdown links (not copied content)
