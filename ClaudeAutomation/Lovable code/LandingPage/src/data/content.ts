export const nav = {
  productName: 'DIGIT License, Permits & Certificates',
  links: [
    { label: 'How It Works', id: 'speed' },
    { label: 'Control Model', id: 'control' },
    { label: 'Impact', id: 'impact' },
    { label: 'Case Studies', id: 'cases' },
  ],
  cta: { label: 'Get in Touch', href: 'mailto:taherabharmal@egovernments.org' },
}

export const hero = {
  eyebrow: 'DIGIT License, Permits & Certificates',
  headlineLine1: 'Go live in 30 days.',
  headlineLine2: 'Own it forever.',
  subheadline:
    'A hosted, managed platform for governments to digitize licenses, permits, and certificates — fast, without vendor lock-in, with full data ownership.',
  chips: ['730 Cities Live', '9.5M Licenses Issued', '$900M Revenue Collected'],
  primaryCta: { label: 'Get in Touch', href: 'mailto:taherabharmal@egovernments.org' },
  secondaryCta: { label: 'See How It Works', href: '#speed' },
  screenshot: '/screenshots/admin-dashboard.png',
  screenshotAlt: 'DIGIT LPC Admin Console — Configure and Launch Licenses and Permits',
}

export interface Challenge {
  number: string
  title: string
  body: string
}

export const challenges: Challenge[] = [
  {
    number: '01',
    title: 'Too Slow',
    body: 'Most implementations take 12–18 months. By the time you go live, priorities have changed.',
  },
  {
    number: '02',
    title: 'Too Expensive',
    body: 'Customization, infrastructure, and vendor maintenance costs spiral far beyond original budgets.',
  },
  {
    number: '03',
    title: 'No Exit',
    body: 'Proprietary platforms leave governments dependent on a single vendor for upgrades, support, and data.',
  },
]

export interface Phase {
  label: string
  selfDays: number
  hostedDays: number
}

export const phases: Phase[] = [
  { label: 'Inception', selfDays: 5, hostedDays: 3 },
  { label: 'Scope & Setup', selfDays: 15, hostedDays: 5 },
  { label: 'Build & Test', selfDays: 90, hostedDays: 10 },
  { label: 'Communications', selfDays: 10, hostedDays: 10 },
  { label: 'Go Live', selfDays: 10, hostedDays: 2 },
]

export const speedReasons = [
  'No tech team required',
  'Pre-configured environments',
  'Ready-made templates',
  'No infrastructure setup',
  'Managed support included',
]

export interface OwnershipColumn {
  title: string
  subtitle: string
  owner: string
  borderColor: string
  items: string[]
}

export const ownershipColumns: OwnershipColumn[] = [
  {
    title: 'Government Owns & Controls',
    subtitle: 'Your ownership, always.',
    owner: 'Government',
    borderColor: '#273A80',
    items: [
      'Users & Roles',
      'Workflows & Configs',
      'Data — full export anytime',
      'Approvals & Processes',
      'Security & Compliance',
    ],
  },
  {
    title: 'Hosted & Operated by Partner',
    subtitle: 'We handle the infrastructure.',
    owner: 'Hosting Partner',
    borderColor: '#F68521',
    items: ['Infrastructure & Uptime', 'System Monitoring', 'Backup & Recovery'],
  },
  {
    title: 'Built & Maintained by eGov Foundation',
    subtitle: 'Open source foundation.',
    owner: 'eGovernments Foundation',
    borderColor: '#8FA4B4',
    items: ['Source Code & Standards', 'Product Roadmap', 'Docs & Ecosystem'],
  },
]

export interface ScreenshotCard {
  title: string
  caption: string
  src: string
  alt: string
}

export const screenshotCards: ScreenshotCard[] = [
  {
    title: 'Admin Console',
    caption: 'Configure services and go live in minutes',
    src: '/screenshots/admin-dashboard.png',
    alt: 'Admin Console dashboard showing Business License and Building Permits',
  },
  {
    title: 'Citizen Portal',
    caption: 'Citizens apply online from any device',
    src: '/screenshots/citizen-portal.png',
    alt: 'Citizen portal showing Licenses & Permits services on mobile',
  },
  {
    title: 'Officer App',
    caption: 'Officers process, inspect, and approve in one inbox',
    src: '/screenshots/employee-inbox.png',
    alt: 'Employee app showing application detail for processing',
  },
]

export interface Stat {
  number: string
  unit: string
  footnote: string
}

export const impactStats: Stat[] = [
  { number: '730', unit: 'Cities Live', footnote: 'across Africa and South Asia' },
  { number: '9.5M', unit: 'Licenses Issued', footnote: 'trade licenses, permits & certificates' },
  { number: '$900M', unit: 'Revenue Collected', footnote: 'across issuance and renewals' },
]

export const footer = {
  productName: 'DIGIT LPC',
  org: 'by eGovernments Foundation',
  copyright: '© 2025 eGovernments Foundation',
  links: [
    { label: 'How It Works', href: '#speed' },
    { label: 'Control Model', href: '#control' },
    { label: 'Impact', href: '#impact' },
    { label: 'Case Studies', href: '#cases' },
    { label: 'Get in Touch', href: 'mailto:taherabharmal@egovernments.org' },
  ],
  contact: 'taherabharmal@egovernments.org',
  license: 'Open Source · MIT License',
}
