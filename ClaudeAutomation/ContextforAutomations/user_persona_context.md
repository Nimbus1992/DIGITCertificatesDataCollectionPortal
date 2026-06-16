# User Persona Context: DIGIT LPM SaaS

There are two layers of users to understand: **platform-level users** (the ecosystem of eGov, partners, and governments who deploy and manage the SaaS) and **product-level users** (the people who actually use the License & Permit system day-to-day). Both matter for product decisions.

---

## Product-Level Users (Within the L&P System)

These are the five user types who interact with the licensing and permit management product directly, as identified in eGov's stakeholder framework.

---

### 1. Service Owner

**Who they are:** The government department or ministry official responsible for configuring and managing a licensing use case on the platform. They define what a license looks like, what documents are required, what the workflow is, and what fees apply.

**Value proposition:** Higher Control
- UI to configure a use case
- Multiple templates out of the box

**Goals:**
- Set up and publish a new license type without needing technical help
- Modify templates to match their jurisdiction's rules
- Control what fields, workflows, and fees apply to their use case

**Frustrations:**
- Having to wait for IT or a vendor to make changes to the system
- Lack of out-of-the-box templates that match common license types
- No visibility into how the service is performing post-launch

**Key product needs:** Intuitive configuration UI, pre-built templates (Trade License, Building Permits), guided setup flows, ability to modify existing templates

---

### 2. Citizen / Entity (Applicant)

**Who they are:** A business owner, individual, or legal entity applying for a license, permit, or certificate. Interacts with the system periodically — typically at application, renewal, or when a status update is needed.

**Value proposition:** Ease of Accessibility
- Apply anywhere, anytime, on any device
- Easy tracking with notifications

**Goals:**
- Submit an application without visiting a government office
- Know where their application stands in real time
- Receive their license digitally in a verifiable format
- Renew easily without re-submitting everything

**Frustrations:**
- Multiple physical visits for a single application
- No updates unless they call or visit
- Unclear requirements — finding out about missing documents only after submission
- Delays that directly impact their ability to operate a business

**Key product needs:** Mobile-friendly applicant portal, real-time status tracking, proactive notifications, digital license issuance, simple renewal flows

---

### 3. Field and Office Employee (Licensing Clerk / Processor)

**Who they are:** A government employee who reviews applications, processes workflows, conducts inspections, or issues licenses. May work at a counter, in an office, or in the field.

**Value proposition:** Reduced Coordination, Increased Efficiency
- Prioritized actions for the day
- Automated fee calculation & certificate issuance
- Renewal management

**Goals:**
- See clearly what needs to be done today (prioritized task queue)
- Process applications without manual fee calculations or certificate generation
- Manage renewals and follow-ups without tracking spreadsheets
- Complete field inspections with structured checklists

**Frustrations:**
- Paper queues and manual coordination between departments
- No clear ownership of where an application is stuck
- Repetitive, manual tasks that should be automated (fee calculation, certificate printing)
- Lack of tools for field inspection documentation

**Key product needs:** Task-prioritized inbox/queue, automated fee calculator, digital certificate generation, inspection checklist, renewal management, notifications

---

### 4. Administrator

**Who they are:** A senior government official, department head, or city manager who oversees licensing operations at a department or jurisdiction level. Focused on outcomes and performance, not individual transactions.

**Value proposition:** Real-time and Historical Visibility
- Monitor service delivery with real-time SLA reports
- Actionable insights

**Goals:**
- Track whether licensing targets and SLAs are being met
- Identify bottlenecks in the workflow (where applications pile up)
- Monitor revenue collection and compliance rates
- Make data-driven decisions about staffing or process changes

**Frustrations:**
- Getting data only through manual reports compiled by staff
- No early warning when SLA breaches are about to happen
- Inability to compare performance across departments or districts

**Key product needs:** Real-time dashboards, SLA monitoring, historical trend reports, per-department/jurisdiction drill-down, exportable data

---

### 5. End User / Enforcement Officer

**Who they are:** An officer (police, municipal enforcement, inspector) who needs to verify whether a business or individual holds a valid, current license or permit. Typically in the field, checking compliance.

**Value proposition:** Streamlined Verification
- Easy verification of validity

**Goals:**
- Quickly verify whether a license is valid and current
- Detect fraudulent or expired licenses
- Complete verification without needing to call an office or check paper records

**Frustrations:**
- Paper licenses that are easy to forge or impossible to verify on the spot
- No mobile-accessible verification tool
- Dependence on back-office staff to confirm validity

**Key product needs:** Verifiable credentials (QR-code or digital), public-facing license lookup, mobile-accessible verification

---

## Platform-Level Users (Ecosystem)

These users don't use the L&P product directly but are critical to deploying, managing, and scaling it.

---

### 6. SI Partner / Implementation Partner

**Who they are:** A regional system integrator or technology company that hosts and deploys DIGIT LPM SaaS for government clients. They are eGov's commercial and delivery partner on the ground.

**Value proposition:** A product they can take to governments quickly, with low delivery risk and a recurring revenue model

**Goals:**
- Win government contracts with a proven, fast-to-deploy product
- Onboard clients quickly with minimal hand-holding from eGov
- Manage multiple government tenants on one platform
- Build recurring revenue through subscriptions and services

**Frustrations:**
- Products requiring custom development — hard to price, hard to deliver
- Unclear boundaries between configuration and customization
- Long sales cycles when governments need a working demo first
- Lack of documentation or training materials for their own team

**Key needs:** Demo environments, configuration playbooks, training materials, clear partner commercial model, L2/L3 escalation support from eGov

---

### 7. eGov Product / Operations Team

**Who they are:** Internal eGov team members responsible for the global product roadmap, partner enablement, commercial operations, and platform support.

**Value proposition:** A single, scalable product that expands to new countries without forking the codebase

**Goals:**
- Maintain a single global roadmap across all deployments
- Enable partners to be self-sufficient
- Track adoption and feedback systematically
- Prevent product fragmentation

**Key needs:** Usage analytics per tenant, structured feedback channels, clear configuration vs. customization boundaries, release management tooling

---

## Cross-Persona Design Principles

- **Licensing is rarely standalone** — all personas encounter this as part of larger digitization or reform programs. Product messaging and onboarding should reflect the broader context.
- **Digital literacy varies** — Service Owners and Citizens may have limited technical sophistication. Reduce cognitive load at every step.
- **The SI Partner is the key scaling lever** — eGov's ability to reach multiple countries depends on partners being well-equipped to deploy and manage independently.
- **Verification is a trust signal** — the Enforcement Officer persona, while small in volume, is critical for government buy-in. Verifiable credentials are not a nice-to-have.
- **The Administrator unlocks renewals and expansion** — if the Administrator sees clear ROI (coverage up, revenue up, SLA met), they approve more license types and more districts.
