import { describe, it, expect } from 'vitest';
import { parseOKRs } from '../../sheets/transforms/okr';

const HEADER = ['Objective', 'KR', 'Target', 'Actual', 'Progress', 'Status', 'Date', 'Owner', 'Delayed', 'Reason', 'Impact', 'Mitigation', 'Recovery'];

describe('parseOKRs', () => {
  it('T-02.01: maps all 13 column positions correctly', () => {
    const rows = [
      HEADER,
      ['Obj1', 'KR1', '100', '75', '75', 'On Track', '2025-06-30', 'Alice', 'n', 'No reason', 'Low', 'None', 'N/A'],
    ];
    const [okr] = parseOKRs(rows);
    expect(okr.objective).toBe('Obj1');
    expect(okr.keyResult).toBe('KR1');
    expect(okr.target).toBe('100');
    expect(okr.actual).toBe('75');
    expect(okr.progress).toBe(75);
    expect(okr.status).toBe('On Track');
    expect(okr.targetDate).toBe('2025-06-30');
    expect(okr.owner).toBe('Alice');
    expect(okr.delayed).toBe(false);
    expect(okr.reason).toBe('No reason');
  });

  it('T-02.02: filters out rows where r[0] is empty', () => {
    const rows = [HEADER, ['', 'KR1', '', '', '', '', '', '', '', '', '', '', '']];
    expect(parseOKRs(rows)).toHaveLength(0);
  });

  it('T-02.03: delayed flag handles case via toLowerCase — "Y" is treated as delayed', () => {
    const rowsLower = [HEADER, ['Obj', 'KR', '', '', '0', '', '', '', 'y', '', '', '', '']];
    const rowsUpper = [HEADER, ['Obj', 'KR', '', '', '0', '', '', '', 'Y', '', '', '', '']];
    const rowsYes   = [HEADER, ['Obj', 'KR', '', '', '0', '', '', '', 'yes', '', '', '', '']];
    const rowsN     = [HEADER, ['Obj', 'KR', '', '', '0', '', '', '', 'n', '', '', '', '']];

    // Code: (r[8] ?? '').toLowerCase() === 'y'
    // toLowerCase() means 'Y' → true (case-insensitive)
    expect(parseOKRs(rowsLower)[0].delayed).toBe(true);
    expect(parseOKRs(rowsUpper)[0].delayed).toBe(true);
    // 'yes' → false (toLowerCase gives 'yes', not 'y')
    expect(parseOKRs(rowsYes)[0].delayed).toBe(false);
    expect(parseOKRs(rowsN)[0].delayed).toBe(false);
  });

  it('T-02.04: coerces progress to number, falls back to 0', () => {
    const valid = [HEADER, ['O', 'K', '', '', '50', '', '', '', '', '', '', '', '']];
    const empty = [HEADER, ['O', 'K', '', '', '', '', '', '', '', '', '', '', '']];
    const text  = [HEADER, ['O', 'K', '', '', 'abc', '', '', '', '', '', '', '', '']];

    expect(parseOKRs(valid)[0].progress).toBe(50);
    expect(parseOKRs(empty)[0].progress).toBe(0);
    expect(parseOKRs(text)[0].progress).toBe(0);
  });

  it('T-02.05: returns empty array for header-only input', () => {
    expect(parseOKRs([HEADER])).toHaveLength(0);
  });
});
