Title: PRD Review Notes — Boundary Data Setup
PRD reviewed: PRD_BoundaryDataSetup.md (v0.1, 30 May 2026)
Review date: 30 May 2026
Reviewers: User Researcher Agent, Engineer Agent
Status: Draft for PM review

---

# Part 1: User Research Review

## 1. Executive Summary

**Insight 1 — The PRD is built for the product team's mental model of "setup," not the Administrator's mental model of "going live."** The Administrator's primary job is not to configure boundaries — it is to launch a government service on time and avoid blame if it goes wrong. Every design choice in this feature needs to be evaluated against that outcome pressure, not against the elegance of the GIS workflow.

**Insight 2 — The "under 5 minutes" success metric measures the wrong thing.** Speed of completion will be dominated by OSM match rate, not UX quality. The metric that actually predicts self-serve success is whether the Administrator can confidently confirm or reject OSM data without external validation — and the PRD currently has no plan to support that confidence.

**Insight 3 — The Service Owner is treated as an afterthought in a flow that structurally makes them a blocker.** The PRD's own architecture means a Service Owner cannot configure anything until the Administrator completes boundary setup, yet there is no designed handoff, notification, or fallback experience for the Service Owner waiting on that upstream dependency.

---

## 2. Key Pain Points

Ranked by estimated frequency of encounter × severity of consequence.

### P1 — "Is this boundary actually correct?" (Frequency: Universal. Severity: Critical.)

The PRD assumes Administrators will be able to visually assess whether an OSM-rendered boundary is accurate for their jurisdiction. This is an unsupported assumption. In the Global South target markets — East Africa, West Africa, South Asia — administrative boundaries change frequently due to redistricting, ward creation, and devolution reforms. An Administrator who has spent a career in that jurisdiction will often know individual ward names but will not have a mental map of precise boundary shapes at sub-ward level. Visual confirmation of a polygon on a Leaflet map is not meaningful if the user cannot cross-reference it against authoritative data they can access in the moment.

**What is missing from the PRD:** Any mechanism for the user to validate OSM accuracy beyond visual inspection. The PRD's mitigation — "display OSM refresh date prominently" — transfers the problem to the user rather than solving it. Recommending cross-check against a "known local source" assumes the user has that source, knows it is authoritative, and has time to do it during onboarding.

### P2 — "I don't have a shapefile and I don't know how to get one." (Frequency: Likely majority of first-time users. Severity: High.)

The shapefile fallback (Path B) rests on an entirely unvalidated assumption: that Administrators know what a shapefile is, where to obtain one for their jurisdiction, and can produce it in a supported format. In many target markets, national mapping agency shapefiles require formal requests, are available only in non-standard projections, or are not publicly accessible at all. OQ1 acknowledges this is unresolved, but this is not a small open question — it determines whether Path B is a real fallback or a theoretical one.

### P3 — "Who should be doing this — me or IT?" (Frequency: High in first deployment. Severity: High.)

The self-serve framing assumes a single user acting independently. The actual behavior pattern in government deployments is a committee or at minimum a two-person process — the official who has authority to confirm and the technical contact who actually operates the system. This creates UX problems the PRD does not address: collaborative decision-making, role-based access to the setup flow, and the ability to pause and resume without data loss.

### P4 — "What happens to everything I've already configured if I get this wrong?" (Frequency: High anxiety signal. Severity: High perceived, medium actual.)

Because boundary setup gates all downstream configuration, getting it wrong has a felt consequence that is much larger than the actual operational impact. The PRD does not describe how users are told this is high-stakes *before* they commit — particularly for hierarchy depth selection, which OQ2 acknowledges is the highest-consequence open question. The wrong moment for that realization is after confirmation.

### P5 — "The system shows me one boundary when reality has changed." (Frequency: Near-certain in some target markets. Severity: High operational impact.)

OSM data is 4–5 years stale in approximately 90 countries. For East Africa specifically — where ward-level redistricting, devolution reforms (Kenya, Uganda, Tanzania), and new urban growth areas are common — a 4-year-old boundary set is not a minor inconvenience; it is likely meaningfully wrong. An Administrator who confidently confirms stale OSM data will not discover the problem until downstream service operations fail, at which point the fix requires V2 features.

