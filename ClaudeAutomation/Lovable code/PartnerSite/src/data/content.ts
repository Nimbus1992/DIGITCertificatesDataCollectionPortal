// ── Types ────────────────────────────────────────────────────────────────────

export interface NavLink {
  label: string
  id: string
}

export interface HeroStat {
  value: string
  label: string
}

export interface UserRole {
  role: string
  tagline: string
  capabilities: string[]
  screenshot: string | null
  placeholder?: boolean
}

export interface ProductDifferentiator {
  title: string
  body: string
}

export interface DataFeature {
  icon: string
  title: string
  body: string
  wide?: boolean
}

export interface DeploymentModel {
  name: string
  descriptor: string
  borderColor: string
  highlight?: boolean
  badge?: string
  howItWorks: string[]
  revenueStreams: string[]
  bestFor: string
}

export interface ComparisonRow {
  label: string
  saas: string
  managed: string
}

export interface LicenseType {
  name: string
}

export interface ScaleJurisdiction {
  city: string
  licenseTypes: string[]
  revenueLevel: number
}

export interface ImpactStat {
  value: string
  label: string
  note: string
}

export interface CaseStudy {
  name: string
  borderColor: string
  tags: string[]
  headline: string
  headlineSub: string
  body: string
  metrics: { label: string; before: string; after: string }[]
  partnerAngle: string
}

export interface RevenueStream {
  title: string
  description: string
}

export interface EgovSupport {
  item: string
}

// ── Navigation ────────────────────────────────────────────────────────────────

export const nav: { links: NavLink[]; cta: string } = {
  links: [
    { label: 'The Product', id: 'product' },
    { label: 'Deployment Models', id: 'deployment' },
    { label: 'Scaling', id: 'scale' },
    { label: 'Proof Points', id: 'proof' },
    { label: 'Partner Economics', id: 'partner' },
  ],
  cta: 'Become a Partner',
}

// ── Hero ──────────────────────────────────────────────────────────────────────

export const hero = {
  eyebrow: 'For Implementation Partners',
  h1Lines: ['Go Live in days.', 'Scale across governments.'],
  accentLineIndex: 1,
  subheadline:
    'DIGIT License, Permits and Certificates is a proven platform for government licensing and permitting. Take it to market as your own practice — implementation, SaaS hosting, or managed services.',
  ctaPrimary: { label: 'Become a Partner', href: '#contact' },
  ctaSecondary: { label: 'See the Model', href: '#deployment' },
  stats: [
    { value: '730+', label: 'Cities Live' },
    { value: '9.5M', label: 'Licenses Issued' },
    { value: '$900M', label: 'Revenue Collected' },
  ] as HeroStat[],
  screenshot: '/screenshots/admin-dashboard.png',
  screenshotAlt: 'DIGIT License, Permits and Certificates Admin Dashboard',
}

// ── Product Overview ──────────────────────────────────────────────────────────

export const productIntro = {
  eyebrow: 'Built for Every User',
  h2: 'A better experience for all users.',
  body: 'DIGIT License, Permits and Certificates is designed around every person in the licensing process — from citizens applying online to department staff processing applications and administrators overseeing performance.',
}

export const userRoles: UserRole[] = [
  {
    role: 'Citizens',
    tagline: 'Organizations or individuals applying for a license, permit or certificate.',
    capabilities: [
      'All your interactions with the issuing departments, now possible from anywhere, anytime',
      'Proactively receive information on the status of your applications',
      'Download and share verifiable digital certificates',
    ],
    screenshot: '/screenshots/citizen-portal.png',
  },
  {
    role: 'Department Employee',
    tagline: 'Government staff responsible for processing, reviewing and approving applications.',
    capabilities: [
      'Focus on the tasks for the day, ensure no breach of SLAs',
      'Automation of manual repetitive tasks such as fee calculation and digital certificate issuance',
      'Information to support citizens in their queries',
      'Reports to support improvement of revenue and compliance outcomes',
    ],
    screenshot: '/screenshots/employee-inbox.png',
  },
  {
    role: 'Administrators',
    tagline: 'Department Leads and officials monitoring performance, revenue and compliance.',
    capabilities: [
      'Monitor trends over time and drill down to specific transactions through real-time interactive dashboards',
      'Identify failure points in the process',
      'Have complete visibility of all actions via detailed audit trails',
    ],
    screenshot: '/screenshots/admin-dashboard.png',
  },
  {
    role: 'Service Owners',
    tagline: 'Accountable for the end-to-end quality, strategy, and continuous improvement of a specific public service.',
    capabilities: [
      'Launch new license types in <4 days',
      'Test and launch changes in the process without reliance on the tech team',
      'Monitor and drive adoption',
    ],
    screenshot: '/screenshots/admin-configure.png',
  },
  {
    role: 'Ecosystem',
    tagline: 'Third party individuals or systems looking to verify certificates issued from the system.',
    capabilities: [
      'Verify from a public URL at any time',
      'Integrate using APIs',
    ],
    screenshot: null,
    placeholder: true,
  },
]

