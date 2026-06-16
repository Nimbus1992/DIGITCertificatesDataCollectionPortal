# Design Principles: DIGIT LPM SaaS

These principles guide every product, UX, and engineering decision on DIGIT LPM. They are not aspirational — they are the lens through which we evaluate whether something is built right.

---

## 1. Citizen First

**What it means:** Design every interaction from the citizen's perspective, ensuring services are intuitive and efficient. Prioritize citizen experience over internal complexity.

**Why it matters:** Citizens want frictionless service delivery, not bureaucratic processes replicated digitally. A system that works for the government but burdens the citizen has failed its primary purpose.

**In practice:**
- Design every interaction around the citizen's lifecycle — application, tracking, payment, issuance, renewal
- Simplify processes to reduce paperwork, remove friction, and provide clarity at each step
- When there is a trade-off between internal process convenience and citizen experience, default to the citizen
- Every screen a citizen touches should be answerable to: "Could someone with low digital literacy complete this without help?"

---

## 2. Ease of Use Above All

**What it means:** Every user — citizen, clerk, administrator, enforcement officer — should be able to complete their core tasks without training, documentation, or assistance.

**Why it matters:** Public sector systems in the Global South are often used by staff with limited digital fluency, on shared devices, with time pressure. A complex system is an unused system.

**In practice:**
- Make flows guided, not freeform — users should never wonder what to do next
- Use plain language; eliminate jargon, bureaucratic terminology, and technical terms from all user-facing surfaces
- Progressive disclosure: show only what's needed at each step; don't front-load complexity
- Error messages should tell users what to do, not just what went wrong
- Default to the most common path; edge cases should not complicate the standard experience

---

## 3. Simple and Explainable

**What it means:** Every workflow should be transparent and understandable, even to the least digitally literate user. If a user cannot explain what they just did, the design has failed.

**Why it matters:** Complex, jargon-heavy processes discourage adoption, create errors, and reduce trust. Citizens need clarity to complete tasks confidently. Service providers need straightforward workflows to reduce training burden and operational mistakes.

**In practice:**
- Strip away unnecessary steps; replace form-heavy interactions with guided, conversational flows where possible
- Visually map progress so users always know: what's done, what's next, and why it matters
- Workflow states should have plain-language labels, not internal system codes
- Where a decision is being made (approve, reject, escalate), make the reason required and visible to all parties
- Notifications and status updates should be written for the recipient, not the system

---

## 4. Configurable by Design

**What it means:** The system must adapt to diverse policy environments, institutional structures, and local service conditions without requiring code changes. Configurability is not a feature — it is the architecture.

**Why it matters:** Public service delivery varies widely across countries, states, cities, and departments — each with different rules, workflows, fee structures, and data standards. Without deep configurability, the product becomes brittle, slow to scale, and expensive to maintain.

**In practice:**
- License types, workflows, fee calculation logic, approval hierarchies, notification templates, form fields — all configurable without engineering involvement
- Role-based access control configurable per jurisdiction
- Configuration happens through UI (Studio), not YAML files or database edits
- Clearly separate what is configurable (jurisdiction-level) from what is fixed (platform-level) — be explicit about the boundary
- A Service Owner should be able to go from template selection to live service in under a day

---

## 5. Complexity Lives in the Backend

**What it means:** The system should feel simple for every user, even when the underlying logic is sophisticated. Backend complexity is an engineering responsibility, not a user burden.

**Why it matters:** Multi-step approvals, fee calculation rules, verifiable credential generation, SLA tracking, multi-jurisdiction data isolation — these are genuinely complex. But that complexity must be invisible to the citizen applying for a license and minimally visible to the clerk processing it.

**In practice:**
- Fee calculations happen automatically; users see the result, not the formula
- Certificate and document generation is triggered by workflow events, not manual steps
- Escalations and SLA breaches are system-managed, not dependent on supervisor follow-up
- Integrations with external systems (payment gateways, identity databases) are handled in the background
- The product should "just work" — magic is the right word for what users should feel

---

## 6. Designed for the Edges

**What it means:** Build for diversity — low bandwidth, multilingual needs, offline-first use, assisted service points, and varying device types. Public services must work everywhere, not just in well-resourced urban offices.

**Why it matters:** Our markets are Africa and South Asia. A significant portion of users will be accessing services on low-end mobile devices, with intermittent connectivity, in languages other than English. Designing only for ideal conditions means the product fails the people who need it most.

**In practice:**
- Core citizen workflows must be mobile-first and functional on low-bandwidth connections
- Multilingual support built into the platform, not bolted on
- Assisted service mode: a clerk should be able to apply on behalf of a citizen at a counter
- Offline-capable workflows for field inspectors
- Performance testing must include low-bandwidth and low-device scenarios, not just optimal conditions
- Prioritize essential workflows — not every feature needs to work offline, but the critical path must

