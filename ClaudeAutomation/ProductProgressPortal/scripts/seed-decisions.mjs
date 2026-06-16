/**
 * Seed decision log data into Supabase from the decision log image.
 * Run: node --env-file=.env scripts/seed-decisions.mjs
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Run with: node --env-file=.env scripts/seed-decisions.mjs');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const decisions = [
  // Open
  {
    decision: 'RPC vs HTTP API design',
    date: '',
    owner: '',
    context: '',
    tradeoff: '',
    outcome: '',
    status: 'Open',
  },
  // Closed — oldest first
  {
    decision: 'Offline for all products required — will be handled at a platform level, not specific to LnP',
    date: '2025-06-09',
    owner: 'Chandar, Jojo, Ghanshyam, Tahera',
    context: '',
    tradeoff: '',
    outcome: '',
    status: 'Closed',
  },
  {
    decision: 'eGov Global will host the first instance of SaaS',
    date: '2026-03-17',
    owner: 'Santhosh, Varun, Chandar, Jojo, Tahera, Ghanshyam',
    context: '',
    tradeoff: '',
    outcome: '',
    status: 'Closed',
  },
  {
    decision: 'LPM SaaS to be built on 3.0 (Java)',
    date: '2026-03-17',
    owner: 'Santhosh, Chandar, Jojo, Tahera, Ghanshyam, Manish',
    context: '',
    tradeoff: '',
    outcome: '',
    status: 'Closed',
  },
  {
    decision: 'LPM SaaS focus to be on Africa market',
    date: '2026-04-17',
    owner: 'Santhosh, Chandar, Jojo, Tahera, Ghanshyam',
    context: '',
    tradeoff: '',
    outcome: '',
    status: 'Closed',
  },
  {
    decision: 'Product Decisions: 0 customisations — roadmap will be prioritised to support configurations as use cases emerge. 1st version to support Business License. No migration of legacy/registry data required to go live. Billing between SaaS provider and customer handled outside the system. Each city/country/ULB onboarded as a separate account; no sub-accounts. Multiple use cases can be activated within an account.',
    date: '2026-04-17',
    owner: 'Santhosh, Chandar, Jojo, Tahera, Ghanshyam',
    context: '',
    tradeoff: '',
    outcome: '',
    status: 'Closed',
  },
  {
    decision: 'We will only be self-declaring security compliance — no formal security certifications will be done',
    date: '2026-04-17',
    owner: 'Santhosh, Chandar, Jojo, Tahera, Ghanshyam',
    context: '',
    tradeoff: '',
    outcome: '',
    status: 'Closed',
  },
  {
    decision: 'Es Magico to be onboarded as engineering partner for LPM SaaS',
    date: '2026-05-12',
    owner: 'Santhosh, Varun, Chandar, Jojo, Tahera, Ghanshyam',
    context: '',
    tradeoff: '',
    outcome: '',
    status: 'Closed',
  },
  {
    decision: 'Cost vs Uptime: Partners will be provided with options on what SLA they can offer and contract with customers',
    date: '2026-05-20',
    owner: 'Tahera, Ghanshyam',
    context: '',
    tradeoff: '',
    outcome: '',
    status: 'Closed',
  },
  {
    decision: 'Use existing DIGIT Design system or rebuild new one on Shadcn',
    date: '2026-06-12',
    owner: 'Jojo, Chandar, Andrew, Subhashini, Ghanshyam, Jagan, Tahera',
    context: '',
    tradeoff: '',
    outcome: '',
    status: 'Closed',
  },
];

async function seed() {
  console.log('Fetching current portal state…');
  const { data: existing, error: fetchErr } = await supabase
    .from('portal_state')
    .select('data')
    .eq('id', 'singleton')
    .maybeSingle();

  if (fetchErr) { console.error('Fetch failed:', fetchErr.message); process.exit(1); }

  const merged = { ...(existing?.data ?? {}), decisions };

  console.log(`Upserting ${decisions.length} decisions…`);
  const { error: upsertErr } = await supabase
    .from('portal_state')
    .upsert({ id: 'singleton', data: merged, updated_at: new Date().toISOString() });

  if (upsertErr) { console.error('Upsert failed:', upsertErr.message); process.exit(1); }

  console.log(`✓ Decisions seeded — ${decisions.length} entries`);
  console.log(`  Open   : ${decisions.filter(d => d.status === 'Open').length}`);
  console.log(`  Closed : ${decisions.filter(d => d.status === 'Closed').length}`);
}

seed();
