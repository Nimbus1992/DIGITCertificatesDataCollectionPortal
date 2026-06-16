import type { ExecSummaryData } from '../../types';

export function parseExecSummary(rows: string[][]): ExecSummaryData {
  const map: Record<string, string> = {};
  rows.slice(1).forEach(r => { if (r[0]) map[r[0].trim()] = r[1] ?? ''; });

  return {
    overallStatus: (map['Overall Status'] as ExecSummaryData['overallStatus']) || 'Green',
    deliveryConfidence: (map['Delivery Confidence'] as ExecSummaryData['deliveryConfidence']) || 'Green',
    budgetConfidence: (map['Budget Confidence'] as ExecSummaryData['budgetConfidence']) || 'Green',
    timelineConfidence: (map['Timeline Confidence'] as ExecSummaryData['timelineConfidence']) || 'Green',
    okrsOnTrack: Number(map['OKRs On Track']) || 0,
    milestonesCompleted: Number(map['Milestones Completed']) || 0,
    budgetUtilized: Number(map['Budget Utilized']) || 0,
    roadmapProgress: Number(map['Roadmap Progress']) || 0,
    successMetricProgress: Number(map['Success Metric Progress']) || 0,
    biggestWin: map['Biggest Win'] || '',
    biggestRisk: map['Biggest Risk'] || '',
    mostImportantUpdate: map['Most Important Update'] || '',
    decisionsNeeded: (map['Decisions Needed'] || '').split('\n').filter(Boolean),
    leadershipSupport: (map['Leadership Support'] || '').split('\n').filter(Boolean),
    escalations: (map['Escalations'] || '').split('\n').filter(Boolean),
  };
}
