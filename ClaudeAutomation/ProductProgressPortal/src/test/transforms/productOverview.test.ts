import { describe, it, expect } from 'vitest';
import { parseProductOverview } from '../../sheets/transforms/productOverview';

const HEADER = ['Key', 'Value'];

function makeRows(pairs: [string, string][]): string[][] {
  return [HEADER, ...pairs.map(([k, v]) => [k, v])];
}

describe('parseProductOverview', () => {
  it('T-11.01: parses problem and vision from key-value rows', () => {
    const rows = makeRows([
      ['Problem', 'Citizens lack access'],
      ['Vision', 'Seamless digital services'],
    ]);
    const result = parseProductOverview(rows);
    expect(result.problem).toBe('Citizens lack access');
    expect(result.vision).toBe('Seamless digital services');
  });

  it('T-11.02: splits objectives on newlines and trims whitespace', () => {
    const rows = makeRows([['Objectives', ' A \n B ']]);
    expect(parseProductOverview(rows).objectives).toEqual(['A', 'B']);
  });

  it('T-11.03: returns empty arrays for missing list fields', () => {
    const rows = makeRows([]);
    const result = parseProductOverview(rows);
    expect(result.objectives).toEqual([]);
    expect(result.inScope).toEqual([]);
    expect(result.targetUsers).toEqual([]);
  });

  it('T-11.04: ignores header row', () => {
    // Only the header row — no data
    const rows = [HEADER];
    expect(() => parseProductOverview(rows)).not.toThrow();
    expect(parseProductOverview(rows).problem).toBe('');
  });
});
