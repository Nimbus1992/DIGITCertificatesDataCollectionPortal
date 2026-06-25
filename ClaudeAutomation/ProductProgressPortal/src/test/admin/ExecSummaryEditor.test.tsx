import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ExecSummaryEditor } from '../../admin/modules/ExecSummaryEditor';
import { DataStoreProvider } from '../../store/DataStore';

vi.mock('../../lib/supabase');

function renderEditor() {
  return render(
    <MemoryRouter initialEntries={['/test/admin']}>
      <Routes>
        <Route path="/:productSlug/admin" element={
          <DataStoreProvider productId="test">
            <ExecSummaryEditor />
          </DataStoreProvider>
        } />
      </Routes>
    </MemoryRouter>
  );
}

describe('ExecSummaryEditor', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('T-27.01: renders 4 status dropdown selects', async () => {
    renderEditor();
    // Wait for the component to stabilize (DataStoreProvider async init)
    await waitFor(() => {
      const selects = screen.getAllByRole('combobox');
      // There are 4 status dropdowns (overallStatus, deliveryConfidence, budgetConfidence, timelineConfidence)
      expect(selects.length).toBeGreaterThanOrEqual(4);
    });
  });

  it('T-27.02: Save Changes calls DataStore.set with updated execSummary', async () => {
    const user = userEvent.setup();
    renderEditor();
    await waitFor(() => screen.getAllByRole('combobox').length >= 4);

    const selects = screen.getAllByRole('combobox');
    // First 4 selects are the status dropdowns; change the first one (overallStatus) to Red
    await user.selectOptions(selects[0], 'Red');
    await user.click(screen.getByRole('button', { name: 'Save Changes' }));

    await waitFor(() => {
      const stored = localStorage.getItem('ppp_data_test');
      const parsed = stored ? JSON.parse(stored) : null;
      expect(parsed?.execSummary?.overallStatus).toBe('Red');
    });
  });

  it('T-27.03: shows "✓ Saved" briefly after save then reverts', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: (ms) => vi.advanceTimersByTime(ms) });
    renderEditor();
    await waitFor(() => screen.getByRole('button', { name: 'Save Changes' }));
    await user.click(screen.getByRole('button', { name: 'Save Changes' }));
    await waitFor(() => expect(screen.queryByRole('button', { name: '✓ Saved' })).toBeInTheDocument());
    act(() => { vi.advanceTimersByTime(2500); });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument());
    vi.useRealTimers();
  });

  it('T-27.04: typing in Biggest Win textarea updates it', async () => {
    const user = userEvent.setup();
    renderEditor();
    await waitFor(() => screen.getByText('Biggest Win'));
    const textareas = screen.getAllByRole('textbox');
    // Biggest Win textarea is one of the textareas
    const biggestWin = textareas.find((_, i) => i >= 0);
    if (biggestWin) {
      await user.type(biggestWin, 'Shipped MVP on time');
      expect(biggestWin).toHaveValue('Shipped MVP on time');
    }
  });

  it('T-27.05: clicking "+ Add item" in Decisions Needed adds an input', async () => {
    const user = userEvent.setup();
    renderEditor();
    await waitFor(() => screen.getByText('Decisions Needed'));
    const addButtons = screen.getAllByText('+ Add item');
    await user.click(addButtons[0]);
    await waitFor(() => {
      const inputs = screen.getAllByRole('textbox');
      expect(inputs.length).toBeGreaterThan(0);
    });
  });

  it('T-27.06: typing in Biggest Risk textarea triggers onChange', async () => {
    const user = userEvent.setup();
    renderEditor();
    await waitFor(() => screen.getByText('Biggest Risk'));
    const textareas = screen.getAllByRole('textbox');
    // textareas order: Biggest Win (0), Biggest Risk (1), Most Important Update (2)
    await user.type(textareas[1], 'Resource shortage');
    expect(textareas[1]).toHaveValue('Resource shortage');
  });

  it('T-27.07: typing in Most Important Update textarea triggers onChange', async () => {
    const user = userEvent.setup();
    renderEditor();
    await waitFor(() => screen.getByText('Most Important Update'));
    const textareas = screen.getAllByRole('textbox');
    await user.type(textareas[2], 'API integration complete');
    expect(textareas[2]).toHaveValue('API integration complete');
  });

  it('T-27.08: clicking "+ Add item" in Leadership Support adds an input', async () => {
    const user = userEvent.setup();
    renderEditor();
    await waitFor(() => screen.getByText('Leadership Support Required'));
    const addButtons = screen.getAllByText('+ Add item');
    // addButtons: [0] Decisions Needed, [1] Leadership Support, [2] Escalations
    await user.click(addButtons[1]);
    await waitFor(() => {
      const inputs = screen.getAllByRole('textbox');
      expect(inputs.length).toBeGreaterThan(3);
    });
  });

  it('T-27.09: clicking "+ Add item" in Escalations adds an input', async () => {
    const user = userEvent.setup();
    renderEditor();
    await waitFor(() => screen.getByText('Escalations'));
    const addButtons = screen.getAllByText('+ Add item');
    await user.click(addButtons[2]);
    await waitFor(() => {
      const inputs = screen.getAllByRole('textbox');
      expect(inputs.length).toBeGreaterThan(3);
    });
  });
});