---

## 3. User Patterns and Behaviors

| PRD Assumption | Likely Reality |
|---|---|
| Administrator completes setup in one sitting | Government officials work in episodic, interrupted sessions. Step 1 (account creation) and Step 2 (boundary review) may be separated by days. No session persistence or resume logic is specified. |
| Visual map confirmation is sufficient for non-GIS users | Non-GIS users will accept plausible-looking polygons without meaningful validation — anchoring to the map, not verifying it. This is false confidence, not genuine confirmation. |
| Renaming labels is a quick, optional text-field task | Terminology mapping is politically sensitive in government contexts. "Division" vs "Sub-county" may reflect jurisdictional authority defined by statute. This step may require internal consultation. |
| Service Owner will proactively review the system-level boundary config | Service Owners will wait for a message from the Administrator telling them "it's done, go ahead." There is no notification or handoff mechanism designed. |
| Map-click fallback works for users who can't find via search | Clicking on a country-level map to identify a specific ward requires spatial literacy the PRD explicitly says users may not have. This fallback works for country/state level; it fails at operational-boundary level. |

---

## 4. Personas and Segments

**The "Administrator" collapses two different roles that may belong to different people.** Account creation (Step 1) will often be done by a technical contact or SI Partner; boundary hierarchy selection (which level is "operational") requires institutional knowledge the technical contact may not have.

**The SI Partner is effectively invisible but will likely do most of the actual work.** The business motivation for this feature is to remove the dependency on the implementation team — but the SI Partner is a platform-level user so the PRD only addresses Administrator and Service Owner needs. In practice, SI Partners will set up many first deployments on behalf of government clients. The needs of that handoff moment are entirely unaddressed.

**The Service Owner is entirely reactive.** They have no ability to accelerate or unblock boundary setup if the Administrator has not completed it. For a persona whose core frustration is "waiting for others to act upstream," this is a significant unmet need created by the feature itself.

**Missing segment: the first-time deployer in a low-resource country context.** Target markets include Djibouti, Lesotho, and Guinea-Bissau. The Administrator persona as defined implies internet access, a modern browser, and the ability to upload a shapefile. The PRD does not consider what happens when the OSM match fails and obtaining a shapefile requires weeks of lead time from a national mapping agency.

---

## 5. Jobs-to-Be-Done

### Administrator

- **Functional JTBD:** "When I am deploying a government licensing system, I want to confirm that the platform's boundary data matches my jurisdiction's official administrative divisions so I can launch services that work correctly without needing technical support."
- **Emotional JTBD:** "I want to feel confident I haven't made a configuration mistake that will be hard or embarrassing to fix later."
- **Social JTBD:** "I want to be seen as a capable, self-sufficient official who does not need to escalate every technical decision to a vendor."

The PRD addresses the Functional JTBD moderately. It does not address the Emotional JTBD — the design does not give the Administrator a way to feel confident their confirmation is correct. The Social JTBD is the actual motivation for the self-serve framing and is never stated; it explains why warning messages about stale OSM data cannot simply say "ask your IT team to check."

### Service Owner

- **Functional JTBD:** "When I am configuring a new license type, I want to understand what geographic boundaries my service will operate within and confirm they match my operational geography."
- **Emotional JTBD:** "When I inherit a configuration made by someone upstream, I want to understand what I'm inheriting and what I can safely change without breaking something."
- **Social JTBD:** "I want to be the person who makes decisions about my service's configuration — not be dependent on or accountable to decisions made by others."

The PRD underserves all three dimensions for the Service Owner.

**Core JTBD gap — "Help me get this right the first time."** Both personas have a strong need to avoid rework. The PRD's V2 handles errors after they occur, but the MVP provides almost no mechanisms to increase first-time accuracy. This is the most important JTBD gap.

---

## 6. Product Implications

**OSM match rate in target markets is unknown and is the most critical product risk.** If Nominatim returns no match or an ambiguous match for more than 30–40% of target market jurisdictions, the OSM-first flow fails as a UX experience and Path B becomes the de facto primary path — a path the PRD has not validated.

**Hierarchy selection is a decision that requires organisational context the UX cannot provide.** The choice of operational level is not a GIS question — it is an administrative and political question. The PRD treats this as a single-session decision made by one user. If this assumption is wrong, setup abandonment at hierarchy selection will be high.

