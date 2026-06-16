import type { ProductOverviewData } from '../../types';

export function parseProductOverview(rows: string[][]): ProductOverviewData {
  const map: Record<string, string> = {};
  rows.slice(1).forEach(r => { if (r[0]) map[r[0].trim()] = r[1] ?? ''; });

  const splitLines = (key: string) =>
    (map[key] || '').split('\n').map(s => s.trim()).filter(Boolean);

  return {
    problem: map['Problem'] || '',
    vision: map['Vision'] || '',
    objectives: splitLines('Objectives'),
    inScope: splitLines('In Scope'),
    outOfScope: splitLines('Out of Scope'),
    targetUsers: splitLines('Target Users'),
    strategicAlignment: splitLines('Strategic Alignment'),
  };
}
