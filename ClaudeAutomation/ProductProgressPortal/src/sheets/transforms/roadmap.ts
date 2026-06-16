import type { RoadmapItem } from '../../types';

export function parseRoadmap(rows: string[][]): RoadmapItem[] {
  return rows.slice(1).filter(r => r[0]).map(r => ({
    item: r[0] ?? '',
    description: r[1] ?? '',
    status: (r[2] as RoadmapItem['status']) || 'Upcoming',
    confidence: (r[3] as RoadmapItem['confidence']) || 'Green',
    dependencies: r[4] ?? '',
    deliveryWindow: r[5] ?? '',
    quarter: r[6] ?? '',
    phase: r[7] ?? '',
  }));
}
