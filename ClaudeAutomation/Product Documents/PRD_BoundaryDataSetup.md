Title: Boundary Data Setup
Brief description: Enable Administrators and Service Owners to configure geographic and administrative boundary data as a prerequisite for going live on the platform — using pre-loaded OpenStreetMap data or shapefile uploads — with versioned change management post go-live.
Version: 0.3
Last updated: 31 May 2026
Team: Product, Engineering, GIS
Driver: Tahera Bharmal
Status: Draft

---

1. Problem to solve

Government entities adopting the platform cannot go live without boundary data — yet the current setup method (uploading a text file of boundary names) has no geographic shape data, cannot be visualised, and blocks map-based workflows like geographic analysis, inspector assignment, and location-based dashboards.

Who is affected and how:

- Administrators (state/country-level government officials managing the SaaS instance) have no self-serve way to load accurate, geographically-aware boundary data. They rely on the implementation team, which slows go-live.
- Service Owners (department heads managing a specific service like Licensing or Grievance Management) cannot file applications, assign staff, or view aggregated dashboards until boundary setup is complete upstream.

How solving this aligns with business objectives:

- Faster deployment: Boundary setup is the first configuration block in the onboarding flow. Removing the dependency on the implementation team directly reduces time-to-live.
- Platform extensibility: As additional services (Grievance Management, Health Campaigns) are added to the platform, a shared, well-structured boundary infrastructure prevents each service from reinventing this setup.

What evidence supports this:

- OSM data is 4–5 years stale in approximately 90 countries, making current auto-pull insufficient without a visual verification and shapefile fallback mechanism.
- The text-file upload method provides no geometry data, which means the platform cannot support map rendering, geographic analysis, or shape-based boundary validation.
- Countries deploying for Health Campaign Management already receive shapefiles from the WHO Geospatial database — a signal that shapefile ingestion is the right standard input format.

2. Objective and key results

Objective: Make boundary setup fast, accurate, and fully self-serve so that Administrators and Service Owners can configure geographic boundaries and go live without implementation team support.

Customer Outcome: An Administrator can configure the correct boundary hierarchy and data for their jurisdiction, verify accuracy using boundary names and counts they recognise, and have all services operational within hours — without raising a support ticket or contacting the implementation team.

Key Results:

- Boundary setup completed in under 5 minutes from the point a user begins the setup flow. [Secondary efficiency metric — see quality KR below.]
- % of deployments that do not require a post-go-live boundary correction (shapefile re-upload or boundary-related support ticket) within 90 days of launching the first service — target: less than 20%. [Primary quality metric — measures whether the Administrator made a correct first-time decision, not just a fast one.]
- % of deployments where the user confirms and uses the default OSM boundary data at go-live without uploading a shapefile — tracks whether OSM data is practically usable and informs the long-term value of the OSM-first approach.

3. Solution requirements

We will deliver boundary data setup in two releases:

MVP: Initial boundary setup during onboarding
V2: Post-go-live boundary management with versioned change handling

---

MVP: Initial boundary setup during onboarding

Step 1 — Jurisdiction stored at account creation

The Administrator's jurisdiction (country and city/state) is captured when the account is created as part of the standard onboarding flow. There is no separate jurisdiction entry step inside the boundary setup wizard.

- The country and city/state entered at account creation are stored as the confirmed jurisdiction for the account record.
- If the SI Partner uploaded boundary data at account provisioning, that data is queued for display in Step 2 and scoped to this stored jurisdiction.
- Boundary setup is presented to the Administrator as Step 4 of 4 in the account creation wizard, immediately after organisation details are confirmed (Step 3). This ensures the Admin encounters boundary setup as an expected onboarding step, not as a separate item discovered later via the sidebar. The step label in the wizard header reads: "Step 4 of 4 · Boundary Setup."
- The Administrator can skip boundary setup entirely and return to it later. On skip, the system shows what has been deferred: "You have not configured boundary data. Other onboarding steps can be completed, but no service can go live until boundaries are configured — either at the system level by you, or independently by each Service Owner when setting up their service." The skip option is always available; the Admin is never forced to complete boundary setup before continuing.
- If the Admin skips during onboarding, the Boundary Setup page (accessible from the sidebar) shows a deferred-state banner with the same message and a prominent "Configure Boundaries" CTA.

