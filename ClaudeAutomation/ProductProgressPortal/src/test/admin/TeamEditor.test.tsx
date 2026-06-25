import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { TeamEditor } from '../../admin/modules/TeamEditor';
import { DataStoreProvider } from '../../store/DataStore';

vi.mock('../../lib/supabase');

const SAMPLE_MEMBER = {
  name: 'Alice Smith', role: 'Engineers' as const, engagement: 'Internal' as const,
  photoUrl: '', utilization: 80,
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
            <TeamEditor />
          </DataStoreProvider>
        } />
      </Routes>
    </MemoryRouter>
  );
}

describe('TeamEditor', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('T-35.01: renders empty state when no team members', () => {
    renderEditor();
    expect(screen.getByText('No team members yet')).toBeInTheDocument();
  });

  it('T-35.02: "+ Add Member" button opens modal', async () => {
    const user = userEvent.setup();
    renderEditor();
    await user.click(screen.getByText('+ Add Member'));
    await waitFor(() => expect(screen.getByText('Add Team Member')).toBeInTheDocument());
  });

  it('T-35.03: saving a new member adds them to the list', async () => {
    const user = userEvent.setup();
    renderEditor();
    await user.click(screen.getByText('+ Add Member'));
    await waitFor(() => screen.getByText('Add Team Member'));
    const textboxes = screen.getAllByRole('textbox');
    await user.type(textboxes[0], 'Alice Smith');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(screen.getByText('Alice Smith')).toBeInTheDocument());
  });

  it('T-35.04: pre-seeded team member renders in the table', async () => {
    renderEditor({ team: [SAMPLE_MEMBER] });
    await waitFor(() => expect(screen.getByText('Alice Smith')).toBeInTheDocument());
  });

  it('T-35.05: Delete button removes the team member', async () => {
    const user = userEvent.setup();
    renderEditor({ team: [SAMPLE_MEMBER] });
    await waitFor(() => screen.getByText('Alice Smith'));
    await user.click(screen.getAllByRole('button', { name: 'Delete' })[0]);
    await waitFor(() => expect(screen.queryByText('Alice Smith')).not.toBeInTheDocument());
  });

  it('T-35.06: Edit button opens modal for existing member', async () => {
    const user = userEvent.setup();
    renderEditor({ team: [SAMPLE_MEMBER] });
    await waitFor(() => screen.getByText('Alice Smith'));
    await user.click(screen.getAllByRole('button', { name: 'Edit' })[0]);
    await waitFor(() => expect(screen.getByText('Edit Team Member')).toBeInTheDocument());
  });

  it('T-35.07: role badge renders for pre-seeded member', async () => {
    renderEditor({ team: [SAMPLE_MEMBER] });
    await waitFor(() => expect(screen.getByText('Engineers')).toBeInTheDocument());
  });
});