export const productDifferentiators: ProductDifferentiator[] = [
  {
    title: 'One product, unlimited license types',
    body: 'Trade licenses, building permits, fire NOCs, food licenses, advertisement permissions, mining permits — all running off a single deployment. Add a new license type through configuration, not code.',
  },
  {
    title: 'Service owners configure without IT',
    body: 'A government department can define forms, set fees, configure workflows, and go live independently in under a day. No developers, no tickets, no waiting.',
  },
]

// ── Data Asset ────────────────────────────────────────────────────────────────

export const dataSection = {
  eyebrow: 'Data as a Shared Asset',
  h2: 'Every deployment generates value beyond the license itself.',
  sub: 'Governments and partners retain full access to structured, exportable data — powering compliance, revenue intelligence, and audit readiness.',
}

export const dataFeatures: DataFeature[] = [
  {
    icon: 'BarChart2',
    title: 'Live Dashboards',
    body: 'Real-time visibility into applications filed, processed, revenue collected, and renewal rates — across all license types in one view.',
  },
  {
    icon: 'Download',
    title: 'Exportable Data',
    body: 'Full data export in structured formats on demand. Government owns the data and can integrate it with finance, audit, or GIS systems.',
  },
  {
    icon: 'Shield',
    title: 'Audit Logs & Compliance',
    body: 'Every action is time-stamped and actor-attributed. Immutable audit trails for anti-corruption review and accountability.',
  },
  {
    icon: 'TrendingUp',
    title: 'Analytics for Partners',
    body: 'Aggregate usage data helps you advise governments on renewal campaigns, compliance drives, and revenue recovery. Data becomes your advisory edge.',
    wide: true,
  },
]

// ── Deployment Models ─────────────────────────────────────────────────────────

export const deploymentSection = {
  eyebrow: 'Deployment Models',
  h2: 'Two ways to earn with DIGIT in your market.',
  sub: 'Host and operate the platform yourself — as a SaaS product or as a fully managed service. Both models are built for recurring, scalable revenue.',
}

export const deploymentModels: DeploymentModel[] = [
  {
    name: 'SaaS Platform',
    descriptor: 'You host DIGIT License, Permits and Certificates centrally and onboard multiple governments as tenants. Lower per-government cost, higher margin at scale.',
    borderColor: '#F68521',
    highlight: true,
    badge: 'Highest margin at scale',
    howItWorks: [
      'Single multi-tenant deployment you manage and operate',
      'Each government gets isolated data and configuration',
      'You control pricing, SLAs, and onboarding pace',
      'eGov delivers product updates centrally',
    ],
    revenueStreams: [
      'SaaS licensing margin — recurring subscription revenue per government or department onboarded',
      'Configuration services — each new ministry onboarding is a billable engagement',
      'Training — government staff training per deployment',
      'Plugins & extensions — standardized extensions built once, reused and charged across instances',
    ],
    bestFor: 'Partners targeting 3+ governments in a region or country',
  },
  {
    name: 'Managed Services',
    descriptor: 'You or eGov operate the platform end-to-end for the government. Government pays for outcomes, not infrastructure.',
    borderColor: '#8FA4B4',
    howItWorks: [
      'Full operations: hosting, L1/L2 support, renewals management',
      'Partner acts as the government\'s outsourced digital ops team',
      'Performance-based or fixed-fee contract structures possible',
      'eGov provides product backstop and L3 escalation',
    ],
    revenueStreams: [
      'Support & maintenance — ongoing managed services contract per instance',
      'Infrastructure migration — when governments move to their own infra, you deliver and charge for it',
      'Configuration services — each new license type or ministry added is billable',
      'Training — government staff training per deployment',
    ],
    bestFor: 'Partners targeting outcome-based contracts or donor-funded DPI programme deployments',
  },
]

export const comparisonRows: ComparisonRow[] = [
  {
    label: 'Hosting responsibility',
    saas: 'Partner (central platform)',
    managed: 'Partner or eGov',
  },
  {
    label: 'Revenue model',
    saas: 'Subscription + config margin',
    managed: 'Managed services fee',
  },
  {
    label: 'Time to first revenue',
    saas: '1–3 months per tenant',
    managed: 'Per contract timeline',
  },
  {
    label: 'Data sovereignty',
    saas: 'Isolated tenant, partner-hosted',
    managed: 'Defined in contract',
  },
  {
    label: 'Ideal scale',
    saas: '3+ governments',
    managed: 'Any scale',
  },
]

// ── Scaling Benefits ──────────────────────────────────────────────────────────

export const licenseTypes: LicenseType[] = [
  { name: 'Trade License' },
  { name: 'Building Permit' },
  { name: 'Fire NOC' },
  { name: 'Food License' },
  { name: 'Advertisement Permit' },
  { name: 'Mining Permit' },
  { name: 'Drug License' },
  { name: 'Water Connection' },
  { name: 'Subdivision Permit' },
  { name: 'Demolition Permit' },
]

