# DIGIT License, Permits & Certificates — Master Product PRD

---

## 1. Document Control

| Field | Value |
|---|---|
| **Product Name** | DIGIT License, Permits & Certificates (LPC) |
| **Document Title** | Master Product PRD |
| **Version** | 0.6 |
| **Status** | Draft |
| **Date** | 2026-06-16 |
| **Author** | Tahera Bharmal |
| **Reviewers** | Engineer Agent, User Researcher Agent |
| **Approvers** | TBD — eGov Product Lead |
| **Parent Document** | — (this is the top-level document) |

**Version History**

| Version | Date | Author | Summary of Changes |
|---|---|---|---|
| 0.1 | 2026-06-12 | Tahera Bharmal | Initial draft |
| 0.2 | 2026-06-15 | Tahera Bharmal | Terminology overhaul: Tenant → Account, Boundary → Boundary Hierarchy, Module redefined, Role and Use Template added; Enforcement Officer moved to V1 with Verification Portal |
| 0.3 | 2026-06-15 | Tahera Bharmal | Module structure rebuilt: 19 modules; Account Onboarding and User Management split; Template Creation & Template Marketplace added; Branding and Language split; feature lists updated |
| 0.4 | 2026-06-15 | Tahera Bharmal | Synced with "License and Permits SaaS — Goals, Governance etc." deck: added Product Goals, Governance section, Templates Available section; updated Key Assumptions (data isolation, security, no-customization policy, no legacy migration, billing, hosting, no subaccounts); added billing to Non-Goals |
| 0.5 | 2026-06-15 | Tahera Bharmal | Resolved deck conflicts: 5-business-day go-live target restored; NIST-compliant (voluntary cert, no formal certification); SI Partner / SaaS Hosting Partner unified and renamed to Hosting Partner throughout; Building Permit removed from V1 Templates Available; Product Telemetry (Module 20), NFRs section, and Out of Scope for V1 section added |
| 0.6 | 2026-06-16 | Tahera Bharmal | Value Proposition by Stakeholder split into three rows (Decision Makers, Licensing/Permitting Departments, Hosting Partner) to align with deck framing; value props redistributed accordingly |

> **Terminology note for all future documents:** The term **Tenant** has been replaced with **Account** across this document and must be used as the standard term in all subsequent product documents. Do not use "Tenant" in new documents or revisions.

---

## 2. Terminology

| Term | Definition |
|---|---|
| **License** | A government-issued formal authorization permitting a business or individual to operate in a regulated activity on an ongoing, recurring basis (e.g., Trade License, Food Business License). |
| **Permit** | A time-limited or activity-specific government authorization for a defined action or project (e.g., Building Permit, Event Permit). Unlike a license, a permit is tied to a single activity, not ongoing operations. |
| **Certificate** | A government-issued document confirming a fact, status, or compliance (e.g., Certificate of Occupancy, Health Certificate). Certificates may be issued as outputs of license or permit workflows. |
| **Service** | A specific license, permit, or certificate type offered by a government department through the L&P platform (e.g., "Trade License" is a Service). A Service can have multiple modules — for example, a Trade License Service may have a module for Application of Trade License and a separate module for Renewal of Trade License. Each Service has a defined fee structure and document requirements. |
| **Application** | A formal request submitted by an Applicant to obtain, renew, amend, or cancel a license or permit. Note: "Application" also refers to the software product — context should make this clear. |
| **Applicant** | A person or registered business entity that submits an Application. Synonymous with the "Citizen / Entity (Applicant)" persona. |
| **Template** | A pre-built Service configuration created by the eGov product team and made available in the Template Marketplace. Templates define a service's form fields, document checklist, fee structure, and workflow. Service Owners select and customise a template rather than building a Service from scratch. |
| **Use Template** | The action of adding a pre-built Service Template to your account instance to use as the starting point for configuring a new Service. Once added, the template's settings can be customised without modifying the original template. |
| **Module** | An end-to-end use case within a Service, containing workflow, forms, fee structure, and document requirements (e.g., Application for Trade License, Renewal of Trade License). |
| **Feature** | A specific capability within a Module that enables a user to perform a defined task (e.g., "Upload supporting documents," "View application status"). |
| **Workflow** | The states that an entity goes through using actions performed by Roles, from submission to final resolution (approval, rejection, or withdrawal). |
| **Role** | A group of actions that can be performed within a Service workflow. Roles are assigned to users to define which workflow steps they can action. |
| **Interface** | A distinct application or portal through which users interact with the L&P product (e.g., Citizen Portal, Employee Portal, Admin Portal). Each Interface serves one or more personas. |
| **Persona** | A named representation of a distinct user type who interacts with the L&P product. A persona can be assigned one or multiple roles. All canonical personas are defined in `../../ContextforAutomations/user_persona_context.md`. |
| **Account** | A single government organisation or jurisdiction deployed on the platform. Each Account has its own isolated data, configuration, and user base. No subaccounts are supported; multiple service use cases are activated within a single account. |
| **Boundary Hierarchy** | A structured set of administrative geographic or organisational boundaries organised in parent-child relationships (e.g., Country → State → District → Ward), used to scope Services, assign staff, and organise reporting. One Account can have one or multiple boundary hierarchies. |
| **ULB (Urban Local Body)** | A local government entity (city or town municipality) responsible for delivering civic services to urban residents. Examples include municipal corporations, town councils, and city authorities. |
| **RBAC (Role-Based Access Control)** | A method of managing system access permissions by assigning users to predefined roles, each carrying a defined set of permissions. |
| **SLA (Service Level Agreement)** | A defined time commitment for processing an Application (e.g., "Applications reviewed within 5 working days"). Configured per Service by the Service Owner. |
| **Go-Live** | The point at which an Account's Service is made publicly accessible to citizens and operational for employees. Preceded by a readiness checklist. |
| **Hosting Partner** | An eGov-authorised organisation that hosts and operates the L&P SaaS platform on behalf of one or more government clients. Responsible for account provisioning, infrastructure setup, uptime, and first-line operational support. |

---

## 3. Executive Summary

DIGIT License, Permits & Certificates is a configurable, multi-account SaaS platform that enables government departments to digitize the full lifecycle of licensing and permit management — from application submission and fee payment to workflow processing, certificate issuance, and renewal — without requiring custom software development. Today, government agencies across Africa and South Asia manage licenses through paper queues, spreadsheets, and manual counter processes that force citizens to make repeated office visits, leave administrators without real-time performance data, and create compounding compliance and revenue gaps. The platform solves this through a no-code configuration layer for Service Owners to configure Services from pre-built templates — customising fees, forms, and approval workflows without building from scratch; an accessible Citizen Portal for self-service application tracking; and an Employee Portal for streamlined processing and approvals. When successful, a government department can go from zero to a live digital licensing service in weeks, with the majority of applications processed without a citizen setting foot in an office. While the V1 product focuses on licensing and permits, the SaaS platform is designed to expand to cover multiple service delivery use cases in future — including Complaint Management, Property Management, and other civic service domains.

