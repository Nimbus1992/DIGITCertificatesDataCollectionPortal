import { describe, it, expect } from 'vitest';
import { parseChangelog } from '../../sheets/transforms/changelog';

const HEADER = ['Date', 'Change Type', 'Description', 'Section', 'Author'];

describe('parseChangelog', () => {
  it('T-08.01: maps all 5 columns correctly', () => {
    const rows = [HEADER, ['2025-06-01', 'Feature', 'Added OKR section', 'OKRs', 'Alice']];
    const [entry] = parseChangelog(rows);
    expect(entry.date).toBe('2025-06-01');
    expect(entry.changeType).toBe('Feature');
    expect(entry.description).toBe('Added OKR section');
    expect(entry.section).toBe('OKRs');
    expect(entry.author).toBe('Alice');
  });

  it('T-08.02: filters rows with empty date', () => {
    const rows = [HEADER, ['', 'Feature', 'Something', 'OKRs', 'Alice']];
    expect(parseChangelog(rows)).toHaveLength(0);
  });
});
