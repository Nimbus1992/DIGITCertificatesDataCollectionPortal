import type { Risk } from '../../types';

export function parseRisks(rows: string[][]): Risk[] {
  return rows.slice(1).filter(r => r[0]).map(r => ({
    description: r[0] ?? '',
    severity: (r[1] as Risk['severity']) || 'Medium',
    probability: Number(r[2]) || 1,
    impact: Number(r[3]) || 1,
    owner: r[4] ?? '',
    mitigation: r[5] ?? '',
    eta: r[6] ?? '',
    status: r[7] ?? '',
  }));
}
