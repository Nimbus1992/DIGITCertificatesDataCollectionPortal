Title: To Be Validated — Cross-PRD Tracker
Last updated: 12 June 2026
Owner: Tahera Bharmal

---

This document tracks all open validations, unresolved assumptions, user research tasks, and product decisions that must be answered before or during build across all DIGIT LPM SaaS PRDs. Each item is tagged by type, owner, priority, and status.

**Types:**
- User Research — requires interviews, concept testing, or usability testing with real users
- Market / Data Research — requires desk research, partner conversations, or data analysis
- Product Decision — requires a decision by product before engineering can proceed
- Technical Decision — requires an architecture or implementation decision by engineering

**Priority:**
- P0 — Must be resolved before any build begins; unblocks design or architecture
- P1 — Must be resolved before the relevant milestone ships
- P2 — Should be resolved during build; will not block start but will block completion

**Status:** Open / In Progress / Resolved

---

---

# Master Product PRD (v0.1)

---

## Product Decisions

---

**MASTER-OQ-001 — Target market priority for V1 deployments**
Type: Market Research
Priority: P0
Owner: Tahera Bharmal
Status: Resolved — 2026-06-12

**Decision:** Africa first. East, West, and Southern Africa (Djibouti, Zambia, Lesotho, Ghana, etc.) is the priority V1 target market. South Asia is in scope for V2+ but does not drive V1 localisation requirements, OSM coverage testing scope, or SI Partner readiness criteria.

---

**MASTER-OQ-002 — Multi-tenancy model**
Type: Product Decision
Priority: P0
Owner: Tahera Bharmal
Status: Resolved — 2026-06-12

**Decision:** Hybrid model confirmed. eGov Global operates a shared SaaS instance as the default. SI Partners can host their own instance where government policy or data sovereignty requirements necessitate it. Both deployment paths are supported by the product architecture.

---

**MASTER-OQ-003 — SI Partner commercial model**
Type: Product Decision
Priority: P1
Owner: eGov Commercial (not product team)
Status: Resolved — 2026-06-12

**Decision:** Out of scope for the product team and this PRD. The SI Partner commercial model is a business and commercial team decision. No product features should be designed, deferred, or prioritised based on an unresolved commercial assumption.

---

**MASTER-OQ-004 — Native mobile app for citizens (V2 scope)**
Type: Product Decision
Priority: P1
Owner: Tahera Bharmal
Status: Resolved — 2026-06-12

**Decision:** Native mobile app is not in scope, including for V2. The web-first, mobile-responsive Citizen Portal is the only citizen-facing channel. A PWA wrapper or native app may be re-evaluated after initial Africa deployments if market demand or field data justifies it. All push notification and offline application requirements are deferred pending this future evaluation.

---

**MASTER-OQ-005 — Data sovereignty and hosting policy**
Type: Technical Decision
Priority: P1
Owner: Tahera Bharmal
Status: Resolved — 2026-06-12

**Decision:** Government licensing data resides wherever the SaaS is hosted — no per-country hosting is mandated by the platform. Data sovereignty needs are addressed through REST APIs that expose government data for replication to in-country infrastructure. Governments and SI Partners can sync a copy of their data to their own systems using these APIs. This is a V2 capability under Module 16 (Integrations & API Layer) and should be spec'd in that Module PRD.

---

---

# Boundary Data Setup PRD (v0.1)

---

## User Research

---

**BR-UR-01 — Nominatim match rate audit**
Type: Market / Data Research
Priority: P0
Timeline: 1–2 weeks
Owner: Product + GIS
Status: Open

Run Nominatim geocoding queries against 20–30 jurisdictions across target markets: East Africa (Nairobi, Kampala, Dar es Salaam, Lusaka), West Africa (Dakar, Lomé, Accra, Cotonou), South Asia, and smaller markets (Djibouti City, Maseru, Sao Tome). Classify each result as: clean single match, multiple ambiguous matches, or no match.