Step 2 — Multiple named boundary hierarchies

An instance supports multiple named boundary hierarchies. Administrators can create more than one hierarchy (e.g., Administrative Hierarchy, Revenue Hierarchy) and assign one as the default. Service Owners can also create service-specific hierarchies. Each hierarchy is independently named, activated, deactivated, and assigned to services.

Multi-hierarchy model:

- Each hierarchy has a name (free-form text, e.g., "Administrative Hierarchy"), a status (Active or Inactive), a data mode (Geographic or Limited), a source (pre-loaded, shapefile, or Excel), and a list of the services currently using it.
- One hierarchy is designated as the Default. The default is used by all services that have not explicitly selected a different hierarchy.
- Service Owners and Administrators can both create hierarchies. All hierarchies — regardless of creator — are visible on the Admin Boundary Setup page so the Administrator has a complete picture of all boundary configurations on the instance.
- Each hierarchy card on the Boundary Setup page shows: name, Default badge (if applicable), Active/Inactive status, Geographic/Limited mode, source, and which services are using it (as named chips). If no service uses it yet, the card shows "Not yet used by any service."
- Actions per hierarchy: Make default (disabled if already default), Deactivate / Activate.

Deactivation guard:

- If a hierarchy is currently used by one or more services, the Administrator cannot deactivate it without first acknowledging the impact. Clicking "Deactivate" opens a confirmation dialog listing the service names. The Administrator must acknowledge (via checkbox) that the listed services will lose boundary access until reassigned before the deactivate action is enabled. The Admin is instructed to reassign those services to a different hierarchy before deactivating, or to proceed with the acknowledgment.
- Inactive hierarchies cannot be selected by services. Any service pointing to a deactivated hierarchy must be reassigned before that service can go live.

Adding a new hierarchy:

- The Boundary Setup page has an "Add new hierarchy" button in the header that opens the boundary setup wizard in a full-page panel.
- The wizard is the same step-by-step flow (data source → review → confirm) with an additional "Name this hierarchy" field on the confirmation step, defaulting to "Administrative Hierarchy".
- The first hierarchy created on the instance is automatically set as the default. Subsequent hierarchies are not default unless the Admin explicitly makes them so.

Step 2b — Boundary data review, hierarchy selection, and terminology mapping

As an Administrator, I can view OSM boundary data on a map alongside a count and searchable list of boundary names at each hierarchy level, rename labels to match my government's terminology, and either proceed with the data or upload a shapefile — so that I can verify accuracy using information I already know (names and counts) before committing, rather than relying solely on visual polygon inspection.

Path A — Review pre-loaded boundary data:

This path is available when the SI Partner has uploaded boundary data at account provisioning. The source of that data — OSM-derived (e.g., via Geofabrik), national mapping agency, or other — is the SI Partner's responsibility. The platform treats all pre-loaded boundary data identically regardless of source.

Before the data review screen, the Admin is shown a map confirmation step: the jurisdiction stored at account creation is rendered on the map with its name, admin level, and area. The Admin confirms "Yes, proceed with this jurisdiction" before advancing to the data review. This step exists only within Path A; Paths B1 and B2 do not require jurisdiction confirmation because the uploaded data defines its own scope.