---

## 4. Product Vision, Goals & Strategic Context

**Vision Statement:**
_Become the default digital infrastructure for licensing and permit management across governments in the Global South — enabling every jurisdiction to launch, operate, and scale licensing services without requiring custom software or ongoing engineering support._

**Product Goals:**

| Horizon | Goal |
|---|---|
| **2030** | 24 countries live on the platform |
| **Year 1** | 1 government go-live; 1 Hosting Partner independently hosting the product |

**Organisation Goals:**
- Rapid onboarding of jurisdictions (cities and departments) with minimal eGov direct involvement per deployment
- Multiple license and permit types activated per customer on a single account
- Hosting Partners can independently drive the full sales and onboarding cycle without requiring eGov to manage each implementation
- Hosting Partners can independently host and manage the product on their own infrastructure

**Strategic Context:**
eGov Foundation is transitioning from project-led implementation to product-led expansion via a SaaS model. DIGIT License, Permits & Certificates is the first formal expression of this shift — it standardises deployment, reduces time-to-value from years to weeks, and enables Hosting Partners to onboard multiple government clients without requiring eGov to manage each implementation directly. The timing is driven by increasing demand from donor-funded governance reform programs in Africa and South Asia, where governments need proven, deployable digital infrastructure — not bespoke builds. See `../../ContextforAutomations/company_context.md` for full company background.

**Product Positioning:**
The product is deployed for Urban Local Bodies, state-level departments, and national agencies in the Global South seeking to digitize licensing as part of broader governance reform programs. It is sold through Hosting Partners who configure and operate account instances for government clients, and through direct government engagement in select markets. It differentiates from alternatives — manual processes, bespoke custom builds, or proprietary government software — through its open-source foundation, deep configurability without code, multi-account deployability, and integration with the broader DIGIT DPI platform.

**Value Proposition by Stakeholder:**

| Stakeholder | Key Value |
|---|---|
| **Decision Makers (Government)** | Make licenses and permits faster, simpler, and fully accessible; reduce revenue leakage; automate steps to do more with less capacity; drill down to every interaction to monitor performance and coverage gaps; create trust in digital certificates |
| **Licensing/Permitting Departments** | Go live in weeks, not years; start with low investment on the DPI journey and scale on own infrastructure when ready; one platform to digitize multiple services across departments |
| **Hosting Partner** | Launch a government use case in weeks, not years; sell to one government and expand to multiple license types and departments on the same account (with future expansion to other service delivery use cases); run multiple government deployments with minimal incremental cost and effort; meet government security and compliance requirements out of the box; access assets and tools to support the full sales and implementation cycle |

---

## 5. Problem Statement

**Who has the problem:**
The most directly affected personas are the **Citizen / Entity (Applicant)**, who bears the cost of delays and opacity, and the **Administrator**, who cannot manage what they cannot see. The **Service Owner**, **Field and Office Employee (Licensing Clerk / Processor)**, and **Hosting Partner** are secondary sufferers — each blocked by inefficiency in the current system.

**What the problem is:**
Licensing and permit management in target-market governments is conducted through a patchwork of paper forms, spreadsheet registers, physical counter queues, and informal coordination between departments. Citizens must often visit a government office multiple times — first to collect forms, again to submit documents, and again to follow up — with no reliable channel for status updates. Employees lack a single view of their work queue, process applications through manual steps, and issue certificates by hand. Administrators have no real-time visibility into application volumes, SLA compliance, or revenue collection without requesting manual reports from staff.

**Why the current solution fails:**
Digital alternatives, where they exist, are typically single-jurisdiction, custom-built, and impossible to replicate elsewhere without full redevelopment. Donor-funded e-governance projects in this space have historically been costly, slow (12–24 months to go live), dependent on external technical teams, and unsustainable after the donor program ends. Paper-first processes also create corruption risk at every manual handoff point — where a fee amount is disputed, where a document requirement is unclear, or where status is communicated only through personal relationships.

**Impact of not solving it:**
Without this product, each new government deployment requires months of bespoke development, eGov must staff each implementation directly, and the product cannot scale beyond a handful of jurisdictions per year. Citizens continue to experience opacity, delay, and physical inconvenience. Governments continue to miss licensing revenue, fail to enforce compliance, and lack the data to manage public services effectively.

---

## 6. Users & Personas

**Full persona profiles:** `../../ContextforAutomations/user_persona_context.md`

| Persona | Interface(s) Used | Role (Primary / Secondary) | Key Need This Product Addresses |
|---|---|---|---|
| **Citizen / Entity (Applicant)** | Citizen Portal | Primary | Apply for and track licenses online without visiting a government office; receive digital certificates and renewal reminders |
| **Field and Office Employee (Licensing Clerk / Processor)** | Employee Portal | Primary | Process applications from a prioritised task queue, verify documents, auto-generate certificates, and manage renewals without manual coordination |
| **Administrator** | Admin Portal | Primary | Monitor real-time SLA compliance, application volumes, and revenue collection; make data-driven staffing and process decisions |
| **Service Owner** | Admin Portal | Primary | Configure and publish a new license type — forms, fees, workflow, documents — without writing code or waiting for IT |
| **End User / Enforcement Officer** | Verification Portal | Secondary (V1) | Verify whether a business holds a valid, current license on the spot using a web portal — without calling the back office |
| **Hosting Partner** | Admin Portal, Platform Config | Platform-level | Deploy and configure account instances for multiple government clients quickly; manage client environments without deep engineering resource |
| **eGov Product / Operations Team** | Backend / Platform | Platform-level | Maintain a single global product roadmap; track account adoption and feedback; prevent platform fragmentation across deployments |

---

## 7. Product Interfaces

### 7.1 Citizen Portal

**Primary Personas:** Citizen / Entity (Applicant)
**Channel:** Web (desktop and mobile browser)
**MVP Status:** In scope

The Citizen Portal is the public-facing interface through which business owners and individuals discover, apply for, and manage licenses and permits. Citizens can browse the service catalogue for their jurisdiction, complete a guided multi-step application form, upload required documents, pay applicable fees, and track their application status in real time. When an application is approved, the citizen receives and downloads a digital certificate directly from the portal. Renewal reminders are delivered proactively so citizens do not miss a renewal deadline. The portal is optimised for mobile access and low-bandwidth conditions, and supports assisted service mode — a licensing clerk can apply on behalf of a citizen at a counter using the same interface. The design north star is that a citizen with no prior experience of the system can complete an application without guidance.

---

### 7.2 Employee / Department Portal

