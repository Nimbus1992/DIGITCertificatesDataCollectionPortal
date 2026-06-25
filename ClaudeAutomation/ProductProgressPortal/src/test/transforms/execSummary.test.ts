import { describe, it, expect } from 'vitest';
import { parseExecSummary } from '../../sheets/transforms/execSummary';

const HEADER = ['Key', 'Value'];

function makeRows(pairs: [string, string][]): string[][] {
  return [HEADER, ...pairs.map(([k, v]) => [k, v])];
}

describe('parseExecSummary', () => {
  it('T-01.01: parses all standard fields from key-value rows', () => {
    const rows = makeRows([
      ['Overall Status', 'Amber'],
      ['Delivery Confidence', 'Red'],
      ['Budget Confidence', 'Green'],
      ['Timeline Confidence', 'Amber'],
      ['OKRs On Track', '3'],
      ['Milestones Completed', '7'],
      ['Budget Utilized', '65'],
      ['Roadmap Progress', '80'],
      ['Success Metric Progress', '50'],
      ['Biggest Win', 'Shipped MVP'],
      ['Biggest Risk', 'Resourcing'],
      ['Most Important Update', 'Go-live confirmed'],
      ['Decisions Needed', 'Approve budget'],
      ['Leadership Support', 'Exec alignment'],
      ['Escalations', 'None'],
    ]);
    const result = parseExecSummary(rows);
    expect(result.overallStatus).toBe('Amber');
    expect(result.deliveryConfidence).toBe('Red');
    expect(result.okrsOnTrack).toBe(3);
    expect(result.milestonesCompleted).toBe(7);
    expect(result.budgetUtilized).toBe(65);
    expect(result.biggestWin).toBe('Shipped MVP');
    expect(result.decisionsNeeded).toEqual(['Approve budget']);
  });

  it('T-01.02: defaults overallStatus to "Green" when row is absent', () => {
    const rows = makeRows([]);
    expect(parseExecSummary(rows).overallStatus).toBe('Green');
  });

  it('T-01.03: defaults numeric fields to 0 when value is empty string', () => {
    const rows = makeRows([['OKRs On Track', '']]);
    expect(parseExecSummary(rows).okrsOnTrack).toBe(0);
  });

  it('T-01.04: splits decisionsNeeded on newlines and filters blanks', () => {
    const rows = makeRows([['Decisions Needed', 'A\n\nB']]);
    expect(parseExecSummary(rows).decisionsNeeded).toEqual(['A', 'B']);
  });

  it('T-01.04b: CRLF line endings leave \\r in split results (known behavior)', () => {
    const rows = makeRows([['Decisions Needed', 'A\r\nB']]);
    // The current implementation splits on \n only, so 'A\r' and 'B' are the results
    // Both are truthy so filter(Boolean) keeps them — 'A\r' has invisible \r
    const result = parseExecSummary(rows).decisionsNeeded;
    expect(result).toHaveLength(2);
    expect(result[0]).toBe('A\r'); // documents the known CRLF bug
  });

  it('T-01.05: ignores header row (row 0)', () => {
    const rows = [['Overall Status', 'Red']]; // no slice(1) should skip this
    // Since slice(1) skips row 0, an array with only a header returns defaults
    expect(parseExecSummary(rows).overallStatus).toBe('Green');
  });

  it('T-01.06: handles completely empty rows array', () => {
    expect(() => parseExecSummary([])).not.toThrow();
    expect(parseExecSummary([]).overallStatus).toBe('Green');
  });

  it('T-01.07: handles rows with missing second column', () => {
    const rows = [HEADER, ['Overall Status']]; // no r[1]
    expect(() => parseExecSummary(rows)).not.toThrow();
    expect(parseExecSummary(rows).overallStatus).toBe('Green'); // empty string → fallback
  });
});