export const scaleJurisdictions: ScaleJurisdiction[] = [
  { city: 'City A — Capital', licenseTypes: ['Trade License', 'Building Permit', 'Fire NOC'], revenueLevel: 90 },
  { city: 'City B — Secondary city', licenseTypes: ['Trade License', 'Building Permit'], revenueLevel: 60 },
  { city: 'City C — District town', licenseTypes: ['Trade License', 'Food License'], revenueLevel: 40 },
  { city: 'City D — New onboard', licenseTypes: ['Trade License'], revenueLevel: 20 },
]

// ── Proof Points ──────────────────────────────────────────────────────────────

export const impactStats: ImpactStat[] = [
  { value: '730+', label: 'Cities Live', note: 'Across multiple countries and programmes' },
  { value: '9.5M', label: 'Licenses Issued', note: 'Verified digital licenses on the platform' },
  { value: '$900M', label: 'Revenue Collected', note: 'Government revenue processed through DIGIT' },
]

export const caseStudies: CaseStudy[] = [
  {
    name: 'Djibouti',
    borderColor: '#F68521',
    tags: ['Africa', 'Building Permits', 'GIZ-ITU Programme'],
    headline: '15 permits.',
    headlineSub: '2.5 months.',
    body: 'Under a GIZ-ITU digitization programme, Djibouti digitalized 15 permit types — including Standard Building Permits, Subdivision Permits, Demolition Permits, Backfill Permits, and compliance certifications — in just 10 weeks.',
    metrics: [
      { label: 'Permit types digitized', before: '0', after: '15' },
      { label: 'Time to go live', before: '12–18 months (typical)', after: '2.5 months' },
      { label: 'Delivery model', before: 'Central IT team', after: 'Local SI partners' },
    ],
    partnerAngle:
      'Delivered by local SI partners Manelix and Tekdi with eGov technical backstop. This is the partner-led model — you can replicate it in any country.',
  },
  {
    name: 'Greater Chennai Corporation',
    borderColor: '#0E165D',
    tags: ['South Asia', 'Trade License', '10+ Years', '7M Population'],
    headline: '25,000 →',
    headlineSub: '80,000+ licenses.',
    body: 'Greater Chennai Corporation migrated its trade licensing system to DIGIT License, Permits and Certificates and saw a 220% growth in the licensed business base — driven by easier renewal flows, proactive notifications, and digital accessibility.',
    metrics: [
      { label: 'Active licenses', before: '25,000', after: '80,000+' },
      { label: 'Growth', before: 'Manual paper system', after: '220% increase' },
      { label: 'Population served', before: '—', after: '7 million residents' },
    ],
    partnerAngle:
      '220% license base growth is the ROI story that justifies your implementation fee. This is the data you put in your government pitch deck.',
  },
]

// ── Partner Revenue ───────────────────────────────────────────────────────────

export const revenueSection = {
  eyebrow: 'Partner Economics',
  h2: 'Here is how you make money.',
  sub: 'DIGIT License, Permits and Certificates is a commercially structured product designed for partner revenue — from first deployment through multi-country scale.',
}

export const revenueStreams: RevenueStream[] = [
  {
    title: 'Implementation fees',
    description: 'Project-based fees for each government deployment. Typical engagement: 2–6 months of configuration, integration, and go-live support.',
  },
  {
    title: 'Hosting and infrastructure margin',
    description: 'You procure cloud or on-prem infrastructure and charge a hosting fee to the government. The margin between your cost and the fee is yours.',
  },
  {
    title: 'SaaS subscription revenue',
    description: 'In the SaaS model, governments pay monthly or annual subscriptions. You set the pricing and retain the margin after platform costs.',
  },
  {
    title: 'Managed services contracts',
    description: 'Long-term operations contracts covering L1 support, renewals management, and reporting. Predictable recurring revenue per government.',
  },
  {
    title: 'License configuration services',
    description: 'Every time an existing government wants to add a new license type, that is a new delivery engagement — at low cost and high margin.',
  },
]

export const egovSupport: EgovSupport[] = [
  { item: 'Demo environment ready for your sales cycle' },
  { item: 'Configuration playbooks per license type' },
  { item: 'Training and enablement for your delivery team' },
  { item: 'L2 and L3 product support — you own L1' },
  { item: 'Co-marketing and programme introductions' },
  { item: 'Commercial model templates and pricing guidance' },
]

export const revenueCallout =
  'You own the government relationship. eGov never competes with you for the implementation contract.'

// ── Footer ────────────────────────────────────────────────────────────────────

export const footer = {
  brand: 'DIGIT LP&C',
  tagline: 'Government licensing infrastructure by eGov Foundation.',
  links: [
    { label: 'The Product', href: '#product' },
    { label: 'Deployment Models', href: '#deployment' },
    { label: 'Scaling', href: '#scale' },
    { label: 'Proof Points', href: '#proof' },
    { label: 'Partner Economics', href: '#partner' },
    { label: 'Become a Partner', href: '#contact' },
  ],
  contact: 'partnerships@egov.org.in',
  copyright: `© ${new Date().getFullYear()} eGov Foundation. DIGIT is built and maintained by eGov Foundation.`,
  badge: 'Partner-led delivery · 730 governments live',
}