**Primary Personas:** Field and Office Employee (Licensing Clerk / Processor)
**Channel:** Web (desktop-first)
**MVP Status:** In scope

The Employee Portal is the internal interface for government staff who process licensing applications. Employees see a prioritised inbox of pending tasks — document verification requests, approval actions, renewal queues — ordered by SLA urgency. From the inbox, a clerk can review application details, verify uploaded documents, request additional information from the citizen, approve or reject an application with a required reason, and trigger digital certificate generation. Fee calculation and certificate generation are fully automated — the employee confirms an outcome; the system handles the mechanics. The portal is designed to be operable with minimal training, using plain-language labels and explicit next-step prompts at every stage.
---

### 7.3 Admin Portal

**Primary Personas:** Administrator, Service Owner
**Channel:** Web (desktop)
**MVP Status:** In scope

The Admin Portal serves two audiences at different levels of access. **Service Owners** use it to configure and publish Services — selecting a template from the Template Marketplace, customising the application form and document checklist, setting fee rules, designing the approval workflow, assigning service roles, configuring notification templates, and previewing the citizen-facing experience before going live. **Administrators** use it to manage the organisation's overall platform configuration — provisioning users, setting up boundary hierarchies, reviewing operational dashboards, and managing the go-live checklist. The Admin Portal is also the entry point for Hosting Partners configuring an account on behalf of a government client. Configuration is done entirely through UI; no YAML, code, or database access is required.

---

### 7.4 Verification Portal

**Primary Personas:** End User / Enforcement Officer
**Channel:** Web (mobile browser)
**MVP Status:** In scope (V1)

The Verification Portal is a publicly accessible, mobile-optimised web page that allows enforcement officers to confirm the validity of a license in the field — without an app download, a back-office call, or a login. Officers can either scan a QR code printed on a citizen's digital certificate or search by reference number to see whether the license is current, valid, and issued to the correct entity. No native mobile application is provided; the portal is designed to work reliably in a mobile browser.

---

### 7.5 Platform / Configuration Layer

**Primary Personas:** Hosting Partner, eGov Product / Operations Team
**Channel:** Admin tools, configuration files, deployment pipelines
**MVP Status:** In scope (SaaS Admin interface)

The Platform Layer encompasses the deployment, configuration, and integration surface used by Hosting Partners and the eGov internal team. In MVP, Hosting Partners provision new account instances and perform initial setup (including Super Admin creation). The eGov team creates and manages templates from the backend, and monitors accounts and platform configuration via the SaaS Admin interface.

---

## 8. Product Modules Overview

| # | Module Name | One-Line Description | Primary Personas | Status | Module PRD |
|---|---|---|---|---|---|
| 1 | Account Onboarding | Account creation by Hosting Partner, organisational details setup, and first Admin user provisioning | Hosting Partner, Administrator | In Build | — |
| 2 | Organisation Settings | Account-level locale, time zone, and regional format configuration (date format, number format, currency) | Administrator | Planned | — |
| 3 | Template Creation & Template Marketplace | eGov team authoring and publishing of service templates; admin/service owner browsing and adding templates to their account | eGov Product / Operations Team, Service Owner, Administrator | In Design | — |
| 4 | Boundary Data Setup | Self-serve geographic and administrative boundary hierarchy configuration. Hosting Partners upload OSM data or shapefile/Excel files as part of account setup; direct OSM integration is not part of V1 | Administrator, Service Owner | In Design | [PRD_BoundaryDataSetup.md](./PRD_BoundaryDataSetup.md) |
| 5 | Language Localization | Account-level language configuration applied across all interfaces | Administrator | Planned | — |
| 6 | Theme & Branding Setup | Organisation logo, colour scheme, and portal identity applied across citizen-facing interfaces | Administrator | Planned | — |
| 7 | User Management | Ongoing management of admin users, service owners, and service-level role assignments across the account | Administrator, Service Owner | In Build | [PRD_RBAC_UserOnboarding.md](./PRD_RBAC_UserOnboarding.md) |
| 8 | Service Configuration | No-code configuration of a license/permit type from a template: form fields, document checklist, fees, workflow, and notifications | Service Owner | In Build | — |
| 9 | Go-Live Management | Readiness checklist and deployment confirmation flow before a Service is made publicly accessible | Service Owner, Administrator | In Build | — |
| 10 | Audit Log | Immutable, filterable platform-wide log of every user action, configuration change, and access event | Administrator, Service Owner | In Build | — |
| 11 | License Verification & Enforcement | Web-based verification portal for enforcement officers to confirm license validity by QR code scan or reference number lookup | End User / Enforcement Officer | Planned | — |
| 12 | Out of the Box Integrations | Pre-configured SMS and email notification gateway available out of the box for all deployments | Administrator, Service Owner | Planned | — |
| 13 | Product Telemetry | Platform-level tracking of product adoption, usage patterns, and user behaviour, surfaced via a telemetry dashboard available to eGov and Hosting Partners to monitor deployments and inform the product roadmap | eGov Product / Operations Team, Hosting Partner | Planned | — |
| 14 | Citizen Interface | Platform-level citizen-facing screens: authentication, home, service catalogue, multi-step application form, application tracking, document wallet, notification inbox, and citizen profile | Citizen / Entity (Applicant) | Planned | — |
| 15 | Employee Interface | Platform-level employee-facing screens: authentication, role-based task inbox, application processing, document verification, inspection workflow, search, dashboard, reports, notification inbox, and employee profile | Field and Office Employee, End User / Enforcement Officer | Planned | — |

**Status values:** Planned / In Design / In Build / In Testing / Live / Deprecated

---

## 9. Module PRDs Index

| # | Module Name | Module PRD | PRD Status | Last Updated |
|---|---|---|---|---|
| 1 | Account Onboarding | — | Pending | — |
| 2 | Organisation Settings | — | Pending | — |
| 3 | Template Creation & Template Marketplace | — | Pending | — |
| 4 | Boundary Data Setup | [PRD_BoundaryDataSetup.md](./PRD_BoundaryDataSetup.md) | Draft | 2026-05-31 |
| 5 | Language Localization | — | Pending | — |
| 6 | Theme & Branding Setup | — | Pending | — |
| 7 | User Management | [PRD_RBAC_UserOnboarding.md](./PRD_RBAC_UserOnboarding.md) | Draft | 2026-06-02 |
| 8 | Service Configuration | — | Pending | — |
| 9 | Go-Live Management | — | Pending | — |
| 10 | Audit Log | — | Pending | — |
| 11 | License Verification & Enforcement | — | Pending | — |
| 12 | Out of the Box Integrations | — | Pending | — |
| 13 | Product Telemetry | — | Pending | — |
| 14 | Citizen Interface | — | Pending | — |
| 15 | Employee Interface | — | Pending | — |

---

## 10. High-Level Feature Summary

