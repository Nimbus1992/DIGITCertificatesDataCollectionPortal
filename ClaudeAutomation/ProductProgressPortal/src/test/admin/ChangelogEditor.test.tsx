import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ChangelogEditor } from '../../admin/modules/ChangelogEditor';
import { DataStoreProvider } from '../../store/DataStore';

vi.mock('../../lib/supabase');

const SAMPLE_ENTRY = {
  date: '2025-06-01', changeType: 'Milestone', description: 'Initial release shipped',
  section: 'Launch', author: 'Admin',
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
            <ChangelogEditor />
          </DataStoreProvider>
        } />
      </Routes>
    </MemoryRouter>
  );
}

describe('ChangelogEditor', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('T-36.01: renders empty state when no changelog entries', () => {
    renderEditor();
    expect(screen.getByText('No changelog entries yet')).toBeInTheDocument();
  });

  it('T-36.02: "+ Log Change" button opens modal', async () => {
    const user = userEvent.setup();
    renderEditor();
    await user.click(screen.getByText('+ Log Change'));
    await waitFor(() => expect(screen.getByText('Log Change')).toBeInTheDocument());
  });

  it('T-36.03: saving a new entry adds it to the list', async () => {
    const user = userEvent.setup();
    renderEditor();
    await user.click(screen.getByText('+ Log Change'));
    await waitFor(() => screen.getByText('Log Change'));
    // Date field (input[type=date]) has no textbox role; textboxes are:
    // [0]=Section, [1]=Author, [2]=Description (textarea)
    const textboxes = screen.getAllByRole('textbox');
    const descriptionField = textboxes[textboxes.length - 1];
    await user.type(descriptionField, 'Initial release shipped');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(screen.getByText('Initial release shipped')).toBeInTheDocument());
  });

  it('T-36.04: pre-seeded entry renders description in the list', async () => {
    renderEditor({ changelog: [SAMPLE_ENTRY] });
    await waitFor(() => expect(screen.getByText('Initial release shipped')).toBeInTheDocument());
  });

  it('T-36.05: Delete button removes the changelog entry', async () => {
    const user = userEvent.setup();
    renderEditor({ changelog: [SAMPLE_ENTRY] });
    await waitFor(() => screen.getByText('Initial release shipped'));
    await user.click(screen.getAllByRole('button', { name: 'Delete' })[0]);
    await waitFor(() => expect(screen.queryByText('Initial release shipped')).not.toBeInTheDocument());
  });

  it('T-36.06: Edit button opens modal for existing entry', async () => {
    const user = userEvent.setup();
    renderEditor({ changelog: [SAMPLE_ENTRY] });
    await waitFor(() => screen.getByText('Initial release shipped'));
    await user.click(screen.getAllByRole('button', { name: 'Edit' })[0]);
    await waitFor(() => expect(screen.getByText('Edit Entry')).toBeInTheDocument());
  });

  it('T-36.07: change type badge renders for pre-seeded entry', async () => {
    renderEditor({ changelog: [SAMPLE_ENTRY] });
    await waitFor(() => expect(screen.getByText('Milestone')).toBeInTheDocument());
  });
});
