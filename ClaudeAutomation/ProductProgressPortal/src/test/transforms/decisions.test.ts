import { describe, it, expect } from 'vitest';
import { parseDecisions } from '../../sheets/transforms/decisions';

const HEADER = ['Decision', 'Date', 'Owner', 'Context', 'Tradeoff', 'Outcome', 'Status'];

describe('parseDecisions', () => {
  it('T-07.01: maps all 7 columns correctly', () => {
    const rows = [HEADER, ['Use React', '2025-01-01', 'Bob', 'Frontend stack', 'vs Vue', 'Approved', 'Closed']];
    const [d] = parseDecisions(rows);
    expect(d.decision).toBe('Use React');
    expect(d.date).toBe('2025-01-01');
    expect(d.owner).toBe('Bob');
    expect(d.context).toBe('Frontend stack');
    expect(d.tradeoff).toBe('vs Vue');
    expect(d.outcome).toBe('Approved');
    expect(d.status).toBe('Closed');
  });

  it('T-07.02: defaults status to "Open" when missing', () => {
    const rows = [HEADER, ['Decision X', '2025-01-01', '', '', '', '', '']];
    expect(parseDecisions(rows)[0].status).toBe('Open');
  });
});