- The screen is split into two panels: a map on one side and a data summary panel on the other. The map and panel are kept in sync — selecting a level in the panel highlights those boundaries on the map.
- The data summary panel shows, for each hierarchy level: the label as uploaded, the count of boundaries at that level, and a searchable list of boundary names. The Admin can search for a specific name (e.g., "Kibra") to verify it exists and see it highlighted on the map.
- The data source and upload date are displayed prominently in the data summary panel, as recorded at provisioning by the SI Partner.
- The Admin can zoom, pan, and click individual boundary shapes on the map to inspect names and coverage.
- For each hierarchy level, the Admin can rename the label to match local government terminology (e.g., "Sub-county" → "Division"). Renaming is optional — the uploaded label is used by default. When the Admin edits a label, an inline note shows where that label will appear across the system: "This name will be used in application filing forms, staff assignment screens, and dashboards for all services on this instance."
- The Admin selects which level is the operational level — the lowest level at which applications are filed, staff are assigned, and dashboards aggregate. They can only select from levels present in the pre-loaded data; no new levels can be added. When the Admin selects a level, the screen shows in plain language what that selection controls: "Applications will be filed at [selected level]. Staff will be assigned by [selected level]. Dashboards will aggregate data by [selected level]."
- The confirmation action is framed as "Proceed with this data" rather than a definitive accuracy certification. The confirmation screen shows a plain-language summary of what is being set: which services will inherit this configuration (all services on this instance, unless a Service Owner later configures independently), what the operational level selection means in practice ("Citizens will file applications at [level]. Inspectors will be assigned at [level]."), and what the chosen labels will look like in-product. The screen also includes a persistent note: "Boundary data can be corrected at any time after setup by uploading a shapefile — this does not need to be finalised today."
- On confirmation, the pre-loaded data and the Admin's label choices become the system-wide default, inherited by all services.
- If the pre-loaded data is incomplete for the jurisdiction (e.g., only country and state level available, no ward data), the system surfaces a warning and prompts the Admin to upload a replacement shapefile rather than offering a false confirm option.
- If no boundary data was pre-loaded by the SI Partner, Path A is not shown and the Admin goes directly to Path B.

Path B — Upload boundary data manually:

If the Admin finds the OSM data stale or inaccurate, or cannot obtain geographic data for their jurisdiction, they can upload boundary data from the same screen. Two formats are supported:

Path B1 — Shapefile upload (geographic):

- The Admin uploads an ESRI shapefile. The system parses the geometry, validates CRS, and renders the boundaries on the map. The Admin sees the hierarchy levels present in the shapefile, renames labels as needed, and selects the operational level — same as Path A.
- The system detects and surfaces gaps visually on the map before the Admin confirms. They can proceed with gaps or re-upload a corrected file.
- On confirmation, the shapefile data and label choices become the system-wide default. All geographic capabilities are available.

Path B2 — Excel upload (non-geographic):

- The Admin uploads an Excel file listing boundary names, hierarchy levels, and parent-child relationships. No geometry data is required.
- Before the upload zone, the system shows a permanent amber warning banner: "Choosing Excel upload means geographic analysis will not be available for boundaries configured with this method. This includes map-based location selection, geographic dashboards, and automatic location-to-boundary matching. You can upgrade to geographic mode at any time by uploading a shapefile." This warning is always visible — not only shown after file selection.
- A downloadable CSV template is provided on the same screen so the Admin can prepare their data in the correct format before uploading. The template has three columns: boundary_name, hierarchy_level, parent_boundary_name, with example rows for a three-level hierarchy.
- The system validates the file on upload: required columns are present (boundary name, hierarchy level, parent boundary name), no duplicate names at the same level under the same parent, and hierarchy depth is consistent.
- After a successful upload, the Admin must acknowledge the specific limitations before proceeding: maps will not be available in dashboards or reports; citizens will select their boundary from a text-based dropdown rather than a map pin; if a citizen enters a location by map, the system cannot automatically assign it to a boundary — staff will need to assign the boundary manually. Each limitation is a separate acknowledgment checkbox. All three must be checked before the "Review and confirm" action is available.
- The Admin selects the operational level in the same way as Path A. No map is shown during this flow.
- On confirmation, the Excel-based hierarchy becomes the system-wide default (or a named non-default hierarchy, depending on the context). The instance operates in limited boundary mode until a shapefile is uploaded.
- The Admin can upload a shapefile at any point after setup to add geographic data to the existing boundary configuration, converting it to full geographic mode without reconfiguring the hierarchy.

The old unstructured text-file upload method is removed with this milestone. Excel upload replaces it as the non-geographic option, with structured validation and explicit limitations surfaced before the Admin commits.

Service Owner boundary setup (before service go-live)

As a Service Owner, I can configure boundary data for my service at any point during service setup or go-live — by selecting from existing Administrator-configured hierarchies or creating a new one — so that I am never blocked waiting for the Administrator to complete system-level boundary setup.