### Module 1: Account Onboarding

| Feature ID | Feature Name | Brief Description | Priority | Primary Persona(s) |
|---|---|---|---|---|
| ACO-F01 | Account provisioning | Hosting Partner creates a new account in the platform with organisation name, jurisdiction, country, and primary contact details | P0 | Hosting Partner |
| ACO-F02 | Super Admin creation | First Admin user is provisioned during account setup via email invitation; receives credentials to access the Admin Portal | P0 | Hosting Partner |
| ACO-F03 | Org profile confirmation | Super Admin reviews and confirms organisation name, official contact details, and jurisdiction scope on first login | P0 | Administrator |

---

### Module 2: Organisation Settings

| Feature ID | Feature Name | Brief Description | Priority | Primary Persona(s) |
|---|---|---|---|---|
| ORG-F01 | Locale configuration | Admin sets the date format, number format, and currency display for the account, applied across all portals | P0 | Administrator |
| ORG-F02 | Time zone configuration | Admin sets the account's default time zone for date/time display and notification scheduling | P1 | Administrator |

---

### Module 3: Template Creation & Template Marketplace

> **V1 constraint:** Templates are bundled with the platform installation. The Template Marketplace interface exists in V1, but templates are not independently published outside of a platform release. Independent template authoring and publishing by eGov outside of a release cycle is a future capability.

| Feature ID | Feature Name | Brief Description | Priority | Primary Persona(s) |
|---|---|---|---|---|
| TCM-F01 | Template authoring | eGov product team creates a service template from the backend, defining form fields, document checklist, fee structure, and workflow blueprint. Also defines what configurations are available to the Service Owner when customising the template, and the business rules that govern those configurations (e.g., mandatory fields, fee calculation constraints, required workflow steps) | P0 | eGov Product / Operations Team |
| TCM-F02 | Template publishing | eGov team publishes a completed template to make it available in the Template Marketplace | P0 | eGov Product / Operations Team |
| TCM-F03 | Template versioning | eGov team can update an existing template; service configurations already derived from the template are not affected by updates | P1 | eGov Product / Operations Team |
| TCM-F04 | Template catalogue | Admin and Service Owner browse available templates in the Marketplace with template names, descriptions, and a preview of the form layout, document checklist, and workflow before adding to the account | P0 | Administrator, Service Owner |
| TCM-F05 | Template preview | Full preview of a template's form, document checklist, fee structure, and workflow steps, accessible from within the catalogue before committing to Use Template | P0 | Administrator, Service Owner |
| TCM-F06 | Use Template | Admin or Service Owner adds a template to the account as the starting point for configuring a new Service | P0 | Administrator, Service Owner |
| TCM-F07 | Template search and filter | Search and filter the template catalogue by service type, keyword, or jurisdiction context | P2 | Administrator, Service Owner |

> **Open Question — OQ-TCM-001:** See [PRD_OpenQuestions_LnP.md](./PRD_OpenQuestions_LnP.md). Resolution required before Module 2 build begins.

---

### Module 4: Boundary Data Setup

| Feature ID | Feature Name | Brief Description | Priority | Primary Persona(s) |
|---|---|---|---|---|
| BDS-F01 | Jurisdiction confirmation | Administrator's jurisdiction is captured at account creation and stored as the scope for boundary hierarchy setup | P0 | Administrator |
| BDS-F02 | OSM boundary review and confirmation | Hosting Partner uploads OSM data during account setup. Administrator reviews the uploaded OSM boundaries on a map, verifies hierarchy labels and counts, and confirms or switches to an alternative upload path | P0 | Administrator, Hosting Partner |
| BDS-F03 | Shapefile upload (Path B1) | Administrator uploads an ESRI shapefile; system validates geometry, detects gaps, and maps to hierarchy levels | P0 | Administrator |
| BDS-F04 | Excel boundary upload (Path B2) | Administrator uploads a structured Excel file defining boundaries as a non-geographic hierarchy | P0 | Administrator |
| BDS-F05 | Boundary label rename | Administrator renames hierarchy level labels to match local government terminology (e.g., rename "Level 3" to "District") | P1 | Administrator |
| BDS-F06 | Service Owner independent hierarchy | Service Owner can create an independent boundary hierarchy for their service, separate from the system-level hierarchy | P1 | Service Owner |
| BDS-F07 | Multi-hierarchy support | Multiple named boundary hierarchies per account; one designated as default for services that don't specify | P1 | Administrator |
| BDS-F08 | Post-go-live boundary versioning | Versioned change management for boundary edits after services are live, including ward splits and boundary deactivation | V2 | Administrator |

---

### Module 5: Language Localization

| Feature ID | Feature Name | Brief Description | Priority | Primary Persona(s) |
|---|---|---|---|---|
| LNG-F01 | Default language selection | Admin sets the primary UI language for all account interfaces (Admin Portal, Employee Portal, Citizen Portal) | P1 | Administrator |
| LNG-F02 | Citizen-facing language application | Selected language applied to the Citizen Portal service catalogue, application forms, status messages, and notification templates | P1 | Administrator |
| LNG-F03 | Multi-language support | Ability to offer multiple language options on the Citizen Portal for multilingual jurisdictions | V2 | Administrator |

---

### Module 6: Theme & Branding Setup

| Feature ID | Feature Name | Brief Description | Priority | Primary Persona(s) |
|---|---|---|---|---|
| THM-F01 | Organisation logo | Admin uploads org logo; applied across citizen-facing and employee-facing interfaces | P1 | Administrator |
| THM-F02 | Colour scheme | Admin sets primary and accent brand colours applied to buttons, headers, and highlights across all interfaces | P1 | Administrator |
| THM-F03 | Portal name and favicon | Admin sets the Citizen Portal's browser tab title and favicon | P2 | Administrator |
| THM-F04 | Custom domain | Admin or Hosting Partner configures a custom domain for the Citizen Portal (e.g., licenses.cityname.gov) | P2 | Hosting Partner |

---

### Module 7: User Management

> **To be decided.** Feature definitions for this module are pending a review of Keycloak's capabilities and constraints. Features will be defined once the identity and access management approach is confirmed.

---

### Module 8: Service Configuration

