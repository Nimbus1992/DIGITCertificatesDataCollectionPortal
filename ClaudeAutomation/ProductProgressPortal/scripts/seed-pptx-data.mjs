/**
 * Seeds ALL remaining portal data derived from
 * "License and Permit SaaS - Goals, Governance etc.pptx"
 *
 * Populates (merges into existing lnp row):
 *   - roadmap        — sprint milestones from slide 13
 *   - okrs           — product goals → objectives + metrics → key results (slides 5–7)
 *   - risks          — key assumptions turned into tracked risks (slides 8–9)
 *   - productOverview.strategicAlignment
 *   - execSummary    — sprint 3 complete snapshot
 *
 * Run: node --env-file=.env scripts/seed-pptx-data.mjs
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const PRODUCT_ID   = 'lnp';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing env vars. Run: node --env-file=.env scripts/seed-pptx-data.mjs');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── ROADMAP — slide 13 ───────────────────────────────────────────────────────
// Sprints: 1→May 15, 2→May 30, 3→Jun 15 (done), 4→Jun 30 (in progress), 5→Jul 15, 6→Jul 30
const roadmap = [
  // Sprint 1 — by May 15, 2026 (Completed)
  {
    item: 'Functioning MVP ready for external feedback',
    description: 'Working version of MVP (not yet on DIGIT) accessible for stakeholder demos and external feedback loops',
    status: 'Completed',
    confidence: 'Green',
    dependencies: '',
    deliveryWindow: 'Sprint 1 — May 15, 2026',
    quarter: 'Q2 2026',
    phase: 'Platform SaaSification',
  },
  {
    item: 'Engineering partner onboarded',
    description: 'Es Magico formally onboarded with scope, SLAs, and team structure in place',
    status: 'Completed',
    confidence: 'Green',
    dependencies: 'Partner evaluation finalised by April',
    deliveryWindow: 'Sprint 1 — May 15, 2026',
    quarter: 'Q2 2026',
    phase: 'L&P SaaS Design and Build',
  },
  {
    item: 'Webpage and V1 pitch deck ready',
    description: 'Value-proposition pitch doc and product webpage ready for external partner conversations',
    status: 'Completed',
    confidence: 'Green',
    dependencies: '',
    deliveryWindow: 'Sprint 1 — May 15, 2026',
    quarter: 'Q2 2026',
    phase: 'GTM & Tooling',
  },

  // Sprint 2 — by May 30, 2026 (Completed)
  {
    item: 'Platform design signed off by Tech Council',
    description: 'Architecture and SaaSification changes for DIGIT platform reviewed and approved by Tech Council',
    status: 'Completed',
    confidence: 'Green',
    dependencies: 'Tech Council review scheduled',
    deliveryWindow: 'Sprint 2 — May 30, 2026',
    quarter: 'Q2 2026',
    phase: 'Platform SaaSification',
  },
  {
    item: 'Trade License template configurable for 1 country',
    description: 'Trade License template available and configured for a specific country use case (Guinea Bissau)',
    status: 'Completed',
    confidence: 'Green',
    dependencies: 'Country policy docs available',
    deliveryWindow: 'Sprint 2 — May 30, 2026',
    quarter: 'Q2 2026',
    phase: 'L&P SaaS Design and Build',
  },
  {
    item: 'Partner can create account and go live in 1 week',
    description: 'Partners can independently create an account and deploy a template end-to-end in under one week (without payment adaptor)',
    status: 'Completed',
    confidence: 'Green',
    dependencies: 'Account admin interface complete',
    deliveryWindow: 'Sprint 2 — May 30, 2026',
    quarter: 'Q2 2026',
    phase: 'Deployment and Support',
  },

  // Sprint 3 — by June 15, 2026 (Completed)
  {
    item: 'All platform SaaSification changes merged',
    description: 'All platform changes completed, reviewed, and merged to main branch',
    status: 'Completed',
    confidence: 'Green',
    dependencies: 'Platform design sign-off (Sprint 2)',
    deliveryWindow: 'Sprint 3 — June 15, 2026',
    quarter: 'Q2 2026',
    phase: 'Platform SaaSification',
  },
  {
    item: 'Per-account usage monitoring available',
    description: 'Partners can observe usage (no. of users, transactions) per account via observability dashboard',
    status: 'Completed',
    confidence: 'Green',
    dependencies: '',
    deliveryWindow: 'Sprint 3 — June 15, 2026',
    quarter: 'Q2 2026',
    phase: 'Deployment and Support',
  },
  {
    item: 'All product and tech documentation complete',
    description: 'Extensive product and tech docs, SOPs for deployment, rollback, recovery, and testing complete',
    status: 'Completed',
    confidence: 'Green',
    dependencies: '',
    deliveryWindow: 'Sprint 3 — June 15, 2026',
    quarter: 'Q2 2026',
    phase: 'L&P SaaS Design and Build',
  },
  {
    item: 'License use case 2 configurable for 1 country',
    description: 'Second license type (Building Permit TBD) templated and configured for a specific country context',
    status: 'Completed',
    confidence: 'Green',
    dependencies: 'Use case selection confirmed',
    deliveryWindow: 'Sprint 3 — June 15, 2026',
    quarter: 'Q2 2026',
    phase: 'L&P SaaS Design and Build',
  },
  {
    item: 'WCAG AA compliance met',
    description: 'All citizen and employee-facing interfaces audited and compliant with WCAG 2.1 AA accessibility standard',
    status: 'Completed',
    confidence: 'Green',
    dependencies: 'Accessibility audit by Andrew',
    deliveryWindow: 'Sprint 3 — June 15, 2026',
    quarter: 'Q2 2026',
    phase: 'L&P SaaS Design and Build',
  },
  {
    item: 'Demo video ready',
    description: 'Product walkthrough demo video produced and ready for GTM use',
    status: 'Completed',
    confidence: 'Green',
    dependencies: '',
    deliveryWindow: 'Sprint 3 — June 15, 2026',
    quarter: 'Q2 2026',
    phase: 'GTM & Tooling',
  },

  // Sprint 4 — by June 30, 2026 (In Progress)
  {
    item: 'PRD, HLD, LLD signed off by Product and Tech Councils',
    description: 'Product Requirements Document, High-Level Design, and Low-Level Design reviewed and formally signed off',
    status: 'In Progress',
    confidence: 'Green',
    dependencies: 'Product Council and Tech Council review',
    deliveryWindow: 'Sprint 4 — June 30, 2026',
    quarter: 'Q2 2026',
    phase: 'L&P SaaS Design and Build',
  },
  {
    item: 'Product deployed on eGov Global production environment',
    description: 'Full production deployment on eGov Global infra with monitoring, observability, and security checks complete',
    status: 'In Progress',
    confidence: 'Green',
    dependencies: 'eGov Global infra ready; all platform changes merged',
    deliveryWindow: 'Sprint 4 — June 30, 2026',
    quarter: 'Q2 2026',
    phase: 'Deployment and Support',
  },
  {
    item: 'Virtual launch event',
    description: 'Public virtual launch of L&P SaaS with stakeholders, partners, and target markets',
    status: 'Upcoming',
    confidence: 'Green',
    dependencies: 'Production deployment complete; GTM assets ready',
    deliveryWindow: 'Sprint 4 — June 30, 2026',
    quarter: 'Q2 2026',
    phase: 'GTM & Tooling',
  },

  // Sprint 5 — by July 15, 2026 (Upcoming)
  {
    item: 'First customer onboarding supported',
    description: 'Support first live government customer through onboarding; identify and fix any production bugs',
    status: 'Upcoming',
    confidence: 'Green',
    dependencies: 'Production deployment; GTM partner signed',
    deliveryWindow: 'Sprint 5 — July 15, 2026',
    quarter: 'Q3 2026',
    phase: 'Deployment and Support',
  },

  // Sprint 6 — by July 30, 2026 (Upcoming)
  {
    item: '1 year goal: 1 government go-live, 1 partner independently hosting SaaS',
    description: 'Validate 1 Year Goal — one government live on L&P SaaS, one partner independently hosting and managing the product',
    status: 'Upcoming',
    confidence: 'Amber',
    dependencies: 'Sprint 5 customer onboarding; partner upskilling complete',
    deliveryWindow: 'Sprint 6 — July 30, 2026',
    quarter: 'Q3 2026',
    phase: 'GTM & Tooling',
  },
];

// ─── OKRs — slides 5–7 ───────────────────────────────────────────────────────
// One row per Objective + Key Result pair
const okrs = [
  // Objective 1: Adoption
  {
    objective: 'Drive rapid adoption — any jurisdiction goes live in weeks, not years',
    keyResult: 'Time to go live with a use case (Template Creation + Configuration + Calculation) ≤ 4 weeks',
    target: '4 weeks',
    actual: '',
    progress: 0,
    status: 'On Track',
    targetDate: '2026-07-30',
    owner: 'Tahera',
    delayed: false,
    reason: '',
    impact: '',
    mitigation: '',
    recoveryPlan: '',
  },
  {
    objective: 'Drive rapid adoption — any jurisdiction goes live in weeks, not years',
    keyResult: 'Avg. # of license/permit types configured per account',
    target: 'TBD (tracked via Dashboard)',
    actual: '',
    progress: 0,
    status: 'On Track',
    targetDate: '2026-07-30',
    owner: 'Tahera',
    delayed: false,
    reason: '',
    impact: '',
    mitigation: '',
    recoveryPlan: '',
  },

  // Objective 2: Partner self-sufficiency
  {
    objective: 'Enable partners to independently drive the full sales, onboarding, and hosting cycle',
    keyResult: '# of partner-led implementations (without eGov involvement)',
    target: 'All (long-term)',
    actual: '',
    progress: 0,
    status: 'On Track',
    targetDate: '2026-07-30',
    owner: 'Tahera',
    delayed: false,
    reason: '',
    impact: '',
    mitigation: '',
    recoveryPlan: '',
  },
  {
    objective: 'Enable partners to independently drive the full sales, onboarding, and hosting cycle',
    keyResult: 'No. of queries from partner / Avg. time spent by core team per customer onboarded',
    target: 'TBD (tracked via Support team)',
    actual: '',
    progress: 0,
    status: 'On Track',
    targetDate: '2026-07-30',
    owner: 'Tahera',
    delayed: false,
    reason: '',
    impact: '',
    mitigation: '',
    recoveryPlan: '',
  },

  // Objective 3: Feature completeness
  {
    objective: 'Deliver a configurable L&P product that covers core use cases across countries',
    keyResult: '# of distinct license/permit archetypes supported',
    target: '2 — Trade License + 1 TBD (MVP)',
    actual: '2',
    progress: 100,
    status: 'Completed',
    targetDate: '2026-06-15',
    owner: 'Tahera',
    delayed: false,
    reason: '',
    impact: '',
    mitigation: '',
    recoveryPlan: '',
  },
  {
    objective: 'Deliver a configurable L&P product that covers core use cases across countries',
    keyResult: '% of requirements for a country reached via configuration',
    target: '60% across 5 countries (MVP)',
    actual: '',
    progress: 0,
    status: 'On Track',
    targetDate: '2026-07-30',
    owner: 'Tahera',
    delayed: false,
    reason: '',
    impact: '',
    mitigation: '',
    recoveryPlan: '',
  },

  // Objective 4: Product experience
  {
    objective: 'Ensure the product is accessible, trustworthy, and delivers predictable citizen value',
    keyResult: 'Accessibility compliance as per WCAG',
    target: 'AA',
    actual: 'AA',
    progress: 100,
    status: 'Completed',
    targetDate: '2026-06-15',
    owner: 'Andrew',
    delayed: false,
    reason: '',
    impact: '',
    mitigation: '',
    recoveryPlan: '',
  },
  {
    objective: 'Ensure the product is accessible, trustworthy, and delivers predictable citizen value',
    keyResult: '% of applications that meet SLA defined',
    target: 'TBD',
    actual: '',
    progress: 0,
    status: 'On Track',
    targetDate: '2026-07-30',
    owner: 'Tahera',
    delayed: false,
    reason: '',
    impact: '',
    mitigation: '',
    recoveryPlan: '',
  },
  {
    objective: 'Ensure the product is accessible, trustworthy, and delivers predictable citizen value',
    keyResult: 'User Satisfaction Score',
    target: 'TBD (Survey in Prod)',
    actual: '',
    progress: 0,
    status: 'On Track',
    targetDate: '2026-07-30',
    owner: 'Tahera',
    delayed: false,
    reason: '',
    impact: '',
    mitigation: '',
    recoveryPlan: '',
  },
  {
    objective: 'Ensure the product is accessible, trustworthy, and delivers predictable citizen value',
    keyResult: '# of L1 Support Tickets raised',
    target: 'TBD (tracked via Support team)',
    actual: '',
    progress: 0,
    status: 'On Track',
    targetDate: '2026-07-30',
    owner: 'Tahera',
    delayed: false,
    reason: '',
    impact: '',
    mitigation: '',
    recoveryPlan: '',
  },

  // Objective 5: Platform reliability & cost
  {
    objective: 'Operate a reliable, cost-effective, and secure SaaS platform',
    keyResult: '% Uptime',
    target: '95% (MVP)',
    actual: '',
    progress: 0,
    status: 'On Track',
    targetDate: '2026-07-30',
    owner: 'Ghanshyam',
    delayed: false,
    reason: '',
    impact: '',
    mitigation: '',
    recoveryPlan: '',
  },
  {
    objective: 'Operate a reliable, cost-effective, and secure SaaS platform',
    keyResult: 'Infra cost per account',
    target: 'TBD',
    actual: '',
    progress: 0,
    status: 'On Track',
    targetDate: '2026-07-30',
    owner: 'Ghanshyam',
    delayed: false,
    reason: '',
    impact: '',
    mitigation: '',
    recoveryPlan: '',
  },
  {
    objective: 'Operate a reliable, cost-effective, and secure SaaS platform',
    keyResult: 'Audit success rate',
    target: 'TBD',
    actual: '',
    progress: 0,
    status: 'On Track',
    targetDate: '2026-07-30',
    owner: 'Ghanshyam',
    delayed: false,
    reason: '',
    impact: '',
    mitigation: '',
    recoveryPlan: '',
  },
];

// ─── RISKS — slides 8–9 (key assumptions that could fail) ─────────────────────
const risks = [
  {
    description: 'Countries require UI customisation beyond standard theme config — breaks configuration-only MVP model',
    severity: 'High',
    probability: 60,
    impact: 9,
    owner: 'Tahera',
    mitigation: 'Validate with 2+ target country stakeholders in Sprint 1–2; document recurring gaps; add to product roadmap if pattern emerges',
    eta: '2026-05-30',
    status: 'Open',
  },
  {
    description: 'Data sovereignty concerns — governments unwilling to host data on a non-locally-deployed SaaS platform',
    severity: 'High',
    probability: 50,
    impact: 9,
    owner: 'Santhosh',
    mitigation: 'Develop in-country data replication strategy; include data residency option in pitch; proactively address in country conversations',
    eta: '2026-05-15',
    status: 'Open',
  },
  {
    description: 'DIGIT 3.0 (Java) SaaSification complexity higher than estimated — decision to build on 3.0 was reopened',
    severity: 'High',
    probability: 50,
    impact: 8,
    owner: 'Ghanshyam',
    mitigation: 'Tech Council sign-off on platform design by Sprint 2; Ghanshyam to lead architecture validation and surface blockers early',
    eta: '2026-05-30',
    status: 'Closed',
  },
  {
    description: 'Configuration-only model may not meet 60% of country requirements — scope gap forces custom builds',
    severity: 'High',
    probability: 40,
    impact: 8,
    owner: 'Tahera',
    mitigation: 'Validate coverage target against 5 country policy docs in Sprint 2–3; surface gaps early to expand config options before MVP',
    eta: '2026-06-15',
    status: 'Open',
  },
  {
    description: 'Payment gateway customisation takes ~1 month — may push payment-dependent use cases post-MVP',
    severity: 'Medium',
    probability: 70,
    impact: 6,
    owner: 'Tahera',
    mitigation: 'MVP explicitly excludes payment adaptor for first partner go-live; standard out-of-the-box logic covers common cases',
    eta: '2026-07-30',
    status: 'Open',
  },
  {
    description: 'Partner team skillsets TBD — upskilling delay impacts Sprint 1–2 engineering delivery',
    severity: 'Medium',
    probability: 35,
    impact: 6,
    owner: 'Ghanshyam',
    mitigation: 'Finalised engineering partner (Es Magico); Ghanshyam leading upskilling and technical handholding',
    eta: '2026-05-15',
    status: 'Closed',
  },
  {
    description: 'No formal security certifications — self-declaration only; may block risk-averse government buyers',
    severity: 'Medium',
    probability: 30,
    impact: 7,
    owner: 'Santhosh',
    mitigation: 'Follow NIST security guidelines; plan voluntary NIST audit and gap remediation; position as roadmap item post-MVP',
    eta: '2026-07-30',
    status: 'Open',
  },
];

// ─── STRATEGIC ALIGNMENT (productOverview patch) ─────────────────────────────
const strategicAlignment = [
  'DIGIT platform ecosystem — L&P SaaS built on DIGIT 3.0 (Java), leveraging existing platform services and registry infrastructure',
  'Africa DPI (Digital Public Infrastructure) journey — supports low-investment, scalable entry point for governments',
  'eGovernments Foundation open-source mission — designed for extensibility, transparency, and eventual self-hosted migration',
  "eGov Global's commercial expansion — 24 countries lit up by 2030 anchored by this product",
  'NIST security alignment — platform security posture follows NIST guidelines with voluntary audit planned post-MVP',
];

// ─── EXEC SUMMARY snapshot (Sprint 3 complete, Sprint 4 in progress) ──────────
const execSummary = {
  overallStatus: 'Green',
  deliveryConfidence: 'Green',
  budgetConfidence: 'Green',
  timelineConfidence: 'Amber',
  okrsOnTrack: 10,
  milestonesCompleted: 12,
  budgetUtilized: 0,
  roadmapProgress: 60,
  successMetricProgress: 15,
  biggestWin: 'Sprint 3 complete: 2 use case templates ready, all platform changes merged, WCAG AA compliance achieved, demo video done',
  biggestRisk: 'Production deployment and Virtual Launch due June 30 — PRD/HLD/LLD sign-off still in progress',
  mostImportantUpdate: 'Sprint 3 delivered on time. Sprint 4 (June 30) targets PRD/HLD/LLD sign-off, production deployment on eGov Global infra, and virtual launch.',
  decisionsNeeded: [
    'Confirm second license use case beyond Trade License (Building Permit?)',
    'RPC vs HTTP API design — decision open',
    'DIGIT Design System vs rebuild on Shadcn — decision open',
  ],
  leadershipSupport: [
    'Identify expert orgs/partners for product validation — ASAP',
    'Priority market list and first customer contract signing',
    'Platform resource for SaaSification (internal)',
    'InfoSec team for voluntary NIST gap assessment',
  ],
  escalations: [],
};

// ─── SEED ─────────────────────────────────────────────────────────────────────
async function seed() {
  console.log(`Fetching current portal state for "${PRODUCT_ID}"…`);
  const { data: existing, error: fetchErr } = await supabase
    .from('portal_state')
    .select('data')
    .eq('id', PRODUCT_ID)
    .maybeSingle();

  if (fetchErr) { console.error('Fetch failed:', fetchErr.message); process.exit(1); }

  const current = existing?.data ?? {};

  // Patch productOverview strategicAlignment only (keep existing fields)
  const productOverview = {
    ...(current.productOverview ?? {}),
    strategicAlignment,
  };

  const merged = {
    ...current,
    roadmap,
    okrs,
    risks,
    execSummary,
    productOverview,
  };

  console.log('Upserting…');
  const { error: upsertErr } = await supabase
    .from('portal_state')
    .upsert({ id: PRODUCT_ID, data: merged, updated_at: new Date().toISOString() });

  if (upsertErr) { console.error('Upsert failed:', upsertErr.message); process.exit(1); }

  console.log('✓ Seed complete');
  console.log(`  Roadmap items : ${roadmap.length}  (${roadmap.filter(r=>r.status==='Completed').length} completed, ${roadmap.filter(r=>r.status==='In Progress').length} in progress, ${roadmap.filter(r=>r.status==='Upcoming').length} upcoming)`);
  console.log(`  OKRs          : ${okrs.length} key results across 5 objectives`);
  console.log(`  Risks         : ${risks.length}  (${risks.filter(r=>r.status==='Open').length} open, ${risks.filter(r=>r.status==='Closed').length} closed)`);
  console.log(`  Exec Summary  : Sprint 3 snapshot applied`);
  console.log(`  Strategic Alignment: ${strategicAlignment.length} items added`);
}

seed();