**The "inherit vs. override" decision for Service Owners will produce fragmentation at scale.** The mitigation — "make override a deliberate, acknowledged action" — is a friction mechanism, not a design solution. The PRD does not describe what scenario legitimately requires a Service Owner to have different boundaries than the system-level config. Without understanding real use cases that drive override, the design cannot distinguish legitimate divergence from uninformed divergence.

**The 5-minute KR is not user-researchable as specified.** A user can complete setup in 3 minutes by confirming stale OSM data that will require correction at V2. Time-to-completion measures task completion, not task correctness.

---

## 7. Research Gaps

| # | Gap | Priority |
|---|---|---|
| R1 | What does an Administrator do when they encounter a step they cannot complete independently? Do they abandon, escalate, or proceed with best-guess? | High |
| R2 | What is the Administrator's working relationship with their SI Partner during onboarding? Is the SI Partner in the room, accessible by phone, or reachable only via support ticket? | High |
| R3 | What do Administrators in target markets actually know about their boundary structure — hierarchy levels, official names, operational level? | High |
| R4 | What is the actual availability, format, and CRS of government shapefiles in each target market? (This is OQ1 but must be treated as primary research, not a product open question.) | High |
| R5 | How do Service Owners find out that the Administrator has completed boundary setup? Currently: they don't. | Medium |
| R6 | What mental model do non-GIS government users have of "boundary data"? What terms do they use natively? | Medium |
| R7 | What is the consequence of getting hierarchy selection wrong, from the user's perspective — not the technical perspective? | Medium |

---

## 8. Recommended Next Steps (Research)

**Before build begins:**

- **RS1 — Nominatim match rate audit (1–2 weeks, GIS + Product).** Run Nominatim queries against 20–30 jurisdictions across target markets: East Africa, West Africa, South Asia, and smaller markets (Djibouti, Lesotho, Sao Tome). Classify as: clean single match, multiple ambiguous matches, no match. This directly determines whether the OSM-first architecture is viable as the primary path.
- **RS2 — Shapefile availability research by market (2–3 weeks, Product + GIS).** For each priority target market: does an authoritative shapefile exist, who holds it, what format and CRS, how current is it, how is it obtained? This is the answer to OQ1.
- **RS3 — 5–7 contextual interviews with Administrators and SI Partners (3–4 weeks, UX Research).** Focus on: how the current onboarding flow works, who is present during setup, what decisions require consultation, what "getting it wrong" has felt like. Target at least two SI Partners with recent Africa deployments.
- **RS4 — Concept test: "operational level" decision.** Before finalising the hierarchy selection screen, run a moderated concept test with 4–6 Administrator-persona users to verify they can select the correct level using only the information the product provides.

**During build:**

- **RS5 — Terminology research by target market.** Collect hierarchy labels used in official government documents in at least three target markets before UI copy is finalised.
- **RS6 — Define the SI Partner handoff experience.** Short design sprint (not full research) to understand what SI Partners need when setting up on behalf of a client.
- **RS7 — Design and test the Service Owner waiting state.** A Service Owner landing in the platform before Administrator completion is a certainty, not an edge case. Specify and test a notification or in-app indicator for this state.

---

---

# Part 2: Technical Review

## 1. Technical Feasibility

**Overall verdict: Buildable, but the PRD understates infrastructure complexity by a significant margin.**

The core flows are feasible. OSM Nominatim geocoding is a well-understood public API. Leaflet rendering is straightforward. Shapefile parsing has mature libraries (e.g., `shapefile` in Node, `fiona`/`pyproj` in Python, `gdal` via CLI). The versioning concept is sound.

However, several dependencies marked "out of scope" are **blocking prerequisites** for MVP:

- **OSM ingestion pipeline** is marked out-of-scope, but Step 2 Path A requires rendering all hierarchy levels for a confirmed jurisdiction. That data has to come from somewhere. If the backend does not have pre-loaded, structured OSM boundary data per country, the feature cannot render hierarchy levels — it can only show a shape outline from Nominatim, which is not the same thing. This is a **hard dependency, not a soft one**.
- **Tile rendering infrastructure** is "assumed" but not decided. Serving the admin's own boundary layers (shapefile-derived or OSM-derived) requires vector tile generation or dynamic GeoJSON serving — materially different engineering paths with different cost and latency implications.
- **Boundary versioning store** is flagged as a platform-level capability. If it does not exist yet, MVP cannot be delivered without building it first. The PRD does not indicate whether this store exists or is net-new.