| Feature ID | Feature Name | Brief Description | Priority | Primary Persona(s) |
|---|---|---|---|---|
| SVC-F01 | Select template from Marketplace | Service Owner selects a pre-built service template from the Template Marketplace as the starting point; cannot create a service from scratch | P0 | Service Owner |
| SVC-F02 | Overall template configuration | Service Owner enables which modules are active for the service (e.g., Application, Renewal, Amendment) and reviews master configurations provided as part of the template that apply across all modules | P0 | Service Owner |
| SVC-F03 | Application and License ID configuration | Service Owner configures the ID format and numbering scheme for application references (Application ID) and issued license certificates (License ID). Includes an option to use the same ID for both Application and License, or define them independently | P0 | Service Owner |
| SVC-F04 | Form builder | Service Owner configures the application form — adding, removing, and customising form fields (text, date, dropdown, file upload) and defining required and optional document uploads with descriptions | P0 | Service Owner |
| SVC-F05 | Fee configuration | Service Owner sets fee amounts, calculation logic (flat, per-unit, tiered), and applicable payment methods | P0 | Service Owner |
| SVC-F06 | Payment configuration | Service Owner configures payment settings for the service — which payment channels are enabled (online gateway, counter payment), at which point in the workflow payment is collected (e.g., at submission or post-approval), and whether payment receipts are auto-generated | P0 | Service Owner |
| SVC-F07 | Workflow configuration | Service Owner defines approval steps, assigns roles to each step, and sets SLA timers per step | P0 | Service Owner |
| SVC-F08 | Notification template configuration | Service Owner customises citizen-facing SMS/email notification text for key status events | P1 | Service Owner |
| SVC-F09 | Service preview | Service Owner previews the citizen application form and employee processing view via a mobile emulator before publishing | P1 | Service Owner |
| SVC-F10 | Service publish approval | Service Owner submits a configured service for publication. The Administrator reviews the submission and either approves (making the service live on the Citizen Portal) or rejects it with comments. Service Owner can unpublish a live service to pause intake; unpublish also requires Administrator confirmation | P0 | Service Owner, Administrator |
| SVC-F11 | Live service manage view | Once a service is live, a dedicated Manage view is available showing: portal URLs for Citizen and Employee apps (with copy), active modules, published version history (version number, publish date, actor, changed modules), service-scoped runtime activity log, and deployment history | P0 | Administrator, Service Owner |
| SVC-F12 | Service duplication | Service Owner duplicates an existing service configuration as the starting point for a new variant | P2 | Service Owner |

---

### Module 9: Go-Live Management

| Feature ID | Feature Name | Brief Description | Priority | Primary Persona(s) |
|---|---|---|---|---|
| GOL-F01 | Go-live readiness checklist | Guided checklist confirming all required setup steps (org profile, boundaries, service config, users) are complete before going live | P0 | Service Owner, Administrator |
| GOL-F02 | Deployment URL generation | The system automatically generates public URLs for the Citizen Portal and Employee Portal on go-live. Custom domain configuration (e.g., licenses.cityname.gov) is a separate P2 capability | P0 | System |
| GOL-F03 | Go-live approval | Service Owner submits the account for go-live; Administrator reviews and approves before the account goes live. Administrators can initiate go-live directly without a separate approval step | P0 | Service Owner, Administrator |

---

### Module 10: Audit Log

| Feature ID | Feature Name | Brief Description | Priority | Primary Persona(s) |
|---|---|---|---|---|
| AUD-F01 | Platform-wide immutable action log | Every user action, configuration change, and access event is logged with timestamp, actor, and affected record — uneditable | P0 | Administrator |
| AUD-F02 | Filter and search | Administrator filters the audit log by user, date range, action type, or affected entity | P1 | Administrator |
| AUD-F03 | Export audit log | Administrator exports the filtered audit log as CSV for compliance or investigation purposes | P2 | Administrator |

---

### Module 11: License Verification & Enforcement

| Feature ID | Feature Name | Brief Description | Priority | Primary Persona(s) |
|---|---|---|---|---|
| ENF-F01 | QR code license verification | Enforcement officer scans QR code on a citizen's digital certificate to confirm validity and current status via the Verification Portal | P1 | End User / Enforcement Officer |
| ENF-F02 | Public license lookup | Publicly accessible page for searching a license by reference number — no login required | P0 | End User / Enforcement Officer |
| ENF-F03 | Mobile-optimised verification portal | Verification portal is optimised for mobile browser use — no app download required | P0 | End User / Enforcement Officer |

---

### Module 12: Out of the Box Integrations

| Feature ID | Feature Name | Brief Description | Priority | Primary Persona(s) |
|---|---|---|---|---|
| INT-F01 | SMS / Email gateway | Out-of-the-box SMS and email notification delivery via a pre-configured gateway; no custom notification integration required per deployment | P0 | Administrator, Service Owner |

---

### Module 13: Product Telemetry

| Feature ID | Feature Name | Brief Description | Priority | Primary Persona(s) |
|---|---|---|---|---|
| TEL-F01 | Usage analytics dashboard | eGov and Hosting Partner view aggregated usage metrics per account: active users, application volumes, and feature adoption rates | P1 | eGov Product / Operations Team, Hosting Partner |
| TEL-F02 | Feature adoption tracking | Track which modules and features are being used across accounts to inform product roadmap prioritisation | P1 | eGov Product / Operations Team |
| TEL-F03 | User behaviour analysis | Anonymised funnel analysis of citizen application completion rates, drop-off points, and session patterns | P1 | eGov Product / Operations Team |
| TEL-F04 | Account health monitoring | Hosting Partner monitors per-account activity levels, go-live status, and engagement trends | P1 | Hosting Partner |
| TEL-F05 | Telemetry privacy controls | Telemetry data is aggregated and anonymised; no personally identifiable information (PII) is captured in telemetry events | P0 | eGov Product / Operations Team |

---

### Module 14: Citizen Interface

| Feature ID | Feature Name | Brief Description | Priority | Primary Persona(s) |
|---|---|---|---|---|
| CIT-F01 | Citizen authentication | Phone-based OTP authentication; new users provide their name on first login | P0 | Citizen / Entity (Applicant) |
| CIT-F02 | Home screen | Landing screen showing a hero section, popular services grid, and a summary of the citizen's recent applications | P0 | Citizen / Entity (Applicant) |
| CIT-F03 | Service catalogue | Browsable list of all available services with name, category, and coming soon indicators | P0 | Citizen / Entity (Applicant) |
| CIT-F04 | Multi-step application form | Platform shell for citizen application submission: step-by-step wizard with progress bar, field type rendering (text, dropdown, radio, file upload), conditional field visibility, dependent dropdowns, per-step validation, auto-save draft, and draft resumption | P0 | Citizen / Entity (Applicant) |
| CIT-F05 | Application tracking | List of the citizen's applications with status, filterable by All / In Progress / Issued / Rejected; application detail view showing status, fee summary, form data, documents, and workflow timeline | P0 | Citizen / Entity (Applicant) |
| CIT-F06 | Document wallet | Centralised screen for all citizen-owned documents across applications: issued certificates and payment receipts, each viewable and downloadable as PDF | P0 | Citizen / Entity (Applicant) |
| CIT-F07 | Notification inbox | Platform-level notification screen with unread badge count and mark-all-read; notification content is configured via the Service Configuration notification template (SVC-F08) | P1 | Citizen / Entity (Applicant) |
| CIT-F08 | Citizen profile | Screen showing the citizen's name, phone number, application count, issued count, and sign-out action | P1 | Citizen / Entity (Applicant) |

