import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { RiskEditor } from '../../admin/modules/RiskEditor';
import { DataStoreProvider } from '../../store/DataStore';
import type { Risk } from '../../types';

vi.mock('../../lib/supabase');

function renderEditor(initialRisks: Risk[] = []) {
  // Pre-seed localStorage with initial risks
  if (initialRisks.length > 0) {
    localStorage.setItem('ppp_data_test', JSON.stringify({ risks: initialRisks }));
  }
  return render(
    <MemoryRouter initialEntries={['/test/admin/risks']}>
      <Routes>
        <Route path="/:productSlug/admin/risks" element={
          <DataStoreProvider productId="test">
            <RiskEditor />
          </DataStoreProvider>
        } />
      </Routes>
    </MemoryRouter>
  );
}

const sampleRisk: Risk = {
  description: 'Server outage risk',
  severity: 'High',
  probability: 4,
  impact: 5,
  owner: 'Alice',
  mitigation: 'Use redundancy',
  eta: '2025-12-31',
  status: 'Open',
  category: 'Technical',
};

describe('RiskEditor', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('T-26.01: renders empty state when risks array is empty', () => {
    renderEditor();
    expect(screen.getByText('0 risks logged')).toBeInTheDocument();
  });

  it('T-26.02: "+ Add Risk" button opens the modal', async () => {
    const user = userEvent.setup();
    renderEditor();
    await user.click(screen.getByText('+ Add Risk'));
    await waitFor(() => expect(screen.getByText('Add Risk')).toBeInTheDocument());
  });

  it('T-26.03: filling form and clicking Save adds a new risk', async () => {
    const user = userEvent.setup();
    renderEditor();
    await user.click(screen.getByText('+ Add Risk'));
    await waitFor(() => screen.getByText('Add Risk'));

    // Modal opens — first textarea is the description field
    const textareas = screen.getAllByRole('textbox');
    await user.type(textareas[0], 'New risk description');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(screen.getByText('1 risks logged')).toBeInTheDocument();
      expect(screen.getByText('New risk description')).toBeInTheDocument();
    });
  });

  it('T-26.04: Edit button opens modal pre-populated with existing risk data', async () => {
    const user = userEvent.setup();
    renderEditor([sampleRisk]);
    await waitFor(() => screen.getByText('Server outage risk'));

    const editBtn = screen.getAllByRole('button', { name: 'Edit' })[0];
    await user.click(editBtn);
    await waitFor(() => {
      expect(screen.getByText('Edit Risk')).toBeInTheDocument();
      const textarea = screen.getByDisplayValue('Server outage risk');
      expect(textarea).toBeInTheDocument();
    });
  });

  it('T-26.05: editing and saving updates the item without adding a new one', async () => {
    const user = userEvent.setup();
    renderEditor([sampleRisk]);
    await waitFor(() => screen.getByText('Server outage risk'));

    const editBtn = screen.getAllByRole('button', { name: 'Edit' })[0];
    await user.click(editBtn);
    await waitFor(() => screen.getByText('Edit Risk'));
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(screen.getByText('1 risks logged')).toBeInTheDocument());
  });

  it('T-26.06: delete button removes the risk from the array', async () => {
    const user = userEvent.setup();
    renderEditor([sampleRisk]);
    await waitFor(() => screen.getByText('Server outage risk'));

    await user.click(screen.getAllByRole('button', { name: 'Delete' })[0]);
    await waitFor(() => expect(screen.getByText('0 risks logged')).toBeInTheDocument());
  });

  it('T-26.07: risks are grouped by category in the table', async () => {
    renderEditor([sampleRisk]);
    await waitFor(() => {
      // Category header should be visible
      expect(screen.getByText('Technical')).toBeInTheDocument();
    });
  });

  it('T-26.08: uncategorised risks appear under "Uncategorised" group', async () => {
    const uncategorisedRisk: Risk = { ...sampleRisk, category: undefined };
    renderEditor([uncategorisedRisk]);
    await waitFor(() => {
      expect(screen.getByText('Uncategorised')).toBeInTheDocument();
    });
  });
});
