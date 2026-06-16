# PRD Sync Notes — "License and Permits SaaS: Goals, Governance etc." Deck

**Source deck:** `../Presentations/License and Permit SaaS - Goals, Governance etc.pptx`
**PRD updated:** `PRD_Master_LnP.md` (v0.3 → v0.4)
**Sync date:** 2026-06-15
**Author:** Claude (instructed by Tahera Bharmal)

---

## Changes Made to PRD

### 1. Section 4 — Expanded to "Product Vision, Goals & Strategic Context"

**Added: Product Goals table**
- 2030 Goal: 24 countries live on the platform
- Year 1 Goal: 1 government go-live; 1 SaaS Hosting Partner independently hosting the product
- Source: Deck Slide 5

**Added: Organisation Goals**
- Rapid onboarding of jurisdictions with minimal eGov direct involvement
- Multiple license/permit types per customer on one account
- Partners can independently drive sales and onboarding cycle
- Partners can independently host and manage the product
- Source: Deck Slide 5

**Added: Value Proposition by Stakeholder table** (Government, SaaS Hosting Partner, Citizens)
- Source: Deck Slide 4

**Updated: Strategic Context**
- Changed "reduce time-to-value from months to days" → "from years to weeks" to align with the deck's "weeks, not years" framing
- Source: Deck Slide 4

### 2. Section 7.3 Admin Portal & Section 7.5 Platform Layer

**Updated:** References to "SI Partner" replaced with "SaaS Hosting Partner" where referring to the hosting/infrastructure role, to match the deck's explicit distinction between implementation partners and SaaS hosting partners.
- Source: Deck Slide 4 (Stakeholder list)

### 3. Section 8 — Product Modules Overview

**Updated Module 1:** "Account Onboarding" — changed "SI Partner" to "SaaS Hosting Partner"
**Updated Module 5:** Minor description update on theme configuration
**Updated Module 18 — Out of the Box Integrations:** Added note that payment gateway takes ~1 month to implement a new gateway
- Source: Deck Slide 8 (Functional Assumptions)

### 4. Section 10 — High-Level Feature Summary

**Updated Module 18 — INT-F01:** Added "(approximately 1 month to implement a new gateway)" to description
- Source: Deck Slide 8

### 5. Section 11 — Templates Available (NEW SECTION)

Added a new section listing templates available in V1:
- **Trade License** — Confirmed, In Build (highest-demand use case per deck)
- **Building Permit** — TBD, to be confirmed before Sprint 4

Source: Deck Slide 10/11 ("Configurable Templates for 2 Types of Licence and Permits — Trade License + 1 more TBD; Building Permit Use Case")

### 6. Section 12 — Non-Goals

**Added:**
- "Billing and invoicing between SaaS provider and governments" — Source: Deck Slide 8 ("Billing between SaaS provider and end customer will be done outside the system")
- "Custom code per jurisdiction" updated to explicitly say "zero customizations" with the caveat that new use cases go into the roadmap — Source: Deck Slide 8

**Added: Legacy data migration**
- "Countries are not required to migrate existing licensing records or registry data to go live" — Source: Deck Slide 8
- Also reflected in Non-Goals section

### 7. Section 13 — Success Metrics