**Additional constraints:**
- Nominatim's public endpoint enforces a 1 req/sec rate limit and prohibits bulk or automated usage. Multiple simultaneous admin onboarding sessions will trigger rate limiting. A self-hosted Nominatim instance or commercial provider (Geoapify, LocationIQ) is required for production.
- Shapefiles from national mapping agencies can be 100MB+ for dense urban ward data. Upload, parse, and validation pipelines must handle this without timing out or blocking the request thread.
- OSM boundary completeness varies dramatically by country. The feature works well for Western Europe and major urban centres; it degrades significantly for parts of Sub-Saharan Africa, South Asia, and smaller municipalities globally. For the target user base, this is a primary problem, not an edge case.

---

## 2. Implementation Complexity

### MVP Components

| Component | Effort | Notes |
|---|---|---|
| Nominatim geocoding + match display | Low (3–5 days) | API wrapper + Leaflet layer rendering |
| Multi-match simultaneous map render | Low–Medium (2–3 days) | Highlight/select UX needs care |
| No-match fallback flow | Low (1–2 days) | State machine, UI branching |
| Shapefile upload + parse | Medium (1–2 weeks) | GDAL dependency, error taxonomy, large file handling |
| CRS validation + normalisation | Medium (1 week) | Reprojection to WGS84; edge cases with non-standard CRS codes |
| Geometry gap detection + visual render | Medium–High (1–2 weeks) | Topological gap detection is non-trivial; visual overlay on Leaflet adds complexity |
| Hierarchy level selection UI | Low (2–3 days) | Depends on data model being clean |
| Terminology label rename (pre-go-live) | Low (2 days) | Simple key-value override store |
| OSM hierarchy data backend | **High (2–4 weeks, separate team)** | Requires ingestion pipeline, structured storage, country-level partitioning. Underestimated blocker. |
| System-level boundary config commit | Medium (1 week) | Data model + propagation rules to services |
| Service Owner independent override | Medium (1 week) | Fork in boundary config, isolation logic |
| Boundary versioning store (if net-new) | **High (3–5 weeks)** | Core platform capability; affects data model for all downstream modules |

**MVP total (assuming OSM pipeline and versioning store already exist): ~6–10 weeks for a focused team of 3 engineers.**

**MVP total (if OSM pipeline and versioning store are net-new): 14–20 weeks. This is not a milestone — this is a programme.**

### V2 Components

| Component | Effort | Notes |
|---|---|---|
| Boundary list/map view with filter/search | Medium (1–2 weeks) | Spatial indexing for search |
| Add new boundary under parent | Medium (1 week) | Requires clean parent-child data model |
| Rename with version snapshot | Medium (1–2 weeks) | Snapshot logic, label-at-time-of-record retrieval |
| Deactivate boundary (with check) | High (2–3 weeks) | Must query active in-progress applications; reassignment workflow |
| Ward split with effective date | **Very High (3–5 weeks)** | Most complex operation in the entire spec |
| Audit trail | Medium (1 week) | Append-only log with indexed queries |
| Cross-service boundary fragmentation surface | Medium (1–2 weeks) | E7 notification + opt-in sync |
| Post-go-live shapefile replacement + reconciliation view | High (2–3 weeks) | E6 requires version-aware record linkage |

**V2 total: 12–20 additional weeks.**

---

## 3. Key Challenges

**Challenge 1: OSM data structure is not uniform across countries.**
OSM uses `admin_level` tags (1–10) to represent hierarchy. The meaning of each level is country-specific and inconsistently applied. In India, `admin_level=4` is a state; in Kenya, it may be a county or missing entirely. The backend cannot generically expose "all hierarchy levels" without a country-specific mapping table. The PRD assumes this is solved; it is not.

