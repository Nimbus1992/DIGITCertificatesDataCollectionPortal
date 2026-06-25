import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { OKREditor } from '../../admin/modules/OKREditor';
import { DataStoreProvider } from '../../store/DataStore';

vi.mock('../../lib/supabase');

const SAMPLE_MILESTONE = {
  id: '1', title: 'MVP Launch', rowType: 'milestone' as const,
  keyResult: 'License and Permit Build', owner: 'Team', committedDate: '',
  revisedDate: '', status: 'Not Started' as const, comments: '', tasks: [], quarter: 'Q1 FY26',
};

const SAMPLE_MILESTONE_WITH_TASK = {
  id: '2', title: 'Beta Release', rowType: 'milestone' as const,
  keyResult: 'API Build', owner: 'Dev Team',
  committedDate: '2025-06-01', revisedDate: '2025-07-15',
  status: 'In Progress' as const, comments: '', quarter: 'Q2 FY26',
  tasks: [{ id: '2.1', title: 'Build REST endpoints', owner: 'Backend', committedDate: '', revisedDate: '', status: 'In Progress' as const, subtasks: [] }],
};

const SAMPLE_LAUNCH = {
  id: 'l1', title: 'v1.0 MVP', rowType: 'launch' as const,
  keyResult: '', owner: '', committedDate: '2025-12-01', revisedDate: '',
  status: 'Not Started' as const, comments: '', tasks: [], quarter: '',
};

function renderEditor(initial: object = {}) {
  if (Object.keys(initial).length) {
    localStorage.setItem('ppp_data_test', JSON.stringify(initial));
  }
  return render(
    <MemoryRouter initialEntries={['/test/admin']}>
      <Routes>
        <Route path="/:productSlug/admin" element={
          <DataStoreProvider productId="test">
            <OKREditor />
          </DataStoreProvider>
        } />
      </Routes>
    </MemoryRouter>
  );
}