---

## 7. Trust Through Transparency

**What it means:** Trust in public systems is earned when users can clearly see what is happening, why it is happening, and when it will be completed. Transparency is not an add-on — it is the primary lever for adoption, compliance, and trust.

**Why it matters:** Service delivery often fails not because services are missing, but because processes feel opaque and unpredictable. Citizens who don't know what's happening assume nothing is. Officials who can't see the full picture make inconsistent decisions.

**In practice:**
- Application status must be visible to citizens at every stage, in real time
- Every action taken on an application (approval, rejection, request for documents, inspection scheduled) must generate a visible, timestamped audit trail
- Rejection reasons must be specific and actionable, never generic
- SLA timelines should be communicated to citizens upfront ("you will receive a response within 5 working days")
- Administrators should be able to see where applications are stuck, not just overall completion rates
- Verifiable credentials give enforcement officers and third parties an independent, trustworthy source of truth

---

## 8. Interoperable by Default

**What it means:** In as many places as possible, allow users and systems to reuse existing data — from government databases, identity systems, payment gateways, and other platforms. But always give users a place to start without it.

**Why it matters:** Governments already have data — business registrations, property records, citizen identity databases. Forcing users to re-enter data that already exists creates friction, errors, and distrust. But integration readiness varies enormously across jurisdictions, so the system must degrade gracefully when integrations aren't available.

**In practice:**
- API-first architecture: every function that ingests or outputs data should be API-accessible
- Pre-populate form fields from connected databases where available (national ID, business registry)
- Payment integration should support multiple gateways; offline payment recording must always be available as a fallback
- Data export and sync capability for governments who need data in their own systems
- Never block a workflow because an integration is unavailable — design the offline/manual path as a first-class option, not an afterthought
- Verifiable credentials must follow open standards to enable third-party verification without system dependency

---

## 9. Catalyze Transformation, Not Just Digitization

**What it means:** The product should be a tool for systemic change, not just a digital version of existing paper processes. When we design a workflow, we should ask: is this the right process, or are we digitizing an inefficient one?

**Why it matters:** Incremental digitization rarely shifts governance outcomes. Without a catalyst, existing inefficiencies simply move online — queues become digital queues, delays become digital delays. The goal is not to replicate the current state; it is to improve it.

**In practice:**
- Where existing government processes have unnecessary steps, the product design should surface this and offer a better path (with configurability to match local rules)
- Renewal reminders, automated fee calculation, digital issuance — these aren't just convenience features; they eliminate entire categories of manual work and corruption risk
- Data and dashboards should surface insights that governments didn't have before (where are applications being rejected most? Which license types are under-issued relative to business density?)
- Design for what the process *should* be, then configure for what the process *is* today

---

## 10. Data as a Shared Asset

**What it means:** Data collected through the system belongs to the government and should be fully accessible — for export, for analysis, and for building new services on top of it. Make this visible to service designers and administrators so they can imagine what's possible.

**Why it matters:** A licensing system generates valuable data — business registrations, compliance rates, revenue by license type, geographic distribution of permits. This data has uses far beyond the licensing workflow: city planning, economic analysis, tax reconciliation, enforcement prioritization. If the data is locked inside the system, most of that value is lost.

**In practice:**
- All data is exportable in standard formats (CSV, JSON) at any time, without needing engineering support
- APIs expose key data sets so governments can integrate licensing data into dashboards, GIS systems, finance tools, or other platforms they operate
- Service designers and administrators should be shown what data the system captures and what can be done with it — surface this proactively in the product, not buried in documentation
- Spark ideas: when a service is configured and live, show examples of how similar governments have used the data (e.g., "cities have used renewal data to map informal business density")
- Data export and API access is a first-class product feature, not a technical afterthought

---

## 11. Built to Connect — DPI Integration as a Long-Term Path

**What it means:** The system is designed to integrate with the broader Digital Public Infrastructure (DPI) building blocks a country is adopting over time — identity systems, payment rails, data exchange layers, civil registries. These integrations deepen the product's value and reduce friction without requiring a rebuild.

**Why it matters:** Countries in the Global South are building out DPI stacks — national ID systems (like MOSIP), interoperability layers, digital payment infrastructure, civil registries. A licensing system that can plug into these building blocks becomes exponentially more useful over time: pre-fill from national ID, payment via national payment rail, business registration cross-checks. This is how the product earns a long-term place in a country's digital infrastructure, not just a single use case.