Why it matters: This directly determines whether the OSM-first architecture is viable as the primary path. If no-match or ambiguous-match rates exceed 30–40% in target markets, the OSM-first flow fails as a UX experience and Path B becomes the de facto primary — a path that has its own open questions.

---

**BR-UR-02 — Shapefile availability research by market**
Type: Market / Data Research
Priority: P0
Timeline: 2–3 weeks
Owner: Product + GIS
Status: Open

For each priority target market, answer: does an authoritative shapefile exist, who produces it, is it publicly available, what format and coordinate reference system is it in, and how is it obtained (download, formal request, purchase)? This is the answer to OQ1 and determines whether Path B1 (shapefile) is a real fallback or a theoretical one. Excel upload (Path B2) de-risks the scenario where shapefiles are inaccessible but does not eliminate the need for this research — geographic capabilities are significantly degraded without a shapefile.

Why it matters: Path B1 being unavailable in a target market means that market is permanently in limited boundary mode unless the platform builds additional data sourcing capabilities.

---

**BR-UR-03 — Contextual interviews with Administrators and SI Partners**
Type: User Research
Priority: P0
Timeline: 3–4 weeks
Owner: UX Research
Status: Open

Conduct 5–7 contextual interviews with users matching the Administrator persona and with SI Partners who have completed recent deployments in Africa. Focus areas: how the current onboarding flow works end-to-end, who is physically present during setup, which decisions require internal consultation before they can be made, what "getting it wrong" has felt like in past deployments. Target at least two SI Partners with Africa deployment experience.

Why it matters: The PRD assumes a single Administrator can complete setup independently in one sitting. Research may reveal that setup is multi-person, episodic, and politically consultative — which would change the session design, the collaboration model, and the 5-minute KR.

---

**BR-UR-04 — Concept test: operational level decision**
Type: User Research
Priority: P1
Timeline: 2 weeks (during design phase)
Owner: UX Research
Status: Open

Before finalising the hierarchy selection screen, run a moderated concept test with 4–6 users matching the Administrator persona. Present them with a sample hierarchy (3–5 levels for a fictional jurisdiction) and ask them to select the operational level using only the information the product provides. Do not coach or explain beyond what the screen shows.

Why it matters: The operational level selection determines where applications are filed, how staff are assigned, and how dashboards aggregate. Getting it wrong post-go-live is the highest-consequence reversible error in the setup flow. If users cannot make this decision correctly with the information provided, the screen design is insufficient.

---

**BR-UR-05 — Terminology research by target market**
Type: Market / Data Research
Priority: P1
Timeline: 2 weeks (before UI copy is finalised)
Owner: Product
Status: Open

Collect the local government terminology for boundary hierarchy levels in at least three priority target markets. Source from official government documents, not assumption. Identify the terms governments use for each administrative level (country, state/region, district, sub-district, ward) and confirm whether these terms are defined by statute or convention.

Why it matters: The label rename step in boundary setup assumes users will know what to rename to. If the product's default labels (OSM labels) are far from the user's native terminology, the rename step creates cognitive friction and political risk. Getting the defaults right reduces the configuration burden.

---

**BR-UR-06 — Administrator knowledge of their own boundary structure**
Type: User Research
Priority: P1
Timeline: Can be folded into BR-UR-03
Owner: UX Research
Status: Open

During or alongside contextual interviews (BR-UR-03), assess: can Administrators name all hierarchy levels in their jurisdiction? Do they know the count of boundaries at each level? Do they know which level is "operational" for licensing without prompting? Do they use formal names or colloquial names for boundaries?

Why it matters: The name-and-count verification panel added to Step 2 only works if Administrators can recall names and counts from memory. If they cannot, the verification mechanism does not provide meaningful confidence — and the design needs a different approach.

---

**BR-UR-07 — SI Partner handoff experience**
Type: User Research
Priority: P1
Timeline: 2 weeks (during build)
Owner: Product + UX Research
Status: Open

Run a short design sprint (not full research) to understand what SI Partners need when setting up boundary data on behalf of a government client: do they need multi-tenant account management, the ability to configure on behalf of a client without being the permanent account owner, a configuration checklist or handover document? Validate with two SI Partners.

