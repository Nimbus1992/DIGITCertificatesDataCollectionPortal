/**
 * Seed success metrics into Supabase from "License and Permit SaaS - Goals, Governance etc.pptx"
 * Slides 6 & 7 — four themes: Adoption, Feature Completeness, Product Impact & Experience,
 * Performance / Security & Cost.
 *
 * Run: node --env-file=.env scripts/seed-metrics.mjs
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const PRODUCT_ID  = 'lnp';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Run with: node --env-file=.env scripts/seed-metrics.mjs');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const metrics = [
  // ── Adoption ────────────────────────────────────────────────────────────────
  {
    name: 'Time to go live with a use case (Template Creation + Configuration + Calculation)',
    theme: 'Adoption',
    category: 'Delivery',
    target: '4 weeks (MVP)',
    actual: '',
    trend: 'Stable',
    period: 'MVP',
  },
  {
    name: 'Avg. # of license/permit types configured per account',
    theme: 'Adoption',
    category: 'Outcome',
    target: 'TBD',
    actual: '',
    trend: 'Stable',
    period: 'MVP',
  },
  {
    name: '# of partner-led implementations (without eGov involvement)',
    theme: 'Adoption',
    category: 'Outcome',
    target: 'All (long-term)',
    actual: '',
    trend: 'Stable',
    period: 'MVP',
  },
  {
    name: 'No. of queries from partner / Avg. time spent by core team per customer onboarded',
    theme: 'Adoption',
    category: 'Delivery',
    target: 'TBD',
    actual: '',
    trend: 'Stable',
    period: 'MVP',
  },

  // ── Feature Completeness ─────────────────────────────────────────────────────
  {
    name: '# of distinct license/permit archetypes supported',
    theme: 'Feature Completeness',
    category: 'Delivery',
    target: '2 — Trade License + 1 TBD (MVP)',
    actual: '',
    trend: 'Stable',
    period: 'MVP',
  },
  {
    name: '% of requirements for a country reached via configuration',
    theme: 'Feature Completeness',
    category: 'Outcome',
    target: '60% across 5 countries (MVP)',
    actual: '',
    trend: 'Stable',
    period: 'MVP',
  },

  // ── Product Impact & Experience ───────────────────────────────────────────────
  {
    name: '% of applications that meet SLA defined',
    theme: 'Product Impact & Experience',
    category: 'Outcome',
    target: 'TBD',
    actual: '',
    trend: 'Stable',
    period: 'MVP',
  },
  {
    name: 'User Satisfaction Score',
    theme: 'Product Impact & Experience',
    category: 'Outcome',
    target: 'TBD',
    actual: '',
    trend: 'Stable',
    period: 'MVP',
  },
  {
    name: '# of L1 Support Tickets raised',
    theme: 'Product Impact & Experience',
    category: 'Delivery',
    target: 'TBD',
    actual: '',
    trend: 'Stable',
    period: 'MVP',
  },
  {
    name: 'Accessibility compliance as per WCAG',
    theme: 'Product Impact & Experience',
    category: 'Outcome',
    target: 'AA (MVP)',
    actual: '',
    trend: 'Stable',
    period: 'MVP',
  },

  // ── Performance, Security & Cost ─────────────────────────────────────────────
  {
    name: '% Uptime',
    theme: 'Performance, Security & Cost',
    category: 'Delivery',
    target: '95% (MVP)',
    actual: '',
    trend: 'Stable',
    period: 'MVP',
  },
  {
    name: 'Infra cost per account',
    theme: 'Performance, Security & Cost',
    category: 'Outcome',
    target: 'TBD',
    actual: '',
    trend: 'Stable',
    period: 'MVP',
  },
  {
    name: 'Support tickets per customer / per month',
    theme: 'Performance, Security & Cost',
    category: 'Delivery',
    target: 'TBD',
    actual: '',
    trend: 'Stable',
    period: 'MVP',
  },
  {
    name: 'Audit success rate',
    theme: 'Performance, Security & Cost',
    category: 'Outcome',
    target: 'TBD',
    actual: '',
    trend: 'Stable',
    period: 'MVP',
  },
];

async function seed() {
  console.log(`Fetching current portal state for "${PRODUCT_ID}"…`);
  const { data: existing, error: fetchErr } = await supabase
    .from('portal_state')
    .select('data')
    .eq('id', PRODUCT_ID)
    .maybeSingle();

  if (fetchErr) { console.error('Fetch failed:', fetchErr.message); process.exit(1); }

  const merged = { ...(existing?.data ?? {}), metrics };

  console.log(`Upserting ${metrics.length} metrics…`);
  const { error: upsertErr } = await supabase
    .from('portal_state')
    .upsert({ id: PRODUCT_ID, data: merged, updated_at: new Date().toISOString() });

  if (upsertErr) { console.error('Upsert failed:', upsertErr.message); process.exit(1); }

  console.log(`✓ Metrics seeded — ${metrics.length} entries`);
  const themes = [...new Set(metrics.map(m => m.theme))];
  for (const t of themes) {
    console.log(`  ${t}: ${metrics.filter(m => m.theme === t).length} metrics`);
  }
}

seed();