---

### Module 15: Employee Interface

| Feature ID | Feature Name | Brief Description | Priority | Primary Persona(s) |
|---|---|---|---|---|
| EMP-F01 | Employee authentication | Email and password authentication with role-based session (Document Verifier, Field Inspector, Approver) | P0 | Field and Office Employee |
| EMP-F02 | Role-based task inbox | Filtered queue of applications scoped to the logged-in employee's role; includes SLA status per application (On Track / At Risk / Breached) and an aggregate SLA summary | P0 | Field and Office Employee |
| EMP-F03 | Application detail view | Full application detail with tabbed sections: Applicant, Business, Location, Operations, Documents, Checklist, and Timeline; includes a visual pipeline strip showing the 3-stage workflow progress | P0 | Field and Office Employee |
| EMP-F04 | Document verification | Employee reviews individual uploaded documents and marks each as Verified or Rejected (with reason); application advances once all required documents are verified | P0 | Field and Office Employee |
| EMP-F05 | Inspection workflow | Field Inspector schedules an inspection (date and time), records findings, and submits a recommendation (Pass / Conditional / Fail) to advance the application | P0 | Field and Office Employee |
| EMP-F06 | Application rejection | Employee rejects an application with a mandatory reason, which is recorded in the workflow timeline and visible to the citizen | P0 | Field and Office Employee |
| EMP-F07 | License issuance | Approver triggers certificate issuance; platform generates the PDF license certificate | P0 | Field and Office Employee |
| EMP-F08 | Approvals queue | Dedicated view for the Approver role showing applications at payment-complete stage ready for final approval and issuance | P0 | Field and Office Employee |
| EMP-F09 | Inspections queue | Dedicated view for the Field Inspector role showing applications at inspection pending and scheduled stages | P0 | Field and Office Employee |
| EMP-F10 | Application search | Cross-service search by application ID (ARN), applicant name, or phone number | P1 | Field and Office Employee |
| EMP-F11 | Employee dashboard | Overview of weekly metrics (total applications, pending review, approved, rejected) and service-level queue counts | P1 | Field and Office Employee |
| EMP-F12 | Reports and analytics | Operational reporting dashboard covering: Executive Summary (KPIs + geographic map), Business Landscape, Applications & Renewals, Revenue, and Process Efficiency; includes geographic filtering, Excel export, and applicant detail drill-down | P1 | Field and Office Employee |
| EMP-F13 | Notification inbox | Platform-level notification center with unread badge count; notification content is triggered by workflow events configured in Service Configuration | P1 | Field and Office Employee |
| EMP-F14 | Employee profile | Screen showing the employee's name, email, role, and sign-out action | P1 | Field and Office Employee |

---

## 11. Templates Available

Templates are created and maintained by the eGov Product team and deployed with each platform release. Additional templates will be prioritised based on use case demand from Hosting Partners and government clients.

| Template Name | Service Type | V1 Status | Notes |
|---|---|---|---|
| Trade License | License | Confirmed — In Build | Highest-demand use case across target markets; covers application submission, fee payment, workflow processing, and certificate issuance |
| Birth and Death Certificate | Certificate | Confirmed — In Build | Covers application and issuance of birth and death certificates |
| Fire NOC | Permit | Confirmed — In Build | No Objection Certificate issued by fire department; covers application, inspection workflow, and certificate issuance |

> **Note:** Future templates will be added to this section as they are scoped and confirmed for release. Template creation follows the process defined in Module 2 (Template Creation & Template Marketplace).

---

## 12. Out of Scope for V1

The following are technically feasible and may be addressed in future versions, but are explicitly deferred from V1 to keep scope focused and delivery timelines achievable.

- **Integrated Partner Portal** — Provisions for Hosting Partners to create accounts, monitor infrastructure health, and manage deployments will be available via existing tools and manual processes. An integrated, unified partner interface that consolidates these capabilities is not in V1 scope.
- **Self-service account signup** — Governments or partners cannot create accounts without Hosting Partner involvement in V1. Self-service signup flows are a future capability.
- **Independent template publishing** — eGov product team can author templates, but publishing them independently (outside a platform release) requires a future self-service pipeline.
- **Multi-language UI** — The localisation framework ships in V1 but full translation beyond English is post-launch.
- **SSO and federated identity** — Deferred to a separate PRD; email-based authentication is the V1 path.
- **Post-go-live boundary editing** — Versioned boundary change management (ward splits, deactivation) is V2.
- **Direct OSM integration** — The platform does not connect to or query OpenStreetMap directly in V1. Hosting Partners download OSM data and upload it manually as part of account setup. Automated OSM ingestion or live map queries are a future capability.
- **Native mobile app for citizens** — The Citizen Portal is mobile-responsive web; a dedicated native app is deferred.

---

## 13. Permanent Non-Goals

The following are not in scope for this product in any version — they are architectural or strategic boundaries, not deferrals:

- **Financial accounting and tax management** — The platform records fee collection within the licensing workflow; it does not replace or integrate with government accounting or ERP systems.
- **Billing and invoicing between SaaS provider and governments** — Billing arrangements between the Hosting Partner and government clients are handled entirely outside the platform.
- **HR, payroll, or staff management** — Employee user management is scoped to licensing roles only; it is not a workforce management system.
- **Court and enforcement prosecution workflows** — The product records inspection outcomes and enforcement verification; it does not manage legal proceedings, fines, or prosecution case management.
- **Architectural or structural review for building permits** — The platform supports document submission and approval workflow; it does not include engineering assessment tools or structural compliance checks.
- **Non-government or private-sector licensing marketplaces** — The product is designed exclusively for government-issued licenses and permits; private certification or accreditation bodies are out of scope.
- **Custom code per jurisdiction** — The product allows zero customizations. Jurisdictions that require functionality outside the configuration boundary must wait for the product roadmap, not receive bespoke builds. As new use cases emerge, they will be evaluated and prioritised for inclusion as configurable features.
- **Legacy or registry data migration** — Countries are not required to migrate existing licensing records or registry data to go live. The platform starts fresh.
- **Native mobile app for enforcement officers** — A dedicated iOS/Android app for enforcement is not in scope in any version. License verification is delivered via the web-based Verification Portal, accessible from any mobile browser.
- **Subaccounts** — No subaccount or sub-organisation structure is supported in any version. Each government entity is a standalone account; multiple use cases are activated within that account.
- **Public REST APIs and DPI interoperability** — The platform does not expose public REST APIs for external system integration and does not implement DPI interoperability layers (e.g., G2P Connect, X-Road) in any version. Government systems requiring data exchange must use the platform's export and reporting capabilities.