Why it matters: SI Partners will conduct many first deployments. If the product is designed only for a government official acting alone, the SI Partner's actual setup workflow is an unofficial workaround — which creates support risk and deployment inconsistency.

---

## Product Decisions (Open Questions)

---

**BR-PD-01 — Is hierarchy depth mutable post-go-live?**
Type: Product Decision
Priority: P0
Owner: Product + Engineering
Status: Open

The PRD currently restricts hierarchy depth changes post-go-live unless no live applications exist. A definitive decision is needed: either hard-lock hierarchy depth at setup, or build a migration flow for depth changes. This cannot be deferred — it shapes the data architecture before build begins.

Options:
- Hard-lock at setup: simpler architecture, creates a ceiling for jurisdictions whose administrative structure changes
- Restricted with migration flow: more complex, but prevents permanent lock-in for long-running deployments
- Restricted unless no live applications: current PRD position — needs engineering confirmation that this is implementable without a full migration

---

**BR-PD-02 — Does a Service Owner override freeze boundary data or continue inheriting updates?**
Type: Product Decision
Priority: P0
Owner: Product
Status: Open

When a Service Owner modifies the system-level boundary for their service, do future system-level boundary changes by the Administrator automatically apply to the service, or does the override freeze the service at the point of divergence? The recommended MVP position is snapshot-on-override (simpler), but this needs a formal decision before schema design begins. The answer changes the database schema.

Options:
- Snapshot on override (recommended for MVP): Service Owner's config is a full copy at the time of override. System-level changes never propagate. Simpler architecture.
- Live reference with opt-out: Service Owner inherits system-level changes by default unless they explicitly block them. More complex, requires change propagation logic.

---

**BR-PD-03 — What is the OSM data refresh cadence, and is a manual refresh option needed?**
Type: Product Decision + Technical Decision
Priority: P1
Owner: Platform / Infra
Status: Open

The system surfaces an OSM refresh date. How frequently is OSM data re-ingested into the platform? If the refresh cadence is quarterly or less frequent, Administrators in countries with rapidly changing boundaries may need a "request refresh" option. The cadence decision determines whether the displayed refresh date is a meaningful signal or a misleading one.

---

**BR-PD-04 — Does the WHO Geospatial DB require direct platform integration?**
Type: Product Decision
Priority: P2
Owner: Product + future product leads (Health Campaign Management)
Status: Open

Currently out of scope: Administrators sourcing WHO data download shapefiles manually and upload via Path B1. If Health Campaign Management or other products onboard at scale, direct API integration with WHO Geospatial DB may be needed. Requires validation with the Health Campaign Management team before their onboarding begins.

---

**BR-PD-05 — What is the Excel upload file specification?**
Type: Product Decision
Priority: P0
Owner: Product + Engineering
Status: Open

The PRD introduces Excel upload (Path B2) as a non-geographic boundary input. Before engineering begins, the exact file specification must be defined: required column names, accepted hierarchy depth, how parent-child relationships are expressed, what happens when a boundary has no parent (top-level), and how the system handles duplicate or blank names. This spec becomes the basis for validation logic and the template the Admin downloads.

Why it matters: Without a defined spec, engineers cannot build consistent validation and Admins will not know what to prepare.

---

**BR-PD-06 — How does shapefile upgrade work for Excel-based instances?**
Type: Product Decision
Priority: P1
Owner: Product + Engineering
Status: Open

The PRD states that Admins can upload a shapefile at any time to convert an Excel-based configuration to full geographic mode. The mechanism for this conversion is undefined: does the system match shapefile polygons to Excel boundary names automatically (by exact name match)? What happens when names don't match exactly (capitalisation, spelling variants)? Is there a manual mapping step? This needs a defined flow before the upgrade path can be built.

---

## Technical Decisions

---

**BR-TD-01 — Does the boundary versioning store exist, or is it net-new?**
Type: Technical Decision
Priority: P0
Owner: Engineering
Status: Open

