import type { OKR } from '../../types';

export function parseOKRs(rows: string[][]): OKR[] {
  const data = rows.slice(1);
  return data
    .filter(r => r[0])
    .map(r => ({
      objective: r[0] ?? '',
      keyResult: r[1] ?? '',
      target: r[2] ?? '',
      actual: r[3] ?? '',
      progress: Number(r[4]) || 0,
      status: (r[5] as OKR['status']) || 'On Track',
      targetDate: r[6] ?? '',
      owner: r[7] ?? '',
      delayed: (r[8] ?? '').toLowerCase() === 'y',
      reason: r[9] ?? '',
      impact: r[10] ?? '',
      mitigation: r[11] ?? '',
      recoveryPlan: r[12] ?? '',
    }));
}