When active Admin-created hierarchies exist:

- The Service Owner is shown a selection list of all active Administrator-created hierarchies, each displayed as a card with its name, Default badge (if applicable), data mode (Geographic or Limited), and source.
- The Service Owner selects one hierarchy or chooses "Add a new hierarchy for this service."
- If the Service Owner selects the default hierarchy: a confirmation message reads "This service will use the Administrator's default hierarchy. Future updates to this hierarchy will automatically apply to this service."
- If the Service Owner selects a non-default hierarchy: the same confirmation pattern applies, naming the selected hierarchy.
- On confirm: the service is linked to the selected hierarchy. The service name appears in the "Used by" chip on the hierarchy card on the Admin Boundary Setup page.
- If the Service Owner selects "Add a new hierarchy": they go through the boundary setup wizard (shapefile or Excel only — the pre-loaded OSM option is not available to Service Owners). On completion, the new hierarchy is added to the Admin Boundary Setup page with `createdBy: "service-owner"` and the service name in its "Used by" field.

When no active Admin-created hierarchies exist:

- The Service Owner is taken directly to the boundary setup wizard (shapefile or Excel only) with an amber notice: "No boundaries have been configured at the system level. Set up a boundary for this service — the Administrator can designate it as the system-wide default later from the Boundary Setup page."
- On completion, the new hierarchy appears on the Admin Boundary Setup page, attributed to the service owner, and the Administrator can promote it to the system-wide default.

Service-owner-created hierarchies:

- Are visible on the Admin Boundary Setup page alongside Admin-created hierarchies.
- Show the service name in their "Used by" field.
- The Administrator can make a service-owner-created hierarchy the instance default, activate/deactivate it, and see all metadata in the same format as Admin-created hierarchies.
- Service Owners cannot access the pre-loaded (OSM) data source — that option is only available to Administrators during system-level setup.

An independent service boundary does not affect any other service on the instance.
Once the service is live, changes to service-level boundaries follow V2 rules.

---

V2: Post-go-live boundary management

View and navigate active boundaries

As a Administrator, I can view all active boundaries on a rendered map and in a list view, so that I have a complete picture of the current boundary configuration.

- Map and list views show all active boundaries with their hierarchy level and effective-from date.
- I can filter by hierarchy level and search by boundary name.

Add a new boundary

As a Administrator, I can add a new boundary (e.g., a newly created ward) under an existing parent, so that new applications can be filed there from the date of creation.

- New boundaries are available immediately for new applications and staff assignment.
- Historical records in adjacent boundaries are unaffected.

Rename a boundary

As a Administrator, I can rename an existing boundary, so that the system reflects the current official name.

- Before the rename is confirmed, the system shows the Admin where the current name appears and what will change: "The name [X] currently appears in [N] active application records, inspector assignment views, and dashboard filters. From [effective date], all new records will use [new name]. Historical records will retain [old name] with a 'formerly known as' note."
- Historical records retain the name that was active at the time they were created (version snapshot).
- The new name is used for all future records and is displayed in the UI with a "formerly known as" note where relevant.

Deactivate a boundary

As a Administrator, I can deactivate a boundary that no longer exists, so that no new applications can be filed against it.

- Before deactivation is permitted, the system surfaces a full dependency summary for the boundary: the count of active in-progress applications, the count of staff currently assigned to this boundary, and any dashboard filters or reports that reference it. This gives the Admin a complete picture of impact before they act, not just the application count.
- The Admin must either reassign active applications to another boundary or acknowledge that the old boundary will remain as a "closed" legacy entry (no new applications accepted, historical records intact).
- Completed historical applications remain permanently associated with the deactivated boundary in version history.

Split a boundary

As a Administrator, I can record a boundary split (one boundary becomes two or more), so that the new boundaries are usable while historical records remain traceable.

- The system creates the new boundaries with their effective date.
- The old boundary is closed (no new applications) but preserved in version history.
- Active in-progress applications in the old boundary are surfaced and must be manually reassigned to one of the new boundaries before the split is confirmed.
- Completed historical records remain permanently linked to the original boundary.