**Challenge 2: Geometry gap detection is harder than it sounds.**
Detecting topological gaps between polygons requires computing the union of all uploaded polygons and diffing against the parent boundary polygon using a spatial processing library (PostGIS, Shapely, GDAL). For large shapefiles with thousands of features, this can take 30–60 seconds. The PRD does not acknowledge this latency or whether it should be synchronous or async.

**Challenge 3: Boundary versioning is architecturally foundational.**
Before any MVP work begins, the team needs consensus on:
- Is a "boundary version" a full snapshot of geometry + labels, or a diff/patch?
- Do downstream records reference a boundary by ID only, or by (ID + version)?
- Is version resolution at read time or write time?

Getting this wrong means migrating production data on a government compliance system.

**Challenge 4: CRS normalisation edge cases.**
Shapefiles from national mapping agencies frequently use country-specific projected CRS (India's Everest spheroid, Kenya's Arc 1960). Reprojecting to WGS84 is automated with GDAL but introduces precision loss and occasional failures for unusual EPSG codes. Engineers need a defined error path for when GDAL cannot resolve the CRS.

**Challenge 5: Service Owner boundary independence vs. system propagation (OQ4).**
"Inherit" could mean three different things, each requiring a different architecture:
- Copy at time of override (snapshot — never auto-updates)
- Live reference with opt-in sync (requires change propagation logic)
- Live reference with opt-out capability (requires change blocking logic)

This must be decided before schema design begins.

**Challenge 6: Ward split is the most dangerous operation in the spec.**
Splitting a boundary post-go-live with active applications in flight requires transactional integrity across the boundary store and the application records store, which may live in different services. It is functionally a double-write problem with manual reconciliation. The PRD describes the desired behaviour correctly but underestimates the coordination cost.

**Challenge 7: Nominatim on the public endpoint is not production-safe.**
The public API has a strict 1 req/sec rate limit and prohibits bulk usage. A self-hosted Nominatim instance requires its own OSM data import, which is a non-trivial infrastructure investment. This must be decided in infrastructure planning.

---

## 4. Performance and Scalability

**Shapefile upload and processing:** Large shapefiles will overwhelm a synchronous request handler. Upload must go directly to object storage (S3/GCS) via signed URL. Processing must be async with a job queue. The UI must show processing status. None of this is described in the PRD.

**Geometry rendering on Leaflet:** Serving thousands of polygon features as raw GeoJSON is viable at < 500 features but degrades at 5,000+. For ward-level data in large cities (Mumbai: 227 wards, Lagos: hundreds of wards), this is borderline. For countries with 10,000+ administrative units, the browser will stall. The PRD should specify an upper bound on expected feature count or call out tile-based serving as a requirement.

**Gap detection processing:** CPU-intensive topological union operations must be async. The PRD describes this as happening during the upload flow without addressing latency.

**Versioning query performance:** Queries like "show all applications in Ward X as of date D" require joining through the version table. Proper indexing (boundary_id, effective_from, effective_to) is required from day one. Retrofit is painful at scale.

**Scalability verdict:** The system will scale adequately for the described use case (government onboarding, not consumer-scale) if async processing, spatial indexing, and proper tile serving are implemented. The risk is not eventual scale — it is that the MVP spec does not account for the async patterns required even at small scale.

---

## 5. Recommendations

**R1: Resolve the OSM ingestion pipeline scope conflict before sprint planning.**
The PRD marks OSM ingestion as out of scope while requiring its output for Path A. Either bring it into scope as a prerequisite epic, or downscope Path A to "Nominatim outline only" (single shape, no sub-hierarchy). Do not let engineering discover this dependency mid-sprint.

**R2: Define the boundary versioning data model in a separate technical design doc before any MVP coding starts.**
This is the foundational schema that all other features depend on. It must be reviewed by the leads for application filing, inspector assignment, and dashboards before it is committed.

**R3: Shapefile upload must be async with a job queue from day one.**
Do not build a synchronous upload-parse-validate flow and plan to make it async later. Design async from the start: presigned upload URL → object storage → parse job → validation job → result callback → UI polling or websocket status.

**R4: Specify Nominatim deployment strategy explicitly.**
The spec must state whether the platform will run a self-hosted Nominatim instance or use a commercial provider. This is an infrastructure and budget decision, not an implementation detail.

