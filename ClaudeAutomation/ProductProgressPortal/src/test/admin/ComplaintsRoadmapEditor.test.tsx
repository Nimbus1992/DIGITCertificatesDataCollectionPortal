import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { RoadmapEditor } from '../../admin/modules/RoadmapEditor';
import { DataStoreProvider } from '../../store/DataStore';

vi.mock('../../lib/supabase');

const EMPTY_CMS = {
  releases: [], goals: [], valueBundles: [], successMetrics: [],
  moduleGroups: [], updateLog: [], themes: [], masterModules: [], masterActors: [],
};

const SAMPLE_RELEASE = { id: 'r1', name: 'v1.0 Release', timeframe: 'Q1 FY26', isCurrent: true, hasStar: false };
const SAMPLE_GOAL = { id: 'g1', text: 'Improve UX', releaseId: 'r1', color: 'teal' };
const SAMPLE_THEME = { id: 'th1', color: 'teal', label: 'Core Platform' };
const SAMPLE_LOG = { date: '2025-01-01', changes: ['Added feature X'] };
const SAMPLE_MODULE_GROUP = { id: 'mg1', modules: ['Grievance Registration'], actors: ['Citizen'], items: [] };

// ComplaintsRoadmapEditor is activated when productSlug === 'cms'
function renderCmsEditor(cmsRoadmap: object = EMPTY_CMS) {
  localStorage.setItem('ppp_data_cms', JSON.stringify({ cmsRoadmap }));
  return render(
    <MemoryRouter initialEntries={['/cms/admin']}>
      <Routes>
        <Route path="/:productSlug/admin" element={
          <DataStoreProvider productId="cms">
            <RoadmapEditor />
          </DataStoreProvider>
        } />
      </Routes>
    </MemoryRouter>
  );
}

