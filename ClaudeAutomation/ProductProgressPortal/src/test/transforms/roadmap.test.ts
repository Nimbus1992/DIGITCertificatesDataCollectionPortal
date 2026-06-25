import { describe, it, expect } from 'vitest';
import { parseRoadmap } from '../../sheets/transforms/roadmap';

const HEADER = ['Item', 'Description', 'Status', 'Confidence', 'Dependencies', 'Delivery Window', 'Quarter', 'Phase'];

describe('parseRoadmap', () => {
  it('T-05.01: maps all 8 columns correctly', () => {
    const rows = [HEADER, ['Feature A', 'Auth flow', 'In Progress', 'Amber', 'Feature B', 'Q2 2025', 'Q2', 'Beta']];
    const [item] = parseRoadmap(rows);
    expect(item.item).toBe('Feature A');
    expect(item.description).toBe('Auth flow');
    expect(item.status).toBe('In Progress');
    expect(item.confidence).toBe('Amber');
    expect(item.dependencies).toBe('Feature B');
    expect(item.deliveryWindow).toBe('Q2 2025');
    expect(item.quarter).toBe('Q2');
    expect(item.phase).toBe('Beta');
  });

  it('T-05.02: defaults status to "Upcoming" when missing', () => {
    const rows = [HEADER, ['Feature', '', '', '', '', '', '', '']];
    expect(parseRoadmap(rows)[0].status).toBe('Upcoming');
  });

  it('T-05.03: defaults confidence to "Green" when missing', () => {
    const rows = [HEADER, ['Feature', '', 'Done', '', '', '', '', '']];
    expect(parseRoadmap(rows)[0].confidence).toBe('Green');
  });
});
