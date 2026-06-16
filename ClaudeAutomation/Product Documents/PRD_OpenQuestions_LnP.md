# Open Questions — License and Permits SaaS PRD

**Product:** DIGIT License, Permits & Certificates (LPC) SaaS
**Owner:** Tahera Bharmal
**Last updated:** 2026-06-15

Open questions are issues that require a product decision before the relevant module can be built or finalised. Each OQ carries a resolution deadline tied to the build phase it blocks.

---

## Status Key

| Status | Meaning |
|---|---|
| Open | No decision yet |
| In Discussion | Active conversation underway |
| Resolved | Decision made — see Resolution field |
| Deferred | Will not be resolved for V1; accepted as a constraint |

---

## Open Questions

| ID | Module | Question | Why It Matters | Resolution Deadline | Owner | Status | Resolution |
|---|---|---|---|---|---|---|---|
| OQ-TCM-001 | 2 — Template Creation & Template Marketplace | If template versioning (TCM-F03) is not implemented, how does an existing account pull in new features or configurations made available in an updated template? An account's service configuration is forked from the template at the point of Use Template — without versioning, there is no upgrade path. | Without a resolution, accounts on older template versions will diverge from the product's intended configuration model over time, potentially requiring manual intervention per account. | Before Module 2 build begins | Tahera Bharmal | Open | — |
| OQ-EMP-001 | 7 — Service Configuration / Employee Portal | Should employees have a unified inbox across all services, or a service-specific inbox? | Determines the information architecture of the Employee Portal and the data model for task assignment. A unified inbox implies cross-service task aggregation at the platform level; service-specific inboxes are simpler to build but fragment the employee experience when a user is assigned to multiple services. | Before Employee Portal design begins | Tahera Bharmal | Open | — |