Boundary versioning and audit trail

As a Administrator, I can view the version history of any boundary, so that I can trace how boundaries have changed over time.

- Every boundary change (add, rename, deactivate, split) is recorded with: change type, effective date, who made the change.
- Historical records always display the boundary name and shape that was active at the time they were created.
- Version history is read-only and cannot be deleted.

3b. Edge cases

E1 — Jurisdiction not found in OSM at account creation
The user enters their city or state name and Nominatim returns no match. This can happen for smaller jurisdictions, newly formed administrative areas, or places with highly localised spellings.
Behaviour: The system offers a fallback — the user can search again with an alternate name, or select their jurisdiction by clicking directly on a country-level map. If no match can be confirmed, the user proceeds to boundary setup without a pre-loaded entity, and is taken directly to the shapefile upload path. The OSM confirmation step is skipped.

E2 — Multiple Nominatim matches for the same name
"Nairobi" returns both "Nairobi City" and "Nairobi County" as plausible OSM entities. The user cannot distinguish between them by name alone.
Behaviour: Both options are rendered as separate boundary shapes on the map simultaneously. The user clicks the correct one to select it. Only one can be confirmed. If the user is unsure, a "what's the difference?" tooltip shows the area coverage and OSM admin level for each option.

E3 — Terminology label change post-go-live
A Administrator renames a hierarchy level label after the system is live (e.g., "Sub-county" is renamed to "Division"). This label appears in application forms, dashboards, inspector assignment screens, and historical records.
Behaviour: The new label is used for all future records and UI surfaces. Historical records retain the label that was active at the time of their creation — a version snapshot of the label is stored alongside the record. Dashboards show the current label with a note that historical data used a different label before a given date. This is treated as a low-consequence change (label only, not structure) but is logged in the audit trail with effective date and who made the change.

E4 — Hierarchy depth change post-go-live
A Administrator wants to insert a new level into the hierarchy (e.g., add Sub-ward between Ward and Block) after services are live. All existing records are tagged at levels that no longer map cleanly to the new structure.
Behaviour: Hierarchy depth changes are restricted post-go-live unless no live applications exist. The system surfaces a count of affected records and requires explicit admin acknowledgment before proceeding. Existing records are not re-tagged — they retain their original level and are flagged as "pre-restructure." Reports and dashboards must handle the discontinuity in aggregation levels across the before/after date.

E5 — Ward split after go-live
One ward is split into two new wards by the government. The Administrator attempts to deactivate the old ward.
Behaviour: The system checks for active in-progress applications in that ward and surfaces the count. The Admin must either reassign them to one of the new wards before deactivation, or allow the old ward to persist as a "closed" legacy boundary that accepts no new applications but holds its historical records. Completed records remain permanently associated with the old ward in version history.

E6 — Service Owner changes boundaries after their service is live
A Service Owner uploads a new shapefile for their service mid-operation.
Behaviour: Active in-flight applications retain their boundary association from the previous shapefile version. The old shapefile version is preserved. New applications use the new boundaries. A reconciliation view shows the admin which historical records are on the old boundary version.

E7 — System-level boundary change does not propagate to a service with independent boundaries
The Administrator adds new wards to the system-level boundary. A Service Owner who has configured their own independent boundary dataset is not affected.
Behaviour: Independent service boundaries are fully isolated from system-level updates unless the Service Owner explicitly triggers a sync. The Service Owner is notified that system-level boundaries have changed and offered the option to sync or ignore.

