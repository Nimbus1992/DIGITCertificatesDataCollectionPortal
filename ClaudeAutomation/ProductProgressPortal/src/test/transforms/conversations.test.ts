import { describe, it, expect } from 'vitest';
import { parseConversations } from '../../sheets/transforms/conversations';

const HEADER = ['Organization', 'Owner', 'Objective', 'Stage', 'Latest Update', 'Next Step'];

describe('parseConversations', () => {
  it('T-06.01: maps all 6 columns correctly', () => {
    const rows = [HEADER, ['GovCorp', 'Alice', 'Pilot DPI', 'Sign Up', 'Meeting done', 'Send proposal']];
    const [conv] = parseConversations(rows);
    expect(conv.organization).toBe('GovCorp');
    expect(conv.owner).toBe('Alice');
    expect(conv.objective).toBe('Pilot DPI');
    expect(conv.stage).toBe('Sign Up');
    expect(conv.latestUpdate).toBe('Meeting done');
    expect(conv.nextStep).toBe('Send proposal');
  });

  it('T-06.02: defaults stage to "Discover" when missing', () => {
    const rows = [HEADER, ['GovCorp', '', '', '', '', '']];
    expect(parseConversations(rows)[0].stage).toBe('Discover');
  });
});
