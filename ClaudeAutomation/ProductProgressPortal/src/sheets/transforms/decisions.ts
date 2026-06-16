import type { Decision } from '../../types';

export function parseDecisions(rows: string[][]): Decision[] {
  return rows.slice(1).filter(r => r[0]).map(r => ({
    decision: r[0] ?? '',
    date: r[1] ?? '',
    owner: r[2] ?? '',
    context: r[3] ?? '',
    tradeoff: r[4] ?? '',
    outcome: r[5] ?? '',
    status: (r[6] as Decision['status']) || 'Open',
  }));
}
