import type { ChangelogEntry } from '../../types';

export function parseChangelog(rows: string[][]): ChangelogEntry[] {
  return rows.slice(1).filter(r => r[0]).map(r => ({
    date: r[0] ?? '',
    changeType: r[1] ?? '',
    description: r[2] ?? '',
    section: r[3] ?? '',
    author: r[4] ?? '',
  }));
}
