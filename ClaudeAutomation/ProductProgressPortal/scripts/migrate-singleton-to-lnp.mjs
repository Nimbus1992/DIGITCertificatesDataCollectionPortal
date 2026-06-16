/**
 * One-time migration: copies the existing 'singleton' portal_state row → 'lnp'.
 * Run: node --env-file=.env scripts/migrate-singleton-to-lnp.mjs
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing env vars. Run with: node --env-file=.env scripts/migrate-singleton-to-lnp.mjs');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function migrate() {
  console.log('Fetching singleton row…');
  const { data: singleton, error } = await supabase
    .from('portal_state')
    .select('data')
    .eq('id', 'singleton')
    .maybeSingle();

  if (error) { console.error('Fetch error:', error.message); process.exit(1); }

  if (!singleton?.data) {
    console.log('No singleton row found — nothing to migrate.');
    process.exit(0);
  }

  console.log('Upserting as id=lnp…');
  const { error: upsertErr } = await supabase
    .from('portal_state')
    .upsert({ id: 'lnp', data: singleton.data, updated_at: new Date().toISOString() });

  if (upsertErr) { console.error('Upsert error:', upsertErr.message); process.exit(1); }

  console.log('✓ Migration complete — singleton data is now available as lnp');
}

migrate();
