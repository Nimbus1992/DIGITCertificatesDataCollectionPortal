import type { Metric } from '../../types';

export function parseMetrics(rows: string[][]): Metric[] {
  return rows.slice(1).filter(r => r[0]).map(r => ({
    name: r[0] ?? '',
    category: (r[1] as Metric['category']) || 'Delivery',
    target: r[2] ?? '',
    actual: r[3] ?? '',
    trend: (r[4] as Metric['trend']) || 'Stable',
    period: r[5] ?? '',
  }));
}