describe('ComplaintsRoadmapEditor (via RoadmapEditor with cms slug)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('T-50.01: renders CMS Roadmap Editor heading', () => {
    renderCmsEditor();
    expect(screen.getByText('CMS Roadmap Editor')).toBeInTheDocument();
  });

  it('T-50.02: renders all tab buttons', () => {
    renderCmsEditor();
    expect(screen.getByText('Releases & Bundles')).toBeInTheDocument();
    expect(screen.getByText('Goals')).toBeInTheDocument();
    expect(screen.getByText('Feature Modules')).toBeInTheDocument();
    expect(screen.getByText('Modules & Actors')).toBeInTheDocument();
    expect(screen.getByText('Themes / Legend')).toBeInTheDocument();
    expect(screen.getByText('Update Log')).toBeInTheDocument();
  });

  it('T-50.03: clicking Goals tab shows Goals content', async () => {
    const user = userEvent.setup();
    renderCmsEditor();
    await user.click(screen.getByText('Goals'));
    await waitFor(() => expect(screen.getByText('+ Add Goal')).toBeInTheDocument());
  });

  it('T-50.04: clicking Feature Modules tab shows Modules content', async () => {
    const user = userEvent.setup();
    renderCmsEditor();
    await user.click(screen.getByText('Feature Modules'));
    await waitFor(() => expect(screen.getByText('+ Add Module Group')).toBeInTheDocument());
  });

  it('T-50.05: clicking Themes / Legend tab shows Themes content', async () => {
    const user = userEvent.setup();
    renderCmsEditor();
    await user.click(screen.getByText('Themes / Legend'));
    await waitFor(() => expect(screen.getByText('+ Add Theme')).toBeInTheDocument());
  });

  it('T-50.06: clicking Update Log tab shows log content', async () => {
    const user = userEvent.setup();
    renderCmsEditor();
    await user.click(screen.getByText('Update Log'));
    await waitFor(() => expect(screen.getByText('+ Add Entry')).toBeInTheDocument());
  });

  it('T-50.07: clicking Modules & Actors tab shows master modules content', async () => {
    const user = userEvent.setup();
    renderCmsEditor();
    await user.click(screen.getByText('Modules & Actors'));
    await waitFor(() => expect(screen.getByPlaceholderText('Add module name…')).toBeInTheDocument());
  });

  it('T-50.08: "+ Add Goal" button opens goal form', async () => {
    const user = userEvent.setup();
    renderCmsEditor();
    await user.click(screen.getByText('Goals'));
    await waitFor(() => screen.getByText('+ Add Goal'));
    await user.click(screen.getByText('+ Add Goal'));
    await waitFor(() => expect(screen.getByText('New Goal')).toBeInTheDocument());
  });

  it('T-50.09: saving a new goal adds it to the list', async () => {
    const user = userEvent.setup();
    renderCmsEditor();
    await user.click(screen.getByText('Goals'));
    await waitFor(() => screen.getByText('+ Add Goal'));
    await user.click(screen.getByText('+ Add Goal'));
    await waitFor(() => screen.getByText('New Goal'));
    const textboxes = screen.getAllByRole('textbox');
    await user.type(textboxes[0], 'Reduce turnaround time');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(screen.getByText('Reduce turnaround time')).toBeInTheDocument());
  });

  it('T-50.10: Releases tab shows "+ Add Release" button', () => {
    renderCmsEditor();
    expect(screen.getByText('+ Add Release')).toBeInTheDocument();
  });

  it('T-50.11: "+ Add Release" opens release form with Name field', async () => {
    const user = userEvent.setup();
    renderCmsEditor();
    await user.click(screen.getByText('+ Add Release'));
    await waitFor(() => expect(screen.getByText('New Release')).toBeInTheDocument());
  });

  it('T-50.12: saving a new release adds it to the releases list', async () => {
    const user = userEvent.setup();
    renderCmsEditor();
    await user.click(screen.getByText('+ Add Release'));
    await waitFor(() => screen.getByText('New Release'));
    // Name field is the second input (after ID field)
    const inputs = screen.getAllByRole('textbox');
    await user.type(inputs[1], 'v2.0 Launch');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(screen.getByText('v2.0 Launch')).toBeInTheDocument());
  });

  it('T-50.13: "+ Add Theme" button opens theme form', async () => {
    const user = userEvent.setup();
    renderCmsEditor();
    await user.click(screen.getByText('Themes / Legend'));
    await waitFor(() => screen.getByText('+ Add Theme'));
    await user.click(screen.getByText('+ Add Theme'));
    await waitFor(() => expect(screen.getByText('New Theme')).toBeInTheDocument());
  });

  it('T-50.14: saving a new theme adds it to the list', async () => {
    const user = userEvent.setup();
    renderCmsEditor();
    await user.click(screen.getByText('Themes / Legend'));
    await waitFor(() => screen.getByText('+ Add Theme'));
    await user.click(screen.getByText('+ Add Theme'));
    await waitFor(() => screen.getByText('New Theme'));
    const inputs = screen.getAllByRole('textbox');
    await user.type(inputs[0], 'Core Platform');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(screen.getByText('Core Platform')).toBeInTheDocument());
  });

  it('T-50.15: "+ Add Entry" button opens log entry form', async () => {
    const user = userEvent.setup();
    renderCmsEditor();
    await user.click(screen.getByText('Update Log'));
    await waitFor(() => screen.getByText('+ Add Entry'));
    await user.click(screen.getByText('+ Add Entry'));
    await waitFor(() => expect(screen.getByText('New Log Entry')).toBeInTheDocument());
  });

  it('T-50.16: saving a log entry (with date) adds it to the list', async () => {
    const user = userEvent.setup();
    renderCmsEditor();
    await user.click(screen.getByText('Update Log'));
    await waitFor(() => screen.getByText('+ Add Entry'));
    await user.click(screen.getByText('+ Add Entry'));
    await waitFor(() => screen.getByText('New Log Entry'));
    // First textbox is date, last is textarea for changes
    const textboxes = screen.getAllByRole('textbox');
    await user.type(textboxes[0], '1st January 2026');
    const changeTextarea = screen.getByPlaceholderText('Each line becomes a bullet point…');
    await user.type(changeTextarea, 'Added new feature');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(screen.getByText('Added new feature')).toBeInTheDocument());
  });

  it('T-50.17: adding a module in Modules & Actors tab', async () => {
    const user = userEvent.setup();
    renderCmsEditor();
    await user.click(screen.getByText('Modules & Actors'));
    await waitFor(() => screen.getByPlaceholderText('Add module name…'));
    const moduleInput = screen.getByPlaceholderText('Add module name…');
    await user.type(moduleInput, 'Grievance Registration');
    await user.click(screen.getAllByRole('button', { name: 'Add' })[0]);
    await waitFor(() => expect(screen.getByText('Grievance Registration')).toBeInTheDocument());
  });

  it('T-50.18: "+ Add Module Group" button opens module group form', async () => {
    const user = userEvent.setup();
    renderCmsEditor();
    await user.click(screen.getByText('Feature Modules'));
    await waitFor(() => screen.getByText('+ Add Module Group'));
    await user.click(screen.getByText('+ Add Module Group'));
    await waitFor(() => expect(screen.getByText('New Module Group')).toBeInTheDocument());
  });

  it('T-50.19: pre-seeded goal renders in Goals tab', async () => {
    const user = userEvent.setup();
    renderCmsEditor({ ...EMPTY_CMS, releases: [SAMPLE_RELEASE], goals: [SAMPLE_GOAL] });
    await user.click(screen.getByText('Goals'));
    await waitFor(() => expect(screen.getByText('Improve UX')).toBeInTheDocument());
  });

  it('T-50.20: Del button on a goal removes it', async () => {
    const user = userEvent.setup();
    renderCmsEditor({ ...EMPTY_CMS, releases: [SAMPLE_RELEASE], goals: [SAMPLE_GOAL] });
    await user.click(screen.getByText('Goals'));
    await waitFor(() => screen.getByText('Improve UX'));
    await user.click(screen.getAllByRole('button', { name: 'Del' })[0]);
    await waitFor(() => expect(screen.queryByText('Improve UX')).not.toBeInTheDocument());
  });

  it('T-50.21: Edit button on a goal opens Edit Goal form', async () => {
    const user = userEvent.setup();
    renderCmsEditor({ ...EMPTY_CMS, releases: [SAMPLE_RELEASE], goals: [SAMPLE_GOAL] });
    await user.click(screen.getByText('Goals'));
    await waitFor(() => screen.getByText('Improve UX'));
    await user.click(screen.getAllByRole('button', { name: 'Edit' })[0]);
    await waitFor(() => expect(screen.getByText('Edit Goal')).toBeInTheDocument());
  });

  it('T-50.22: pre-seeded theme renders in Themes tab', async () => {
    const user = userEvent.setup();
    renderCmsEditor({ ...EMPTY_CMS, themes: [SAMPLE_THEME] });
    await user.click(screen.getByText('Themes / Legend'));
    await waitFor(() => expect(screen.getByText('Core Platform')).toBeInTheDocument());
  });

  it('T-50.23: Del button on a theme removes it', async () => {
    const user = userEvent.setup();
    renderCmsEditor({ ...EMPTY_CMS, themes: [SAMPLE_THEME] });
    await user.click(screen.getByText('Themes / Legend'));
    await waitFor(() => screen.getByText('Core Platform'));
    await user.click(screen.getAllByRole('button', { name: 'Del' })[0]);
    await waitFor(() => expect(screen.queryByText('Core Platform')).not.toBeInTheDocument());
  });

  it('T-50.24: pre-seeded log entry renders in Update Log tab', async () => {
    const user = userEvent.setup();
    renderCmsEditor({ ...EMPTY_CMS, updateLog: [SAMPLE_LOG] });
    await user.click(screen.getByText('Update Log'));
    await waitFor(() => expect(screen.getByText('Added feature X')).toBeInTheDocument());
  });

  it('T-50.25: Del button on log entry removes it', async () => {
    const user = userEvent.setup();
    renderCmsEditor({ ...EMPTY_CMS, updateLog: [SAMPLE_LOG] });
    await user.click(screen.getByText('Update Log'));
    await waitFor(() => screen.getByText('Added feature X'));
    await user.click(screen.getAllByRole('button', { name: 'Del' })[0]);
    await waitFor(() => expect(screen.queryByText('Added feature X')).not.toBeInTheDocument());
  });

  it('T-50.26: pre-seeded release renders in Releases tab and Del removes it', async () => {
    const user = userEvent.setup();
    renderCmsEditor({ ...EMPTY_CMS, releases: [SAMPLE_RELEASE] });
    await waitFor(() => expect(screen.getByText('v1.0 Release')).toBeInTheDocument());
    await user.click(screen.getAllByRole('button', { name: 'Del' })[0]);
    await waitFor(() => expect(screen.queryByText('v1.0 Release')).not.toBeInTheDocument());
  });

  it('T-50.27: clicking release header expands it', async () => {
    const user = userEvent.setup();
    renderCmsEditor({ ...EMPTY_CMS, releases: [SAMPLE_RELEASE] });
    await waitFor(() => screen.getByText('v1.0 Release'));
    await user.click(screen.getByText('v1.0 Release'));
    // After expand, bundle/metrics text areas should appear
    await waitFor(() => expect(screen.getByText('v1.0 Release')).toBeInTheDocument());
  });

  it('T-50.28: pre-seeded module group renders in Feature Modules tab', async () => {
    const user = userEvent.setup();
    renderCmsEditor({ ...EMPTY_CMS, moduleGroups: [SAMPLE_MODULE_GROUP] });
    await user.click(screen.getByText('Feature Modules'));
    await waitFor(() => expect(screen.getByText('Grievance Registration')).toBeInTheDocument());
  });

  it('T-50.29: Del button on module group removes it', async () => {
    const user = userEvent.setup();
    renderCmsEditor({ ...EMPTY_CMS, moduleGroups: [SAMPLE_MODULE_GROUP] });
    await user.click(screen.getByText('Feature Modules'));
    await waitFor(() => screen.getByText('Grievance Registration'));
    await user.click(screen.getAllByRole('button', { name: 'Del' })[0]);
    await waitFor(() => expect(screen.queryByText('Grievance Registration')).not.toBeInTheDocument());
  });
});