E8 — Shapefile upload contains gaps
A shapefile uploaded by the Administrator is missing some sub-districts — areas present at the parent level but not covered by child-level shapes.
Behaviour: The system detects gaps and renders them visually on the map before confirming setup. The Admin can proceed with gaps (those areas simply won't be selectable in application flows) or re-upload a corrected file.

E9 — OSM data partially stale by region
OSM data is current for some regions of a country but 3–4 years old for others. The system cannot automatically detect this — the Admin must visually assess.
Behaviour: The UI surfaces the OSM refresh date prominently and recommends the Admin cross-check against a known local source for recent administrative changes, particularly if the refresh date is more than 12 months old.

E10 — Instance operating in limited boundary mode (Excel-based setup)
The Admin or Service Owner has configured boundaries via Excel. A citizen attempts to file an application using a map-based location selector, or a dashboard attempts to render a geographic boundary map.
Behaviour: The system falls back to text-based boundary selection throughout — citizens see a dropdown list of boundaries at the operational level rather than a map pin. If the application filing module has a map-based location entry point, the citizen's map location cannot be automatically matched to a boundary; staff must manually assign it after submission. Dashboards display tabular boundary data rather than geographic maps. The Admin sees a persistent in-product prompt: "Your instance is running in limited boundary mode. Upload a shapefile to enable map-based features." This prompt appears in the Admin dashboard and in the boundary setup section until a shapefile is added. The respective PRDs for application filing, inspector assignment, and dashboards must define how each module handles limited boundary mode.

3c. Out of scope

- Creation of shapefiles within the system: Administrators must source shapefiles from external providers (e.g., national mapping agencies, WHO Geospatial DB). The system ingests shapefiles but does not provide tools to draw, edit, or generate them.
- Tile rendering infrastructure: The choice of map tile provider (OSM, Carto, Mapbox) and the serving strategy for admin-configured boundary layers (dynamic GeoJSON vs. vector tiles) is a platform-level decision that is an open question for this feature. See OQ6.
- Boundary usage within service workflows: How boundaries are applied in application filing forms, inspector assignment, and dashboard aggregation is covered in their respective PRDs. This PRD covers setup only.
- GeoJSON and other geospatial formats: ESRI shapefiles (Path B1) and Excel (Path B2) are the supported non-OSM input formats in M1/M2. GeoJSON support is deferred.
- WHO Geospatial DB as a direct data source: While relevant for Health Campaign Management, direct integration with the WHO Geospatial DB is not in scope. Administrators from those deployments can download shapefiles from WHO and upload them via the shapefile path.

4. Assumptions and hypothesis

Business assumptions:

- I believe Administrators have a need to configure accurate, geographically-aware boundary data without requiring external implementation support.
- These needs can be solved by pre-loading OSM data and providing a visual, map-based confirmation flow with a shapefile fallback.
- My initial customers are state and country-level government officials deploying the platform for the first time.
- The number 1 differentiating benefit for Administrators is the ability to go live independently and with confidence that boundary data is correct.
- Future services on the platform (Grievance Management, Health Campaigns) will reuse this boundary infrastructure rather than duplicating it, making investment in a shared, versioned boundary layer compounding in value.

User assumptions:

- Who is the user? A state or country-level government official (Administrator) managing a SaaS deployment, and department heads (Service Owners) configuring individual services. Neither is necessarily technically proficient in GIS.
- Where does the product fit in their work? Boundary setup is the first configuration step in the onboarding journey — it gates all downstream configuration.
- What problems does it solve? Eliminates dependency on implementation teams for boundary setup; replaces a text-only method with a geographically-aware, visual setup flow.
- When and how is it used? Once at initial setup, then occasionally post-go-live when administrative boundaries change (ward splits, renames, new wards).
- What features are important? Visual map confirmation, shapefile upload, hierarchy level selection, and versioned change management post-go-live.

Data and infrastructure assumptions:

- We assume that Administrators who cannot use OSM data will either have access to a shapefile from an authoritative source (national mapping agency, WHO Geospatial DB, regional GIS provider) or be able to compile their boundary hierarchy in Excel. The Excel path (Path B2) is the lowest-barrier fallback and requires no GIS tooling, only a list of boundary names and their hierarchy. Risk if wrong: neither the shapefile nor the Excel path is viable — which would only occur if the Admin cannot enumerate their boundaries in any format, which is unlikely. The residual risk is that Admins use Excel permanently rather than as a temporary measure, accepting degraded geographic capabilities as a long-term state (see Risk 5). Validation: complete shapefile availability research for priority target markets; Excel path de-risks the scenario where shapefiles are inaccessible.
- We assume that OSM data exists at a minimum at country and state/province level for all target jurisdictions, even if sub-district level data is incomplete or stale. Risk if wrong: the OSM-first flow cannot render any meaningful boundary for that jurisdiction, and the Admin must go directly to shapefile upload with no map reference to orient against. The E1 fallback flow handles this, but if it applies to a significant proportion of target markets it becomes the primary path, not an edge case.
- We assume that Administrators in target markets have reliable enough internet connectivity to load and interact with Leaflet map tiles during the setup flow. Risk if wrong: the map-based confirmation UX is unusable in low-connectivity environments, and a non-map fallback (e.g., name-and-count list only) would be required. Validation: assess connectivity norms for target deployment contexts with SI Partners.

Testable hypothesis:

- If we provide a pre-loaded OSM map confirmation flow with a shapefile fallback, then Administrators will complete boundary setup without support team involvement in 80%+ of deployments within the first 3 months post-launch.

4b. Open questions

OQ1 — Which shapefile formats will be supported?
Research needed on which shapefile formats and specifications (file types, coordinate reference systems, required attribute fields) are most commonly available from national mapping agencies and international sources like the WHO Geospatial DB across target countries. The answer determines what the system must accept and validate at upload. Owner: Product + GIS research.

OQ2 — Is hierarchy depth mutable post-go-live?
Currently treated as restricted unless no live applications exist (E4). But this needs a definitive decision — either we hard-lock hierarchy depth at setup, or we build a migration flow for depth changes. This is the highest-consequence open question as it shapes the data architecture even before build begins. Owner: Product + Engineering.

OQ3 — How does boundary data get refreshed after initial provisioning?
The platform no longer runs an OSM ingestion pipeline. Boundary data refresh means the SI Partner or Administrator uploads a new shapefile (Path B1), which follows the existing post-go-live shapefile replacement flow (E6). The open question is whether there is a defined process or reminder mechanism for SI Partners to periodically check and re-upload updated boundary data for their deployments, particularly in markets where administrative boundaries change frequently. Owner: Product + SI Partner operations.

OQ6 — Tile rendering strategy for admin-configured boundary layers
The base map (OSM tiles for background rendering) is handled by Leaflet and is not in question. The open question is how the platform serves the admin's own boundary layers — the polygons from the pre-loaded or uploaded shapefile — on top of that base map. Two options: dynamic GeoJSON serving (simpler, viable up to ~10,000 polygon features) or vector tile generation (more complex, better for large datasets). The answer determines backend architecture for shapefile rendering. Owner: Engineering. Must be resolved before build begins.

OQ4 — Does a Service Owner override freeze boundary data or continue inheriting system-level updates?
When a Service Owner modifies the system-level boundary for their service, do future system-level boundary changes (e.g., new wards added by the Administrator) automatically apply to that service, or does the override freeze the service at the point of divergence? The answer determines whether this is a config flag or a data migration operation. Owner: Product.

OQ5 — Does the WHO Geospatial DB require direct platform integration?
Currently out of scope — Administrators sourcing WHO data download shapefiles manually and upload them via Path B. If Health Campaign Management or other future products onboard at scale, a direct API integration with the WHO Geospatial DB may be needed to avoid the offline shapefile process. Needs validation with the Health Campaign Management team. Owner: Product + future product leads.

OQ7 — Hierarchy naming: free-form or typed taxonomy?
Currently, hierarchy names are free-form text (e.g., "Administrative Hierarchy", "Revenue Hierarchy"). An alternative is a typed taxonomy (e.g., a category dropdown: Administrative | Revenue | Service-specific | Custom) that would enable filtering, reporting, and disambiguation when multiple hierarchies exist. Should the platform impose a taxonomy of hierarchy types, or is free-form naming sufficient for the expected number and variety of hierarchies per instance? Owner: Product. Resolution needed before the multi-hierarchy model reaches production.

5. Product risks and dependencies

Product Risks:

Risk 1 — OSM data quality creates false confidence
The Admin visually confirms OSM data as current, but OSM lags 4–5 years in ~90 countries. A Administrator who is not familiar with recent administrative changes in their jurisdiction may confirm stale data without realising it. This leads to missing or incorrect boundaries at go-live.
Mitigation: Display OSM refresh date prominently. Add a tooltip or guidance note recommending the Admin cross-check against a known local source (e.g., national mapping agency) if the refresh date is more than 12 months old.

Risk 2 — Hierarchy depth change post-go-live creates data integrity problems
If a Administrator restructures the hierarchy after services are live (e.g., inserting a new level between existing levels), all historical records are tagged at levels that no longer map cleanly to the new structure. This breaks historical reporting and dashboards.
Mitigation: Restrict hierarchy depth changes post-go-live unless no active applications exist. Require explicit admin acknowledgment of impact before proceeding. Surface a count of affected records. Existing records are not re-tagged — they retain their original level and are flagged as "pre-restructure."

Risk 3 — Shapefile upload quality is not validated before commit
A shapefile with gaps, incorrect projections, or mismatched hierarchy levels could silently corrupt the boundary configuration, causing downstream failures in application filing and dashboards.
Mitigation: Validate shapefile geometry, CRS, and hierarchy attribute completeness on upload. Surface gaps visually on the map. Block commit if critical validation errors are detected; warn and allow proceed for non-critical gaps.

Risk 5 — Excel-based boundary mode becomes permanent rather than transitional
Administrators who cannot access shapefiles may configure via Excel and go live in limited boundary mode, accepting the absence of maps and automatic location matching as a permanent state rather than a temporary one. Over time, citizens and staff adapt to degraded workflows (dropdown selection, manual boundary assignment), and the motivation to upgrade to shapefile-based boundaries diminishes. The platform's geographic capabilities are then effectively unused for those deployments.
Mitigation: Surface the limitations prominently at setup and maintain a persistent in-product prompt in the Admin dashboard whenever the instance is in limited boundary mode. Track the proportion of instances operating in limited mode as a product health metric. Consider a time-limited prompt escalation (e.g., after 30 days in limited mode, the prompt becomes more prominent and is accompanied by guidance on how to source a shapefile).

Risk 4 — Service Owner overrides create boundary fragmentation
If every Service Owner creates their own independent boundary dataset, the platform ends up with multiple unreconciled boundary versions across services on the same instance, making cross-service reporting and shared staff assignment impossible.
Mitigation: Default all services to the system-level boundary. Make override a deliberate, acknowledged action. Surface a warning when a Service Owner opts for independent boundaries, explaining the impact on cross-service reporting.

Technical and Cross-functional Dependencies:

- SI Partner provisioning step: SI Partners must upload boundary data at account creation as part of the provisioning workflow. OSM-derived shapefiles for most countries are freely available from providers such as Geofabrik and can be uploaded via the same Path B1 shapefile flow. This must be documented in the SI Partner onboarding playbook as a required provisioning step, not an optional one.
- Shapefile ingestion and rendering: Requires backend support for ESRI shapefile parsing, geometry validation, CRS normalisation, and serving rendered tiles to the Leaflet map component. The strategy for serving admin-configured boundary layers is an open question (see OQ6).
- Tile rendering infrastructure: Base map tiles served via Leaflet with OSM tiles. The serving strategy for admin-configured boundary polygon layers is an open question (see OQ6).
- Boundary versioning store: All boundary changes must be logged with effective dates and linked to historical records. This is a platform-level capability that application filing, inspector assignment, and dashboards all depend on.
- Application filing module: Must read the configured operational hierarchy level to determine which boundary level citizens select when filing. Must handle both geographic mode (map-based location selection, automatic boundary assignment) and limited boundary mode (text-based dropdown selection, manual boundary assignment by staff). Dependency on M1 completing before application filing can be built or tested end-to-end.
- Inspector assignment module: Must read the configured operational hierarchy level to determine assignment granularity. Must handle limited boundary mode where no geographic data is available for map-based assignment. Dependency on M1.
- Dashboards and reporting module: Must respect boundary version snapshots so that historical reports aggregate correctly against the boundary that was active at the time of each record. Must handle limited boundary mode by displaying tabular boundary data rather than geographic map renders where geographic data is unavailable.
- Future products (Grievance Management, Health Campaigns): Will share this boundary infrastructure. The WHO Geospatial DB is an additional data source used by Health Campaigns — the ingestion layer should be designed to be source-agnostic to accommodate this in future.
