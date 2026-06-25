import { describe, it, expect } from 'vitest';
import { parseArtifacts } from '../../sheets/transforms/artifacts';

const HEADER = ['Title', 'Type', 'Owner', 'Date', 'Status', 'Link', 'Version', 'Reviewed By'];

describe('parseArtifacts', () => {
  it('T-10.01: maps all 8 columns including optional version and reviewedBy', () => {
    const rows = [HEADER, ['PRD v1', 'Document', 'Alice', '2025-01', 'Final', 'https://doc', 'v1.2', 'Bob']];
    const [art] = parseArtifacts(rows);
    expect(art.title).toBe('PRD v1');
    expect(art.type).toBe('Document');
    expect(art.owner).toBe('Alice');
    expect(art.date).toBe('2025-01');
    expect(art.status).toBe('Final');
    expect(art.link).toBe('https://doc');
    expect(art.version).toBe('v1.2');
    expect(art.reviewedBy).toBe('Bob');
  });

  it('T-10.02: optional fields are empty string (not undefined) when row is short', () => {
    const rows = [HEADER, ['PRD v1']]; // only title present
    expect(() => parseArtifacts(rows)).not.toThrow();
    const [art] = parseArtifacts(rows);
    expect(art.version).toBe('');
    expect(art.reviewedBy).toBe('');
  });
});