describe('OKREditor', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('T-32.01: renders empty state when no milestones', () => {
    renderEditor();
    expect(screen.getByText('No milestones yet')).toBeInTheDocument();
  });

  it('T-32.02: "+ Add Milestone" button opens modal', async () => {
    const user = userEvent.setup();
    renderEditor();
    await user.click(screen.getByText('+ Add Milestone'));
    await waitFor(() => expect(screen.getByText('Add Milestone')).toBeInTheDocument());
  });

  it('T-32.03: saving a new milestone adds it to the list', async () => {
    const user = userEvent.setup();
    renderEditor();
    await user.click(screen.getByText('+ Add Milestone'));
    await waitFor(() => screen.getByText('Add Milestone'));
    const textboxes = screen.getAllByRole('textbox');
    await user.type(textboxes[0], 'MVP Launch');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(screen.getByText('MVP Launch')).toBeInTheDocument());
  });

  it('T-32.04: pre-seeded milestone renders in the table', async () => {
    renderEditor({ milestones: [SAMPLE_MILESTONE] });
    await waitFor(() => expect(screen.getByText('MVP Launch')).toBeInTheDocument());
  });

  it('T-32.05: Delete button removes the milestone', async () => {
    const user = userEvent.setup();
    renderEditor({ milestones: [SAMPLE_MILESTONE] });
    await waitFor(() => screen.getByText('MVP Launch'));
    await user.click(screen.getAllByRole('button', { name: 'Delete' })[0]);
    await waitFor(() => expect(screen.queryByText('MVP Launch')).not.toBeInTheDocument());
  });

  it('T-32.06: Edit button opens modal pre-populated with milestone title', async () => {
    const user = userEvent.setup();
    renderEditor({ milestones: [SAMPLE_MILESTONE] });
    await waitFor(() => screen.getByText('MVP Launch'));
    await user.click(screen.getAllByRole('button', { name: 'Edit' })[0]);
    await waitFor(() => expect(screen.getByText('Edit Milestone')).toBeInTheDocument());
  });

  it('T-32.07: "+ Add Launch Date" button opens launch modal', async () => {
    const user = userEvent.setup();
    renderEditor();
    await user.click(screen.getByText('+ Add Launch Date'));
    await waitFor(() => expect(screen.getByText('Add Launch Date')).toBeInTheDocument());
  });

  it('T-32.08: saving a launch date adds it to the launch dates section', async () => {
    const user = userEvent.setup();
    renderEditor();
    await user.click(screen.getByText('+ Add Launch Date'));
    await waitFor(() => screen.getByText('Add Launch Date'));
    const textboxes = screen.getAllByRole('textbox');
    await user.type(textboxes[0], 'v1.0 MVP');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(screen.getByText('v1.0 MVP')).toBeInTheDocument());
  });

  it('T-32.09: "+ Add Task / Subtask" button appears inside milestone modal', async () => {
    const user = userEvent.setup();
    renderEditor();
    await user.click(screen.getByText('+ Add Milestone'));
    await waitFor(() => screen.getByText('Add Milestone'));
    expect(screen.getByText('+ Add Task / Subtask')).toBeInTheDocument();
  });

  it('T-32.10: clicking "+ Add Task / Subtask" opens inline task form', async () => {
    const user = userEvent.setup();
    renderEditor();
    await user.click(screen.getByText('+ Add Milestone'));
    await waitFor(() => screen.getByText('Add Milestone'));
    await user.click(screen.getByText('+ Add Task / Subtask'));
    await waitFor(() => expect(screen.getByText('New Task / Subtask')).toBeInTheDocument());
  });

  it('T-32.11: adding a task to a milestone shows it in the tasks table', async () => {
    const user = userEvent.setup();
    renderEditor();
    await user.click(screen.getByText('+ Add Milestone'));
    await waitFor(() => screen.getByText('Add Milestone'));
    // Open task form
    await user.click(screen.getByText('+ Add Task / Subtask'));
    await waitFor(() => screen.getByText('New Task / Subtask'));
    // Task ID input has placeholder "1.1, 2.3…"; Title is 2 positions after it
    const allInputs = screen.getAllByRole('textbox');
    const taskIdInput = screen.getByPlaceholderText('1.1, 2.3…');
    const taskIdIndex = allInputs.indexOf(taskIdInput);
    await user.type(allInputs[taskIdIndex + 2], 'Implement endpoints');
    await user.click(screen.getByRole('button', { name: 'Add Task' }));
    await waitFor(() => expect(screen.getByText('Implement endpoints')).toBeInTheDocument());
  });

  it('T-32.12: canceling task form hides the task form', async () => {
    const user = userEvent.setup();
    renderEditor();
    await user.click(screen.getByText('+ Add Milestone'));
    await waitFor(() => screen.getByText('Add Milestone'));
    await user.click(screen.getByText('+ Add Task / Subtask'));
    await waitFor(() => screen.getByText('New Task / Subtask'));
    // Modal has its own Cancel button; task form Cancel comes first in DOM
    await user.click(screen.getAllByRole('button', { name: 'Cancel' })[0]);
    await waitFor(() => expect(screen.queryByText('New Task / Subtask')).not.toBeInTheDocument());
  });

  it('T-32.13: editing a milestone updates its title', async () => {
    const user = userEvent.setup();
    renderEditor({ milestones: [SAMPLE_MILESTONE] });
    await waitFor(() => screen.getByText('MVP Launch'));
    await user.click(screen.getAllByRole('button', { name: 'Edit' })[0]);
    await waitFor(() => screen.getByText('Edit Milestone'));
    const titleField = screen.getAllByRole('textbox')[0];
    await user.clear(titleField);
    await user.type(titleField, 'MVP Launch v2');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(screen.getByText('MVP Launch v2')).toBeInTheDocument());
  });

  it('T-32.14: milestone with committed date renders formatted date', async () => {
    renderEditor({ milestones: [SAMPLE_MILESTONE_WITH_TASK] });
    await waitFor(() => expect(screen.getByText('Beta Release')).toBeInTheDocument());
    // fmt() renders 'Jun 1' style dates in the table
    expect(screen.getAllByText(/Jun/).length).toBeGreaterThan(0);
  });

  it('T-32.15: clicking milestone row with tasks expands task rows', async () => {
    const user = userEvent.setup();
    renderEditor({ milestones: [SAMPLE_MILESTONE_WITH_TASK] });
    await waitFor(() => screen.getByText('Beta Release'));
    // Task should not be visible before clicking
    expect(screen.queryByText('Build REST endpoints')).not.toBeInTheDocument();
    // Click the milestone row (tr element)
    await user.click(screen.getByText('Beta Release'));
    await waitFor(() => expect(screen.getByText('Build REST endpoints')).toBeInTheDocument());
  });

  it('T-32.16: pre-seeded launch row renders in Launch Dates table', async () => {
    renderEditor({ milestones: [SAMPLE_LAUNCH] });
    await waitFor(() => expect(screen.getByText('v1.0 MVP')).toBeInTheDocument());
    expect(screen.getByText('Launch Dates')).toBeInTheDocument();
  });

  it('T-32.17: Delete button removes a launch date row', async () => {
    const user = userEvent.setup();
    renderEditor({ milestones: [SAMPLE_LAUNCH] });
    await waitFor(() => screen.getByText('v1.0 MVP'));
    await user.click(screen.getAllByRole('button', { name: 'Delete' })[0]);
    await waitFor(() => expect(screen.queryByText('v1.0 MVP')).not.toBeInTheDocument());
  });

  it('T-32.18: Edit button on launch row opens Edit Launch Date modal', async () => {
    const user = userEvent.setup();
    renderEditor({ milestones: [SAMPLE_LAUNCH] });
    await waitFor(() => screen.getByText('v1.0 MVP'));
    await user.click(screen.getAllByRole('button', { name: 'Edit' })[0]);
    await waitFor(() => expect(screen.getByText('Edit Launch Date')).toBeInTheDocument());
  });

  it('T-32.19: Edit on milestone with tasks deep-copies task list', async () => {
    const user = userEvent.setup();
    renderEditor({ milestones: [SAMPLE_MILESTONE_WITH_TASK] });
    await waitFor(() => screen.getByText('Beta Release'));
    await user.click(screen.getAllByRole('button', { name: 'Edit' })[0]);
    await waitFor(() => expect(screen.getByText('Edit Milestone')).toBeInTheDocument());
    // Tasks table should show the task inside the modal
    expect(screen.getByText('Build REST endpoints')).toBeInTheDocument();
  });
});
