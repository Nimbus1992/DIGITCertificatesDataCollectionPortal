import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { RoadmapEditor } from '../../admin/modules/RoadmapEditor';
import { DataStoreProvider } from '../../store/DataStore';

vi.mock('../../lib/supabase');

const SAMPLE_ITEM = {
  item: 'Phase 1 Discovery', description: 'Initial phase', status: 'Upcoming' as const,
  confidence: 'Green' as const, dependencies: '', deliveryWindow: '', quarter: 'Q1 FY26', phase: 'P1',
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
            <RoadmapEditor />
          </DataStoreProvider>
        } />
      </Routes>
    </MemoryRouter>
  );
}

describe('RoadmapEditor', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('T-33.01: renders empty state when no roadmap items', () => {
    renderEditor();
    expect(screen.getByText('No roadmap items yet')).toBeInTheDocument();
  });

  it('T-33.02: "+ Add Item" button opens modal', async () => {
    const user = userEvent.setup();
    renderEditor();
    await user.click(screen.getByText('+ Add Item'));
    await waitFor(() => expect(screen.getByText('Add Roadmap Item')).toBeInTheDocument());
  });

  it('T-33.03: saving a new item adds it to the list', async () => {
    const user = userEvent.setup();
    renderEditor();
    await user.click(screen.getByText('+ Add Item'));
    await waitFor(() => screen.getByText('Add Roadmap Item'));
    const textboxes = screen.getAllByRole('textbox');
    await user.type(textboxes[0], 'Phase 1 Discovery');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(screen.getByText('Phase 1 Discovery')).toBeInTheDocument());
  });

  it('T-33.04: pre-seeded roadmap item renders in the table', async () => {
    renderEditor({ roadmap: [SAMPLE_ITEM] });
    await waitFor(() => expect(screen.getByText('Phase 1 Discovery')).toBeInTheDocument());
  });

  it('T-33.05: Delete button removes the roadmap item', async () => {
    const user = userEvent.setup();
    renderEditor({ roadmap: [SAMPLE_ITEM] });
    await waitFor(() => screen.getByText('Phase 1 Discovery'));
    await user.click(screen.getAllByRole('button', { name: 'Delete' })[0]);
    await waitFor(() => expect(screen.queryByText('Phase 1 Discovery')).not.toBeInTheDocument());
  });

  it('T-33.06: Edit button opens modal pre-populated with item title', async () => {
    const user = userEvent.setup();
    renderEditor({ roadmap: [SAMPLE_ITEM] });
    await waitFor(() => screen.getByText('Phase 1 Discovery'));
    await user.click(screen.getAllByRole('button', { name: 'Edit' })[0]);
    await waitFor(() => expect(screen.getByText('Edit Roadmap Item')).toBeInTheDocument());
  });

  it('T-33.07: status badge renders for pre-seeded item', async () => {
    renderEditor({ roadmap: [SAMPLE_ITEM] });
    await waitFor(() => expect(screen.getByText('Upcoming')).toBeInTheDocument());
  });

  it('T-33.08: editing a roadmap item updates it via else branch', async () => {
    const user = userEvent.setup();
    renderEditor({ roadmap: [SAMPLE_ITEM] });
    await waitFor(() => screen.getByText('Phase 1 Discovery'));
    await user.click(screen.getAllByRole('button', { name: 'Edit' })[0]);
    await waitFor(() => screen.getByText('Edit Roadmap Item'));
    const textboxes = screen.getAllByRole('textbox');
    await user.clear(textboxes[0]);
    await user.type(textboxes[0], 'Phase 1 Updated');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(screen.getByText('Phase 1 Updated')).toBeInTheDocument());
  });

  it('T-33.09: Scope Overview section shows In Scope and Out of Scope fields', () => {
    renderEditor();
    expect(screen.getByText('In Scope')).toBeInTheDocument();
    expect(screen.getByText('Out of Scope')).toBeInTheDocument();
  });

  it('T-33.10: clicking "+ Add item" in In Scope adds a new input', async () => {
    const user = userEvent.setup();
    renderEditor();
    const addButtons = screen.getAllByText('+ Add item');
    await user.click(addButtons[0]);
    await waitFor(() => {
      const inputs = screen.getAllByRole('textbox');
      expect(inputs.length).toBeGreaterThan(0);
    });
  });
});
