/**
 * Seed budget data into Supabase from the attached budget image.
 * Correct structure: category = major theme, workstream = specific line item.
 *
 * Run: node --env-file=.env scripts/seed-phase1-budget.mjs
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Run with: node --env-file=.env scripts/seed-phase1-budget.mjs');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function r(category, workstream, month, budgeted, consumed, forecast, variance = 0) {
  const remaining = budgeted - consumed;
  return { category, workstream, month, budgeted, consumed, remaining, forecast, variance };
}

const CAT_LNP = 'Design & Build — L&P SaaS';
const CAT_PLG = 'Design & Build — PLG Lifecycle';
const CAT_LAUNCH = 'Launch';

const budgetRows = [
  // ── Design & Build — L&P SaaS ─────────────────────────────────────────────

  // Build — Engineering Partner (phase summary rows, month="—" = no specific month)
  r(CAT_LNP, 'Build — Engineering Partner', '—',        4290000, 1917000, 2356200),
  r(CAT_LNP, 'Build — Engineering Partner', '—',              0,       0,  642600),

  // POD — Internal Resources
  r(CAT_LNP, 'POD — Internal Resources',   'May 2026',  600000,  300000,  300000),
  r(CAT_LNP, 'POD — Internal Resources',   'Jun 2026',  600000,       0,  600000),
  r(CAT_LNP, 'POD — Internal Resources',   'Jul 2026',  600000,       0,  600000),
  r(CAT_LNP, 'POD — Internal Resources',   'Aug 2026',       0,       0,  600000),

  // Infra — Development Environment
  r(CAT_LNP, 'Infra — Development Environment', 'May 2026',  65000, 0,      0),
  r(CAT_LNP, 'Infra — Development Environment', 'Jun 2026',  65000, 0,  32500),
  r(CAT_LNP, 'Infra — Development Environment', 'Jul 2026',  65000, 0,  65000),
  r(CAT_LNP, 'Infra — Development Environment', 'Aug 2026',      0, 0,  65000),
  r(CAT_LNP, 'Infra — Development Environment', 'Sep 2026',      0, 0,  65000),

  // Infra — QA Environment
  r(CAT_LNP, 'Infra — QA Environment', 'Jul 2025',  65000, 0,  65000),
  r(CAT_LNP, 'Infra — QA Environment', 'May 2026',  65000, 0,      0),
  r(CAT_LNP, 'Infra — QA Environment', 'Jun 2026',  65000, 0,      0),
  r(CAT_LNP, 'Infra — QA Environment', 'Aug 2026',      0, 0,  65000),
  r(CAT_LNP, 'Infra — QA Environment', 'Sep 2026',      0, 0,  65000),

  // Infra — UAT / Sandbox
  r(CAT_LNP, 'Infra — UAT / Sandbox', 'Jul 2026',  100000, 0,       0),
  r(CAT_LNP, 'Infra — UAT / Sandbox', 'Aug 2026',       0, 0,  100000),
  r(CAT_LNP, 'Infra — UAT / Sandbox', 'Sep 2026',       0, 0,  100000),

  // Tools — Telemetry
  r(CAT_LNP, 'Tools — Telemetry', 'Jul 2025',  2000, 0,  2000),
  r(CAT_LNP, 'Tools — Telemetry', 'Sep 2025',     0, 0,  2000),

  // ── Design & Build — PLG Lifecycle ────────────────────────────────────────
  r(CAT_PLG, 'Marketing — Video(s)', 'Jun 2025',  200000, 0,       0),
  r(CAT_PLG, 'Marketing — Video(s)', 'Jul 2026',       0, 0,  200000),

  // ── Launch ────────────────────────────────────────────────────────────────
  r(CAT_LAUNCH, 'Virtual Launch Event', 'Jun 2026',  300000, 0,       0),
  r(CAT_LAUNCH, 'Virtual Launch Event', 'Aug 2026',       0, 0,  300000),
];

async function seed() {
  console.log(`Fetching current portal state…`);
  const { data: existing, error: fetchErr } = await supabase
    .from('portal_state')
    .select('data')
    .eq('id', 'singleton')
    .maybeSingle();

  if (fetchErr) { console.error('Fetch failed:', fetchErr.message); process.exit(1); }

  const merged = { ...(existing?.data ?? {}), budget: budgetRows };

  console.log(`Upserting ${budgetRows.length} budget rows…`);
  const { error: upsertErr } = await supabase
    .from('portal_state')
    .upsert({ id: 'singleton', data: merged, updated_at: new Date().toISOString() });

  if (upsertErr) { console.error('Upsert failed:', upsertErr.message); process.exit(1); }

  const totalBudgeted = budgetRows.reduce((s, r) => s + r.budgeted, 0);
  const totalForecast = budgetRows.reduce((s, r) => s + r.forecast, 0);
  console.log(`✓ Budget seeded — ${budgetRows.length} rows`);
  console.log(`  Total budgeted : ₹${totalBudgeted.toLocaleString('en-IN')}`);
  console.log(`  Total forecast : ₹${totalForecast.toLocaleString('en-IN')}`);
}

seed();
