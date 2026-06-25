import { describe, it, expect } from 'vitest';
import { migrateData } from '../../store/DataStore';

describe('migrateData — pure migration logic', () => {
  it('T-12.01: merges raw data with DEFAULTS, preserving existing keys', () => {
    const raw = { risks: [{ description: 'Risk A', severity: 'High', probability: 2, impact: 3, owner: '', mitigation: '', eta: '', status: 'Open' }] };
    const result = migrateData(raw);
    // risks should be the provided value
    expect(result.risks).toHaveLength(1);
    expect(result.risks[0].description).toBe('Risk A');
    // execSummary should come from DEFAULTS
    expect(result.execSummary.overallStatus).toBe('Green');
  });

  it('T-12.02: deep-merges execSummary with DEFAULTS.execSummary', () => {
    const raw = { execSummary: { overallStatus: 'Red', biggestWin: 'Shipped v1' } };
    const result = migrateData(raw);
    expect(result.execSummary.overallStatus).toBe('Red');
    expect(result.execSummary.biggestWin).toBe('Shipped v1');
    // New fields added in code versions get default values
    expect(result.execSummary.decisionsNeeded).toEqual([]);
  });

  it('T-12.03: deep-merges sectionVisibility so new keys get defaults', () => {
    const raw = { sectionVisibility: { okrs: false } };
    const result = migrateData(raw);
    expect(result.sectionVisibility.okrs).toBe(false);
    // New key from DEFAULTS is present
    expect(result.sectionVisibility.execSummary).toBe(true);
  });

  it('T-12.04: recalculates variance as forecast − budgeted on every load', () => {
    const raw = {
      budget: [
        { category: 'Tech', workstream: '', month: 'Jan', budgeted: 800, consumed: 0, remaining: 0, forecast: 1000, variance: 0 },
      ],
    };
    const result = migrateData(raw);
    // variance = forecast − budgeted = 1000 − 800 = 200 (overrides the 0 we passed)
    expect(result.budget[0].variance).toBe(200);
  });

  it('T-12.05: replaces old DPI artifact category IDs with 5-thread system', () => {
    const raw = {
      artifactCategories: [
        { id: 'dpi-adoption', name: 'DPI Adoption', subcategories: [], visible: true },
      ],
      artifacts: [
        { title: 'Doc', type: '', owner: '', date: '', status: '', link: '', section: 'DPI Adoption' },
      ],
    };
    const result = migrateData(raw);
    // Old DPI ID → full replacement with 5-thread system
    expect(result.artifactCategories[0].id).toBe('thread-1');
    // Artifact section cleared since old tag no longer valid
    expect(result.artifacts[0].section).toBeUndefined();
  });

  it('T-12.06: renames legacy 5-thread category names to new names', () => {
    const raw = {
      artifactCategories: [
        { id: 'thread-1', name: 'Narrative & Coalitions', subcategories: [], visible: true },
      ],
      artifacts: [
        { title: 'Doc', type: '', owner: '', date: '', status: '', link: '', section: 'Narrative & Coalitions' },
      ],
    };
    const result = migrateData(raw);
    expect(result.artifactCategories[0].name).toBe('Shared Narrative & Coalitions');
    expect(result.artifacts[0].section).toBe('Shared Narrative & Coalitions');
  });

  it('T-12.07: migrates old conversation stages via STAGE_MAP', () => {
    const raw = {
      conversations: [
        { organization: 'Gov', owner: '', objective: '', stage: 'Discovery', latestUpdate: '', nextStep: '' },
        { organization: 'Corp', owner: '', objective: '', stage: 'Pilot', latestUpdate: '', nextStep: '' },
      ],
    };
    const result = migrateData(raw);
    expect(result.conversations[0].stage).toBe('Discover');
    expect(result.conversations[1].stage).toBe('Implement');
  });

  it('T-12.08: migrates milestones — renames stream to keyResult', () => {
    const raw = {
      milestones: [
        { id: '1', title: 'M1', stream: 'KR1', tasks: [], status: 'In Progress', owner: '' },
      ],
    };
    const result = migrateData(raw);
    expect(result.milestones[0].keyResult).toBe('KR1');
    expect((result.milestones[0] as unknown as { stream?: string }).stream).toBeUndefined();
  });

  it('T-12.09: migrates milestones — restructures flat subtasks into nested', () => {
    const raw = {
      milestones: [
        {
          id: '1', title: 'M1', keyResult: 'KR1', status: 'In Progress', owner: '',
          tasks: [
            { id: '1.1', title: 'Parent', status: 'In Progress', subtasks: [] },
            { id: '1.11', title: 'Child A', status: 'Done', subtasks: [] },
            { id: '1.12', title: 'Child B', status: 'Done', subtasks: [] },
          ],
        },
      ],
    };
    const result = migrateData(raw);
    const milestone = result.milestones[0];
    // Only the parent task should be at top level
    expect(milestone.tasks).toHaveLength(1);
    expect(milestone.tasks[0].id).toBe('1.1');
    // Children should be nested under parent
    expect(milestone.tasks[0].subtasks).toHaveLength(2);
    expect(milestone.tasks[0].subtasks![0].id).toBe('1.11');
    expect(milestone.tasks[0].subtasks![1].id).toBe('1.12');
  });

  it('T-12.10: handles completely empty raw object without throwing', () => {
    expect(() => migrateData({})).not.toThrow();
    const result = migrateData({});
    expect(result.execSummary.overallStatus).toBe('Green');
    expect(result.risks).toEqual([]);
  });
});