**Updated Metric 1 (Time-to-go-live):**
- Changed "≤ 5 business days" → "in weeks from a signed agreement"
- Rationale: Deck consistently uses "weeks, not years" framing; the 5-day target was more specific than what the deck supports. **(See Conflict #1 below)**

**Added Metric 6: Partner Independence**
- "SaaS Hosting Partners can independently complete account onboarding and go-live without eGov direct involvement"
- Source: Deck Slide 5 (Organisation Goals)

### 8. Section 14 — Key Assumptions

**Updated: Data isolation**
- Was: "eGov ensures strict data isolation between accounts"
- Now: "isolation enforced at schema level, not database level. Account identity is enforced at the API gateway"
- Source: Deck Slide 8 (Technical Assumptions)

**Updated: Security compliance**
- Was: "eGov Foundation's declared security compliance is accepted by governments"
- Now: "NIST security guidelines are the security baseline"
- Source: Deck Slide 9 ("No specific Security/other certifications required. We will follow NIST security guidelines")
- **(See Conflict #2 below)**

**Added: eGov Global hosts Year 1**
- "eGov Global hosts the SaaS platform for Year 1. No dependency on an external hosting partner for production deployment in Year 1."
- Source: Deck Slide 9

**Added: No legacy data migration**
- "Countries do not need to migrate existing licensing records or registry data to go live"
- Source: Deck Slide 8

**Added: Billing outside the platform**
- "Billing and invoicing between the SaaS Hosting Partner and end-customer governments is managed entirely outside the product"
- Source: Deck Slide 8

**Added: Zero customizations**
- "The product supports configuration only, not customization. New use cases go into the product roadmap."
- Source: Deck Slide 8

**Added: No subaccounts**
- "No subaccounts supported; multiple service use cases activated within a single account"
- Source: Deck Slide 8 (Technical Assumptions: "Each city/country/ULB will be onboarded as a separate account. No subaccounts will be supported. Within an account, multiple use cases can be activated.")

**Updated: Proprietary tooling**
- Added to External Dependencies: eGov Global and SaaS Hosting Partners are okay using proprietary tools to meet SaaS availability requirements
- Source: Deck Slide 9

### 9. Section 15 — External Dependencies

**Added:** DIGIT Platform Infrastructure row updated to reflect "eGov Global (Year 1); SaaS Hosting Partner (Year 2+)"
**Added:** Proprietary tooling dependency row

### 10. Section 16 — Governance (NEW SECTION)

Added full governance structure from deck:
- Steering Committee (Viraj, Santosh, Chandar, Varun, Jojo + POD)
- Product Committee (Andrew, Subham, Shivani, Megha + country programme managers)
- Tech Committee (Chandar, Ghanshyam, Aniket, Subhashini, Kavi + Abhishek)
- POD (Ghanshyam, Tahera, Sanjana, Engineering Partner)
- Delivery Roles table
- Source: Deck Slides 14, 15, 16

### 11. Section 17 — Related Documents

Added deck file reference: `../Presentations/License and Permit SaaS - Goals, Governance etc.pptx`

---

## Terminology Change: SI Partner → SaaS Hosting Partner

The deck explicitly lists "SaaS Hosting Partner" as a distinct stakeholder. In the PRD, where the context is infrastructure hosting and operations (not just implementation), "SaaS Hosting Partner" is now used. "SI Partner / Implementation Partner" is retained in the Personas table as the original persona name, but the description and assumptions sections use "SaaS Hosting Partner" where the hosting role is the relevant one. This distinction may need alignment in a future pass — see Conflict #3 below.

---

## Conflicts — All Resolved (v0.5, 2026-06-15)

| # | Conflict | Resolution | PRD Change |
|---|---|---|---|
| 1 | Time-to-go-live: "5 business days" vs. "weeks" | **5 business days** is the committed target | Metric reverted to "≤ 5 business days"; MVP Objective updated |
| 2 | Security standard: NIST-aligned vs. NIST-compliant | **NIST-compliant** is the standard; eGov will pursue voluntary certification but no formal cert required before go-live | Assumption and NFR section updated accordingly |
| 3 | SI Partner vs. SaaS Hosting Partner | **They are the same entity.** Renamed to **Hosting Partner** everywhere | All 41 occurrences replaced; Terminology entry updated |
| 4 | Second V1 template: Building Permit confirmed or TBD? | **Building Permit is not in MVP scope** | Templates Available updated; MVP Scope constraint updated to Trade License only |

---

### Items in deck not yet reflected in PRD

| Item | Deck source | Status |
|---|---|---|
| Success Metrics (detailed) | Slides 6–7 | Slides had no extractable text (likely charts/visuals). PRD has its own metrics. Share the slide content if there are specific targets that differ from current PRD metrics. |
| Sprint delivery timelines (Sprint 1–6) | Slide 13 | Not added to PRD — a delivery timeline section could be added if useful, but sprint plans typically live in project management tooling, not PRDs |
| Priority market list and first customer identification | Slide 18 | Not a PRD concern; flagged for commercial/BD team |
| Engineering partner evaluation | Slide 14 | Not a PRD concern; noted in Governance section as "TBD (evaluation in progress)" |
| eGov InfoSec team / NIST gap identification | Slide 18 | Not a PRD concern; flagged for InfoSec team |
