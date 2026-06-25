import { describe, it, expect } from 'vitest';
import { parseBudget } from '../../sheets/transforms/budget';

const HEADER = ['Category', 'Workstream', 'Month', 'Budgeted', 'Consumed', 'Remaining', 'Forecast', 'Variance'];

describe('parseBudget', () => {
  it('T-03.01: maps all 8 columns correctly', () => {
    const rows = [HEADER, ['Tech', 'Dev', 'Jan', '1000', '800', '200', '950', '50']];
    const [row] = parseBudget(rows);
    expect(row.category).toBe('Tech');
    expect(row.workstream).toBe('Dev');
    expect(row.month).toBe('Jan');
    expect(row.budgeted).toBe(1000);
    expect(row.consumed).toBe(800);
    expect(row.remaining).toBe(200);
    expect(row.forecast).toBe(950);
    expect(row.variance).toBe(50);
  });

  it('T-03.02: coerces all numeric columns to numbers', () => {
    const rows = [HEADER, ['Tech', '', '', '5000', '3000', '2000', '4800', '-200']];
    const [row] = parseBudget(rows);
    expect(typeof row.budgeted).toBe('number');
    expect(typeof row.consumed).toBe('number');
    expect(row.variance).toBe(-200);
  });

  it('T-03.03: returns 0 not NaN for non-numeric cells', () => {
    const rows = [HEADER, ['Tech', '', '', 'abc', '', '', '', '']];
    const [row] = parseBudget(rows);
    expect(row.budgeted).toBe(0);
    expect(isNaN(row.budgeted)).toBe(false);
  });

  it('T-03.04: filters rows with empty category (r[0] falsy)', () => {
    const rows = [HEADER, ['', 'Sub', 'Jan', '100', '50', '50', '90', '-10']];
    expect(parseBudget(rows)).toHaveLength(0);
  });
});
