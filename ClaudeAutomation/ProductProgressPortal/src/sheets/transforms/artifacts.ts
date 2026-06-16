import type { Artifact } from '../../types';

export function parseArtifacts(rows: string[][]): Artifact[] {
  return rows.slice(1).filter(r => r[0]).map(r => ({
    title: r[0] ?? '',
    type: r[1] ?? '',
    owner: r[2] ?? '',
    date: r[3] ?? '',
    status: r[4] ?? '',
    link:       r[5] ?? '',
    version:    r[6] ?? '',
    reviewedBy: r[7] ?? '',
  }));
}
