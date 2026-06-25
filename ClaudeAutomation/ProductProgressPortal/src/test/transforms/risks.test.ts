import { describe, it, expect } from 'vitest';
import { parseRisks } from '../../sheets/transforms/risks';

const HEADER = ['Description', 'Severity', 'Probability', 'Impact', 'Owner', 'Mitigation', 'ETA', 'Status'];

describe('parseRisks', () => {
  it('T-04.01: maps all 8 columns in order', () => {
    const rows = [HEADER, ['Data breach', 'High', '3', '4', 'Alice', 'Encrypt all', 'Q3', 'Open']];
    const [risk] = parseRisks(rows);
    expect(risk.description).toBe('Data breach');
    expect(risk.severity).toBe('High');
    expect(risk.probability).toBe(3);
    expect(risk.impact).toBe(4);
    expect(risk.owner).toBe('Alice');
    expect(risk.mitigation).toBe('Encrypt all');
    expect(risk.eta).toBe('Q3');
    expect(risk.status).toBe('Open');
  });

  it('T-04.02: defaults severity to "Medium" when missing', () => {
    const rows = [HEADER, ['Some risk', '', '2', '2', '', '', '', '']];
    expect(parseRisks(rows)[0].severity).toBe('Medium');
  });

  it('T-04.03: Number("0") || 1 promotes probability 0 to 1 (known behavior)', () => {
    // A risk legitimately set to probability 0 is silently promoted to 1
    const rows = [HEADER, ['Risk', 'Low', '0', '0', '', '', '', '']];
    const [risk] = parseRisks(rows);
    expect(risk.probability).toBe(1); // documents the || 1 behavior
    expect(risk.impact).toBe(1);
  });

  it('T-04.04: filters rows with empty description', () => {
    const rows = [HEADER, ['', 'High', '5', '5', '', '', '', '']];
    expect(parseRisks(rows)).toHaveLength(0);
  });
});