---

## 14. Success Metrics

| # | Metric | Target | Measurement Method | Timeframe |
|---|---|---|---|---|
| 1 | Time-to-go-live | ≤ 5 business days from a signed agreement to the first live Service on the Citizen Portal | Track provisioning date vs. first published service go-live date per account | Per deployment |
| 2 | Citizen self-service rate | ≥ 70% of applications submitted via the Citizen Portal without counter assistance | Application source tag (portal vs. counter-assisted) per account | 6 months post-launch |
| 3 | SLA compliance rate | ≥ 80% of applications resolved within the configured SLA per service type | % of applications with resolution date ≤ SLA deadline across live accounts | 6 months post-launch |
| 4 | Deployment scale | ≥ 10 government accounts live within 12 months of product launch | Count of accounts with at least one published service and at least one submitted application | 12 months post-launch |
| 5 | Support burden | ≤ 2 platform-related support tickets per 100 submitted applications across live accounts | Support ticket volume / application volume ratio (platform issues only; policy queries excluded) | 6 months post-launch |
| 6 | Partner independence | Hosting Partners can independently complete account onboarding and go-live without eGov direct involvement | Track eGov-assisted vs. unassisted go-lives per deployment | 12 months post-launch |
| 7 | Time to go live with a template | ≤ 5 business days from template selection to a live Service on the Citizen Portal | Track Use Template date vs. service go-live date per account | Per deployment |

---

## 15. MVP Scope

**Objective:** Prove that a government department can launch a fully digital licensing service — from configuration to citizen application, processing, and certificate issuance — in 5 business days, without requiring custom development or ongoing engineering support.

| Module | Features Included in MVP | Key Constraint or Dependency |
|---|---|---|
| 1 — Account Onboarding | ACO-F01 through ACO-F03 | Hosting Partner provisions the account; self-service account signup is not MVP |
| 2 — Organisation Settings | ORG-F01 (P0); ORG-F02 (P1) | — |
| 3 — Template Creation & Template Marketplace | TCM-F01, TCM-F02, TCM-F04, TCM-F06 (core path); TCM-F05 P1; TCM-F03 P1; TCM-F07 P2 | V1 templates: Trade License, Birth and Death Certificate, Fire NOC; independent publishing is post-V1 |
| 4 — Boundary Data Setup | BDS-F01 through BDS-F07 | Hosting Partner uploads OSM data manually during account setup; direct OSM integration is not V1 |
| 5 — Language Localization | LNG-F01 through LNG-F02 | Full translation of UI strings to local languages is post-launch; multi-language (LNG-F03) is V2 |
| 6 — Theme & Branding Setup | THM-F01, THM-F02 | Countries require minimum theme configuration; custom domain (THM-F04) and favicon (THM-F03) are P2 |
| 7 — User Management | TBD — pending Keycloak review | — |
| 8 — Service Configuration | SVC-F01 through SVC-F11 | Service Owners must Use Template to start; no from-scratch creation; SVC-F12 (service duplication) is P2 |
| 9 — Go-Live Management | GOL-F01 through GOL-F03 | — |
| 10 — Audit Log | AUD-F01, AUD-F02 | Export (AUD-F03) is P2 |
| 11 — License Verification & Enforcement | ENF-F02, ENF-F03 (P0); ENF-F01 (P1) | ENF-F01 requires QR code on issued certificates to be live |
| 12 — Out of the Box Integrations | INT-F01 (SMS / Email gateway) | — |
| 13 — Product Telemetry | TEL-F05 (P0 — privacy controls); TEL-F01 through TEL-F04 (P1) | Telemetry data must be anonymised; no PII captured |
| 14 — Citizen Interface | CIT-F01 through CIT-F06 (P0); CIT-F07, CIT-F08 (P1) | Form field content and workflow steps are template-driven; this module covers the platform shell |
| 15 — Employee Interface | EMP-F01 through EMP-F09 (P0); EMP-F10 through EMP-F14 (P1) | Role-based screens; inspection workflow (EMP-F05) is now in scope |
| **Deferred to V2** | Boundary post-go-live versioning (BDS-F08), multi-language (LNG-F03) | — |

---

## 16. Dependencies & Assumptions

### External Dependencies

| Dependency | Type | Owner | Risk if Unavailable |
|---|---|---|---|
| Payment Gateway (per jurisdiction) | Integration — not out of the box | Hosting Partner per deployment | Payment gateway is not a pre-built platform integration; each deployment requires a custom gateway integration. Offline counter payment recording is available without a gateway |
| DIGIT Platform Infrastructure | Platform — Hosting | eGov Global (Year 1); Hosting Partner (Year 2+) | Required for deployment |
| Hosting Partner in target market | Commercial / Delivery | eGov Commercial | Without a Hosting Partner, eGov must deploy directly; not the intended model at scale |
| Spatial processing infrastructure (PostGIS or equivalent) | Technical — Shapefile processing | Engineering | Required for shapefile gap detection and geometry validation |
| Proprietary tooling for SaaS availability | Infrastructure | eGov Global / Hosting Partner | eGov Global and Hosting Partners are okay using proprietary tools to meet SaaS availability requirements |

### Key Assumptions