The PRD requires a boundary versioning store — a platform-level capability that logs every boundary change with effective dates and links changes to historical records. Before any MVP work begins, engineering must confirm whether this store exists in the current platform and whether its schema supports this feature's requirements, or whether it must be built from scratch. If net-new, it is the longest-lead item and must begin immediately.

---

**BR-TD-02 — Spatial processing infrastructure: is PostGIS or equivalent available?**
Type: Technical Decision
Priority: P0
Owner: Engineering
Status: Open

Shapefile gap detection requires server-side topological processing (computing the union of polygons, diffing against a parent boundary). This requires a spatial processing library such as PostGIS, Shapely, or GDAL running in the backend. Engineering must confirm what is available in the target deployment environment. This also determines the feasibility and latency of gap detection — for large shapefiles, this can take 30–60 seconds and must be async.

---

**BR-TD-03 — Nominatim deployment strategy**
Type: Technical Decision
Priority: P0
Owner: Engineering + Infra
Status: Open

The public Nominatim API has a 1 req/sec rate limit and prohibits bulk or automated usage. Multiple simultaneous admin onboarding sessions will trigger rate limiting. A decision is required before build: self-hosted Nominatim instance (requires OSM planet or regional extract import, significant infra investment) or commercial provider (Geoapify, LocationIQ — has per-request cost). This is an infrastructure and budget decision, not an implementation detail.

---

**BR-TD-04 — Maximum polygon feature count for MVP**
Type: Technical Decision
Priority: P1
Owner: Engineering + Product
Status: Open

Engineering must define an upper bound on polygon features per shapefile for the MVP. This determines the Leaflet rendering strategy (raw GeoJSON vs. vector tiles), the acceptable processing time for gap detection, and whether the system needs async processing from day one for all uploads or only for large ones. Recommended cap: 10,000 polygon features. Above this, the Admin should be directed to the implementation team.

---

**BR-TD-05 — What constitutes an "in-progress application" for deactivation blocking?**
Type: Technical Decision
Priority: P1
Owner: Engineering + Product
Status: Open

The deactivate boundary flow checks for active in-progress applications before permitting deactivation. Engineering needs a precise definition of which application statuses qualify as "in-progress" (e.g., any application not in a terminal state: approved, rejected, withdrawn). This definition must be consistent with how the application filing module defines terminal states.

---

**BR-TD-06 — Audit trail enforcement mechanism**
Type: Technical Decision
Priority: P1
Owner: Engineering
Status: Open

The boundary audit trail is described as read-only and cannot be deleted — a compliance requirement for a government system. Application-level enforcement (no delete API) is insufficient; a database administrator could still delete rows. Engineering must specify the enforcement mechanism: append-only database tables, write-once object storage, a dedicated audit log service, or equivalent. This must be decided before the versioning store is designed.

---

**BR-TD-07 — OSM admin_level to local hierarchy mapping table: ownership and process**
Type: Technical Decision + Product Decision
Priority: P1
Owner: Product + Engineering
Status: Open

OSM uses admin_level tags (values 1–10) to represent administrative hierarchy. The meaning of each level is country-specific and inconsistently applied across OSM. Surfacing "all hierarchy levels" for a confirmed jurisdiction requires a country-specific mapping table that translates OSM admin_level values to human-readable hierarchy labels. Who builds and maintains this table? Is it a product/data responsibility (manually maintained per country), or will engineers build a configuration UI for it? Who populates it when a new country is onboarded?

---

**BR-TD-08 — Concurrent admin session handling**
Type: Technical Decision
Priority: P1
Owner: Engineering
Status: Open

If two Administrators from the same government entity are in the boundary setup flow simultaneously, the system has no specified behaviour. Last-write-wins would be dangerous — the second confirmation could overwrite the first. Engineering must specify a concurrency control mechanism: pessimistic locking (only one admin can be in the setup flow at a time), optimistic locking (detect and surface conflicts at commit time), or session isolation with a merge step.

---