**R5: Hardcode accepted CRS and handle the rest as a clear error.**
Define WGS84 (EPSG:4326) and Web Mercator (EPSG:3857) as accepted inputs, and offer GDAL-based reprojection for a defined list of common national CRS codes. For anything else: "Unrecognized coordinate reference system. Please re-export in WGS84."

**R6: Answer OQ4 (Service Owner inheritance model) before schema design.**
This is not a question to defer — it directly determines whether the boundary config table has a foreign key to the system config or a full copy. Recommended for MVP: snapshot-on-override (simpler). Live-reference-with-sync is significantly more complex.

**R7: Set a maximum shapefile feature count for MVP.**
Cap the initial release at a defined limit (e.g., 10,000 polygon features). This bounds gap detection compute, Leaflet rendering performance, and storage per jurisdiction. If a jurisdiction exceeds this, require them to contact the implementation team.

**R8: Ward split should be V3, not V2.**
The ward split feature is the most complex operation in the spec. It requires transactional integrity across services, a manual reassignment workflow, and permanent geometry preservation with version linkage. Shipping it alongside basic CRUD boundary management in the same V2 milestone is a scope risk.

---

## 6. Open Questions for Engineering

These are in addition to the PRD's own OQ1–OQ5.

| # | Question | Why it blocks |
|---|---|---|
| OQ-E1 | Does the boundary versioning store exist today, or is it net-new? | If net-new, it is the longest-lead item and must start immediately |
| OQ-E2 | What is the target deployment environment for spatial processing? Does the backend have PostGIS? Is GDAL in the runtime? | Determines which geometry validation libraries are available |
| OQ-E3 | What is the expected maximum number of polygon features per jurisdiction? | Drives Leaflet rendering strategy (GeoJSON vs. vector tiles) and gap detection time |
| OQ-E4 | How do downstream modules (application filing, inspector assignment) currently reference boundaries — by string name, ID, or other? | Versioning model must be backward-compatible or a migration must be planned |
| OQ-E5 | What constitutes an "in-progress application" for deactivation blocking? | Engineers need a precise status set definition to implement the check |
| OQ-E6 | Is gap detection blocking or advisory? What distinguishes a critical geometry error from a non-critical gap? | Needs a defined error taxonomy before implementation |
| OQ-E7 | Who owns the OSM admin_level-to-local-hierarchy mapping table, and who populates it for new countries? | Without this table, "all hierarchy levels" cannot be surfaced per country |
| OQ-E8 | What is the data retention policy for replaced shapefiles? Are all historical versions kept indefinitely? | Affects storage planning and archival strategy |
| OQ-E9 | Is the audit trail enforced at application level, database level, or both? | "Cannot be deleted" is a compliance requirement; application-level enforcement alone is insufficient for a government system |
| OQ-E10 | Does the system need to handle multiple simultaneous admins configuring boundaries for the same jurisdiction? | Last-write-wins would be dangerous; concurrency control must be specified |

---

---

# Combined Priority Matrix

Issues that appear in **both** the user research and engineering reviews — highest priority for PRD revision.

| Issue | User Research flag | Engineering flag | Recommended action |
|---|---|---|---|
| OSM data quality / match rate in target markets | P1, P5, RS1 | Challenge 1, R1 | Run Nominatim audit against target market jurisdictions before build begins |
| Shapefile availability and format in target markets | P2, R4 | OQ1 (PRD), OQ-E2 | Treat as primary research task, not an open question |
| Boundary versioning data model undefined | P4 (consequence of wrong setup) | Challenge 3, R2, OQ-E1 | Separate technical design doc required before any coding starts |
| Service Owner waiting state undesigned | P3, RS7 | (no direct engineering flag, but creates scope ambiguity) | Specify notification/handoff mechanism in MVP scope |
| OQ4 unresolved (Service Owner inheritance model) | Implication 3 | Challenge 5, R6, OQ4 | Decision required before schema design; recommend snapshot-on-override for MVP |
| Async upload and processing not specified | — | R3 | Architecture decision, not a design question — must be in MVP spec |
| Ward split scope | — | R8 | Move to V3 with dedicated design spike |
| "5-minute" KR validity | Implication 4 | — | Revise KR to measure correct-first-time completion rate, not time |