**In practice:**
- Architecture is API-first and standards-aligned, making integration with DPI building blocks a configuration exercise, not a rebuild
- Identity integration (national ID, business registry): when a country has a usable identity layer, citizen and business data pre-fills; when it doesn't, manual entry is the clean fallback
- Payment integration: designed to connect to national payment rails, mobile money platforms, and commercial payment gateways — whichever a country has adopted
- Data exchange: support for emerging interoperability standards (G2P Connect, X-Road, or country-specific equivalents) as they become relevant
- Each integration deepens the product's lock-in to a country's infrastructure in a healthy way — it becomes more useful as the country's DPI matures
- Be explicit with governments and partners about the integration roadmap: "today you start with manual data; as your national ID system matures, we can connect it here"

---

## 12. Privacy and Security by Default

**What it means:** Citizen and business data is protected by design — not as a compliance checkbox, but as a foundational commitment. Every feature that touches personal data must consider how it is stored, who can access it, and how long it is retained.

**Why it matters:** Governments handle sensitive data — business ownership, financial records, physical addresses, identity documents. A breach or misuse of this data is not just a technical failure; it is a breach of public trust and, in many jurisdictions, a legal liability. In markets where data sovereignty is a live political concern, security and privacy practices are a buying criterion, not just a hygiene factor.

**In practice:**
- Data isolation per tenant: no jurisdiction can access another jurisdiction's data, ever
- Role-based access control: users see only what their role requires — a clerk does not see administrator analytics; an enforcement officer sees only verification, not full application records
- Audit trails are immutable: every data access and action is logged with a timestamp and user identity
- Sensitive personal data (identity numbers, financial records) is encrypted at rest and in transit
- Data retention policies are configurable per jurisdiction to match local legal requirements
- Compliance with relevant data protection frameworks (GDPR-adjacent where applicable, country-specific regulations) is built into the platform, not delegated to implementation partners
- Security reviews are part of every release cycle, not a one-time exercise
- When new features are designed, the first question is: "what data does this touch, who can see it, and what is the minimum required?"

---

## 13. Configuration Transparency

**What it means:** At every configuration step, show users where their choice will take effect, what it controls, and what will change if they modify it. Users should never have to guess the downstream consequences of a configuration decision.

**Why it matters:** Administrative configuration decisions in DIGIT LPM — boundary setup, workflow design, fee rules, role assignment — are not isolated choices. They propagate downstream to citizens, field staff, dashboards, and other services. An Administrator who sets the wrong operational boundary level, or a Service Owner who misconfigures a workflow step, will discover the error only when citizens or staff are affected. Making consequences visible at the point of decision is the single most effective way to reduce configuration errors, especially for users who are not technically proficient in the underlying system.

**In practice:**
- Before a user confirms a configuration decision, show a plain-language summary of what that decision controls: which services it affects, which user types will experience it, and what it will look like to them
- When a user selects or changes a hierarchy level, label, or operational unit, show where that value appears across the system — in forms, dashboards, assignment screens, and notifications
- When a user opts out of a default (e.g., a Service Owner choosing independent boundaries instead of inheriting system-level config), explicitly surface what they are giving up, not just what they are gaining — list the specific consequences, not a generic warning
- For high-consequence, hard-to-reverse decisions (hierarchy depth selection, boundary deactivation, service go-live), require the user to acknowledge the specific downstream impact before proceeding — not a generic "are you sure?" but a named statement of what will change
- Terminology changes should show their blast radius: "This label currently appears in application forms, inspector assignment screens, and dashboards. Changing it will update all of these from [date]."
- The confirmation screen for any configuration step is not a formality — it is the moment to show the clearest, most complete picture of what is about to be set

---

## How These Principles Interact

These principles are not independent. They form a system:

- **Citizen First** sets the direction
- **Ease of Use** and **Simple and Explainable** define the experience standard
- **Configurable by Design** and **Complexity in the Backend** define the architecture standard
- **Designed for the Edges** ensures we don't accidentally build only for ideal conditions
- **Trust Through Transparency** builds the adoption flywheel
- **Interoperable by Default** ensures the platform fits into existing ecosystems
- **Catalyze Transformation** keeps us honest about whether we're creating real change
- **Data as a Shared Asset** ensures the value created doesn't stay locked inside the system
- **Built to Connect** gives the product a long-term place in a country's infrastructure, not just a single use case
- **Privacy and Security by Default** makes all of the above trustworthy

When principles appear to conflict (e.g., maximum configurability vs. simplicity for the citizen), **Citizen First** is the tiebreaker at the product level, and **Complexity Lives in the Backend** is the engineering resolution. **Privacy and Security** is a non-negotiable constraint across all principles — it cannot be traded off against speed, convenience, or configurability.
