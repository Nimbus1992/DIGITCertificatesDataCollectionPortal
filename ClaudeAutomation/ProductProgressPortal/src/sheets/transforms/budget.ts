import type { BudgetRow } from '../../types';

export function parseBudget(rows: string[][]): BudgetRow[] {
  return rows.slice(1).filter(r => r[0]).map(r => ({
    category: r[0] ?? '',
    workstream: r[1] ?? '',
    month: r[2] ?? '',
    budgeted: Number(r[3]) || 0,
    consumed: Number(r[4]) || 0,
    remaining: Number(r[5]) || 0,
    forecast: Number(r[6]) || 0,
    variance: Number(r[7]) || 0,
  }));
}
