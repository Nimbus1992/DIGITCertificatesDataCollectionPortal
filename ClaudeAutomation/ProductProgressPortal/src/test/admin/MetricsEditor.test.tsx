import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { MetricsEditor } from '../../admin/modules/MetricsEditor';
import { DataStoreProvider } from '../../store/DataStore';

vi.mock('../../lib/supabase');

const SAMPLE_METRIC = {
  name: 'Monthly Active Users', category: 'Delivery' as const, theme: 'Adoption',
  target: '1000', actual: '800', trend: 'Up' as const, period: 'June 2025',
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
            <MetricsEditor />
          </DataStoreProvider>
        } />
      </Routes>
    </MemoryRouter>
  );
}

describe('MetricsEditor', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('T-40.01: renders empty state when no metrics', () => {
    renderEditor();
    expect(screen.getByText('No metrics yet')).toBeInTheDocument();
  });

  it('T-40.02: "+ Add Metric" button opens modal', async () => {
    const user = userEvent.setup();
    renderEditor();
    await user.click(screen.getByText('+ Add Metric'));
    await waitFor(() => expect(screen.getByText('Add Metric')).toBeInTheDocument());
  });

  it('T-40.03: saving a new metric adds it to the list', async () => {
    const user = userEvent.setup();
    renderEditor();
    await user.click(screen.getByText('+ Add Metric'));
    await waitFor(() => screen.getByText('Add Metric'));
    const textboxes = screen.getAllByRole('textbox');
    await user.type(textboxes[0], 'Monthly Active Users');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(screen.getByText('Monthly Active Users')).toBeInTheDocument());
  });

  it('T-40.04: pre-seeded metric renders name in the table', async () => {
    renderEditor({ metrics: [SAMPLE_METRIC] });
    await waitFor(() => expect(screen.getByText('Monthly Active Users')).toBeInTheDocument());
  });

  it('T-40.05: Delete button removes the metric', async () => {
    const user = userEvent.setup();
    renderEditor({ metrics: [SAMPLE_METRIC] });
    await waitFor(() => screen.getByText('Monthly Active Users'));
    await user.click(screen.getAllByRole('button', { name: 'Delete' })[0]);
    await waitFor(() => expect(screen.queryByText('Monthly Active Users')).not.toBeInTheDocument());
  });

  it('T-40.06: Edit button opens modal for existing metric', async () => {
    const user = userEvent.setup();
    renderEditor({ metrics: [SAMPLE_METRIC] });
    await waitFor(() => screen.getByText('Monthly Active Users'));
    await user.click(screen.getAllByRole('button', { name: 'Edit' })[0]);
    await waitFor(() => expect(screen.getByText('Edit Metric')).toBeInTheDocument());
  });

  it('T-40.07: trend icon renders for pre-seeded metric', async () => {
    renderEditor({ metrics: [SAMPLE_METRIC] });
    await waitFor(() => expect(screen.getByText('↑')).toBeInTheDocument());
  });
});
