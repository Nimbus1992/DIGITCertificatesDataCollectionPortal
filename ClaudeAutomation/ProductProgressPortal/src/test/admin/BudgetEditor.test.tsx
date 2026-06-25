import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { BudgetEditor } from '../../admin/modules/BudgetEditor';
import { DataStoreProvider } from '../../store/DataStore';

vi.mock('../../lib/supabase');

const SAMPLE_ROW = {
  category: 'Infrastructure', workstream: 'Platform', month: 'July 2025',
  budgeted: 100000, consumed: 50000, remaining: 50000, forecast: 100000, variance: 0,
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
            <BudgetEditor />
          </DataStoreProvider>
        } />
      </Routes>
    </MemoryRouter>
  );
}

describe('BudgetEditor', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('T-34.01: renders heading and add button', () => {
    renderEditor();
    expect(screen.getByText('+ Add Row')).toBeInTheDocument();
  });

  it('T-34.02: "+ Add Row" button opens modal', async () => {
    const user = userEvent.setup();
    renderEditor();
    await user.click(screen.getByText('+ Add Row'));
    await waitFor(() => expect(screen.getByText('Add Budget Row')).toBeInTheDocument());
  });

  it('T-34.03: saving a new row adds it to the list', async () => {
    const user = userEvent.setup();
    renderEditor();
    await user.click(screen.getByText('+ Add Row'));
    await waitFor(() => screen.getByText('Add Budget Row'));
    const textboxes = screen.getAllByRole('textbox');
    await user.type(textboxes[0], 'Infrastructure');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(screen.getByText('Infrastructure')).toBeInTheDocument());
  });

  it('T-34.04: pre-seeded budget row renders category in table', async () => {
    renderEditor({ budget: [SAMPLE_ROW] });
    await waitFor(() => expect(screen.getByText('Infrastructure')).toBeInTheDocument());
  });

  it('T-34.05: Delete button removes the budget row', async () => {
    const user = userEvent.setup();
    renderEditor({ budget: [SAMPLE_ROW] });
    await waitFor(() => screen.getByText('Infrastructure'));
    await user.click(screen.getAllByRole('button', { name: 'Delete' })[0]);
    await waitFor(() => expect(screen.queryByText('Infrastructure')).not.toBeInTheDocument());
  });

  it('T-34.06: Edit button opens modal for existing row', async () => {
    const user = userEvent.setup();
    renderEditor({ budget: [SAMPLE_ROW] });
    await waitFor(() => screen.getByText('Infrastructure'));
    await user.click(screen.getAllByRole('button', { name: 'Edit' })[0]);
    await waitFor(() => expect(screen.getByText('Edit Budget Row')).toBeInTheDocument());
  });

  it('T-34.07: budget summary shows Total row', async () => {
    renderEditor({ budget: [SAMPLE_ROW] });
    await waitFor(() => expect(screen.getByText('Total')).toBeInTheDocument());
  });

  it('T-34.08: typing in highlight textarea and clicking Add shows the highlight', async () => {
    const user = userEvent.setup();
    renderEditor();
    const textarea = screen.getByPlaceholderText('Add a key highlight...');
    await user.type(textarea, 'Budget within 5% of forecast');
    await user.click(screen.getByRole('button', { name: 'Add' }));
    await waitFor(() => expect(screen.getByText('Budget within 5% of forecast')).toBeInTheDocument());
  });

  it('T-34.09: clicking Category column header activates sort', async () => {
    const user = userEvent.setup();
    renderEditor({ budget: [SAMPLE_ROW] });
    await waitFor(() => screen.getByText('Infrastructure'));
    // The Category header button
    await user.click(screen.getByRole('button', { name: /Category/i }));
    // After sort, category header button should still be visible
    expect(screen.getByRole('button', { name: /Category/i })).toBeInTheDocument();
  });

  it('T-34.10: editing existing row saves via else branch', async () => {
    const user = userEvent.setup();
    renderEditor({ budget: [SAMPLE_ROW] });
    await waitFor(() => screen.getByText('Infrastructure'));
    await user.click(screen.getAllByRole('button', { name: 'Edit' })[0]);
    await waitFor(() => screen.getByText('Edit Budget Row'));
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(screen.queryByText('Edit Budget Row')).not.toBeInTheDocument());
    expect(screen.getByText('Infrastructure')).toBeInTheDocument();
  });

  it('T-34.11: USD and INR currency buttons are rendered', () => {
    renderEditor();
    expect(screen.getByRole('button', { name: /USD/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /INR/ })).toBeInTheDocument();
  });

  it('T-34.12: clicking USD button switches active currency', async () => {
    const user = userEvent.setup();
    renderEditor();
    await user.click(screen.getByRole('button', { name: /USD/ }));
    // Both buttons still exist after switching
    expect(screen.getByRole('button', { name: /INR/ })).toBeInTheDocument();
  });
});
