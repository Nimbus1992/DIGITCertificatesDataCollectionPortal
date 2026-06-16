import type { Conversation } from '../../types';

export function parseConversations(rows: string[][]): Conversation[] {
  return rows.slice(1).filter(r => r[0]).map(r => ({
    organization: r[0] ?? '',
    owner: r[1] ?? '',
    objective: r[2] ?? '',
    stage: (r[3] as Conversation['stage']) || 'Discovery',
    latestUpdate: r[4] ?? '',
    nextStep: r[5] ?? '',
  }));
}