- **Hosting Partners provision each account:** A Hosting Partner provisions each account and creates the Super Admin. Infrastructure setup is a one-time activity handled by the Hosting Partner. The platform itself is self-serve once the account is live.
- **eGov Global hosts the SaaS platform for Year 1:** There is no dependency on an external hosting partner for production deployment in Year 1. From Year 2 onwards, Hosting Partners are expected to independently host and manage their own instances.
- **Hosting Partners supply boundary data during account setup:** Hosting Partners download OSM data and upload it as part of the account setup process. If OSM coverage is insufficient for a market, the Hosting Partner or government can supply a shapefile or Excel-based boundary file instead. Direct OSM integration is not in V1; the platform does not query or ingest OSM data automatically.
- **Online access is assumed for all users:** All portals (Citizen, Employee, Admin, Verification) are web-based and require internet connectivity. The platform makes no commitment to offline mode in any version.
- **A single jurisdiction maps to one account; no subaccounts:** Each government entity gets its own isolated account. Multi-jurisdiction sharing or subaccounts are not supported. Within a single account, multiple service use cases (license types) can be activated.
- **English is the primary UI language for MVP:** The product launches in English. Localisation framework is P1; full translation of UI strings to local languages follows the first validated deployment in each market.
- **Governments adopt the platform's out-of-the-box email and SMS services:** No custom notification integrations are required per deployment. Go-live timelines have been scoped with this assumption in mind.
- **Governments are comfortable hosting data in the shared SaaS platform:** Data from all accounts is stored in a shared database infrastructure with isolation enforced at schema level, not database level. Account identity is enforced at the API gateway. Governments accept this model as a condition of using the SaaS platform. eGov can provide a data replication strategy to an in-country database where required.
- **WCAG 2.0 compliance is the accessibility standard:** The platform targets WCAG 2.0 Level AA. Higher standards (e.g., WCAG 2.1 or 2.2) are not committed to in V1.
- **NIST-compliant security baseline; no formal certification required:** The platform is designed and operated to be NIST-compliant. eGov will pursue voluntary NIST certification independently but no formal certification is required before go-live. Per-deployment security audits or jurisdiction-specific compliance certifications are not assumed to be required.
- **Payment gateway is not out of the box:** Online payment requires a custom gateway integration per deployment. The platform supports payment configuration (channels, timing, receipt generation) but does not ship with a pre-built gateway. Offline counter payment recording is available without a gateway integration. Each custom gateway integration takes approximately 1 month to implement.
- **No legacy data migration is required:** Countries do not need to migrate existing licensing records or registry data to go live on the platform. The system starts fresh.
- **Billing is handled outside the platform:** Billing and invoicing between the Hosting Partner and end-customer governments is managed entirely outside the product.
- **Zero customizations:** The product supports configuration only, not customization. As new use cases emerge beyond the current configuration boundary, they will be evaluated and prioritised in the product roadmap.
- **All services are configured from templates:** Service Owners configure services starting from a Template Marketplace selection. No from-scratch service creation is supported in V1.
- **Infrastructure costs reflect SLA tier selection:** eGov provides infrastructure requirements and associated costing for three levels of SLA uptime. Hosting Partners select the tier appropriate to their government clients' requirements. Cost vs. uptime tradeoffs are accepted as a design principle — higher uptime commitments require higher infrastructure investment. Tier specifications and pricing will be provided separately by the eGov infrastructure team.

---

## 17. Non-Functional Requirements

### Availability & Uptime

eGov provides infrastructure specifications and associated costing for three SLA tiers. Hosting Partners select a tier based on their government clients' uptime requirements. Higher uptime commitments require proportionally higher infrastructure investment. Tier definitions and pricing are provided separately by the eGov infrastructure team.

| SLA Tier | Description | Intended Use |
|---|---|---|
| Tier 1 | Standard availability | Deployments where brief planned or unplanned downtime is acceptable |
| Tier 2 | Enhanced availability | Deployments requiring consistent uptime during business-hours operations |
| Tier 3 | High availability | Deployments requiring near-continuous uptime for high-volume or time-sensitive services |

### Data Replication

Accounts can integrate with the platform database to create a read replica within their own data centre. This addresses in-country data residency requirements where governments require local storage, and supports business continuity and integration with in-country government data systems. Configuration and ongoing management of the replica is the responsibility of the Hosting Partner or the government. Data replication is available in V1 for accounts that require it.

### Security

The platform is designed and operated to be NIST-compliant. eGov will pursue voluntary NIST certification independently; no formal certification is required before go-live. Account identity is enforced at the API gateway. Data isolation is at schema level, not database level.

### Accessibility

The platform targets WCAG 2.0 Level AA across all interfaces (Citizen Portal, Employee Portal, Admin Portal, Verification Portal).

### Portability & Self-Hosted Migration

Any account must be able to migrate from the shared SaaS platform to a self-hosted deployment on their own infrastructure at any time, with minimum effort. Migration must include the full account state: platform installation, service configurations (forms, workflows, fee structures, document checklists), and all application and licensing data. The platform is designed to make this migration a well-documented operational procedure rather than a bespoke engineering exercise — no data should be locked to the shared SaaS instance.

### Performance

Specific performance targets (page load times, concurrent user capacity, API response times) will be defined in the High-Level Design document and validated during load testing before go-live.

---

## 18. Governance

### Decision-Making Structure

| Committee | Members | Responsibility |
|---|---|---|
| **Steering Committee** | Viraj, Santosh, Chandar, Varun, Jojo + POD | Strategic oversight, resource decisions, escalation path for blockers |
| **Product Committee** | Andrew, Subham, Shivani, Megha (+ country programme managers) | Product validation, market feedback incorporation, feature prioritisation |
| **Tech Committee** | Chandar, Ghanshyam, Aniket, Subhashini, Kavi + Abhishek | Architecture decisions, technical sign-off, platform change approvals |
| **POD (Delivery Team)** | Ghanshyam, Tahera, Sanjana, Engineering Partner Team | Day-to-day design, build, delivery, and progress reporting |

### Delivery Roles

| Role | Owner | Responsibility |
|---|---|---|
| Product Manager | Tahera Bharmal | Product roadmap, value proposition, partner and market engagement |
| Associate PM | Sanjana | Feature design, prototype validation, documentation |
| Architect | Ghanshyam | Platform saasification design, tech council sign-off, engineering partner oversight |
| Engineering Partner | TBD (evaluation in progress) | Design, build, test, deploy, and document all features; manage infra and DevOps |
| Designer | Andrew (on demand) | Usability improvements, accessibility audit |
| SaaS Support | TBD (post first customer) | L3/L4 bug resolution, recurring issue analysis |

---

## 19. Related Documents

### Module PRDs
_See Section 9 for the full Module PRDs Index with links and status._

### Context & Reference
- User Personas: `../../ContextforAutomations/user_persona_context.md`
- Design Principles: `../../ContextforAutomations/design_principles.md`
- DIGIT Design System: `../../ContextforAutomations/DIGIT_Design_Principles.md`
- Company Context: `../../ContextforAutomations/company_context.md`

### Frameworks & Tools
- PRD Writing Guide: `./PRD Templates/00_PRD_Writing_Guide.md`
- Socratic PRD Review: `../../Frameworks/socratic-questioning-prd.md`
- Devil's Advocate Framework: `../../Frameworks/devils-advocate-product-strategy.md`
- DHM Model: `../../Frameworks/dhm-model.md`
- Rumelt Strategy Kernel: `../../Frameworks/rumelt-strategy-kernel.md`

### Supporting Documents
- Open Questions Tracker: `./PRD_OpenQuestions_LnP.md`
- Gap Analysis — Admin Portal: `./PRD_GapAnalysis_AdminPortal.md`
- Gap Analysis — Citizen Portal: `./PRD_GapAnalysis_CitizenPortal.md`
- Gap Analysis — Employee Portal: `./PRD_GapAnalysis_EmployeePortal.md`
- Deck: `../Presentations/License and Permit SaaS - Goals, Governance etc.pptx`
- Prototype — Citizen App: `../../Lovable code/CitizenApp/`
- Prototype — Employee App: `../../Lovable code/EmployeeApp/`
- Prototype — Admin App: `../../Lovable code/AdminApp/`
- PRD Review Notes — Boundary Data Setup: `./PRD_ReviewNotes_BoundaryDataSetup.md`
