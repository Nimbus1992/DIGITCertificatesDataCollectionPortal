import { describe, it, expect } from 'vitest';
import { parseMetrics } from '../../sheets/transforms/metrics';

const HEADER = ['Name', 'Category', 'Target', 'Actual', 'Trend', 'Period'];

describe('parseMetrics', () => {
  it('T-09.01: maps all 6 columns correctly', () => {
    const rows = [HEADER, ['Adoption Rate', 'Growth', '80%', '73%', 'Up', 'Q2 2025']];
    const [m] = parseMetrics(rows);
    expect(m.name).toBe('Adoption Rate');
    expect(m.category).toBe('Growth');
    expect(m.target).toBe('80%');
    expect(m.actual).toBe('73%');
    expect(m.trend).toBe('Up');
    expect(m.period).toBe('Q2 2025');
  });

  it('T-09.02: defaults category to "Delivery" when missing', () => {
    const rows = [HEADER, ['Some Metric', '', '', '', '', '']];
    expect(parseMetrics(rows)[0].category).toBe('Delivery');
  });

  it('T-09.03: defaults trend to "Stable" when missing', () => {
    const rows = [HEADER, ['Some Metric', 'Growth', '', '', '', '']];
    expect(parseMetrics(rows)[0].trend).toBe('Stable');
  });
});
