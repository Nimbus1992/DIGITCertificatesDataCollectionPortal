/**
 * Restores full risk objects with category field applied.
 * Run: node --env-file=.env scripts/patch-risk-categories.mjs
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const PRODUCT_ID   = 'lnp';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing env vars.'); process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const risks = [
  {
    description: 'Countries require UI customisation beyond standard theme config — breaks configuration-only MVP model',
    category: 'Adoption',
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
    category: 'Adoption',
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
    category: 'Technical',
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
    category: 'Adoption',
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
    category: 'Timeline',
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
    category: 'Timeline',
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
    category: 'Adoption',
    severity: 'Medium',
    probability: 30,
    impact: 7,
    owner: 'Santhosh',
    mitigation: 'Follow NIST security guidelines; plan voluntary NIST audit and gap remediation; position as roadmap item post-MVP',
    eta: '2026-07-30',
    status: 'Open',
  },
];

async function patch() {
  console.log('Fetching current state…');
  const { data: existing, error: fetchErr } = await supabase
    .from('portal_state').select('data').eq('id', PRODUCT_ID).maybeSingle();
  if (fetchErr) { console.error(fetchErr.message); process.exit(1); }

  const merged = { ...(existing?.data ?? {}), risks };

  console.log('Upserting…');
  const { error: upsertErr } = await supabase
    .from('portal_state')
    .upsert({ id: PRODUCT_ID, data: merged, updated_at: new Date().toISOString() });
  if (upsertErr) { console.error(upsertErr.message); process.exit(1); }

  console.log(`✓ ${risks.length} risks restored with categories:`);
  risks.forEach((r, i) =>
    console.log(`  ${i + 1}. [${r.category}] [${r.severity}] ${r.description.slice(0, 70)}`)
  );
}

patch();
