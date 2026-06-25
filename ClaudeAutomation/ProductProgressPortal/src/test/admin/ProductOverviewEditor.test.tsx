import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProductOverviewEditor } from '../../admin/modules/ProductOverviewEditor';
import { DataStoreProvider } from '../../store/DataStore';

vi.mock('../../lib/supabase');

function renderEditor(initial: object = {}) {
  if (Object.keys(initial).length) {
    localStorage.setItem('ppp_data_test', JSON.stringify(initial));
  }
  return render(
    <MemoryRouter initialEntries={['/test/admin']}>
      <Routes>
        <Route path="/:productSlug/admin" element={
          <DataStoreProvider productId="test">
            <ProductOverviewEditor />
          </DataStoreProvider>
        } />
      </Routes>
    </MemoryRouter>
  );
}

describe('ProductOverviewEditor', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('T-51.01: renders Product Overview heading', () => {
    renderEditor();
    expect(screen.getByRole('heading', { name: /Product Overview/i })).toBeInTheDocument();
  });

  it('T-51.02: renders Problem Statement and Vision textareas', () => {
    renderEditor();
    expect(screen.getByText('Problem Statement')).toBeInTheDocument();
    expect(screen.getByText('Vision')).toBeInTheDocument();
  });

  it('T-51.03: renders Scope & Objectives section', () => {
    renderEditor();
    expect(screen.getByText(/Scope & Objectives/i)).toBeInTheDocument();
  });

  it('T-51.04: Save Changes button exists', () => {
    renderEditor();
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument();
  });

  it('T-51.05: clicking Save shows saved confirmation', async () => {
    const user = userEvent.setup();
    renderEditor();
    await user.click(screen.getByRole('button', { name: 'Save Changes' }));
    await waitFor(() => expect(screen.getByRole('button', { name: /Saved/i })).toBeInTheDocument());
  });

  it('T-51.06: renders pre-seeded problem statement', async () => {
    renderEditor({
      productOverview: {
        problem: 'License processes are manual', vision: '', objectives: [],
        inScope: [], outOfScope: [], targetUsers: [], strategicAlignment: [],
      },
    });
    await waitFor(() => {
      const textarea = screen.getAllByRole('textbox')[0];
      expect(textarea).toHaveValue('License processes are manual');
    });
  });

  it('T-51.07: typing in Vision textarea triggers update', async () => {
    const user = userEvent.setup();
    renderEditor();
    const textareas = screen.getAllByRole('textbox');
    // Vision is the second textarea (after Problem Statement)
    await user.type(textareas[1], 'A fully digital licensing system');
    expect(textareas[1]).toHaveValue('A fully digital licensing system');
  });

  it('T-51.08: clicking "+ Add item" in Objectives adds a text input', async () => {
    const user = userEvent.setup();
    renderEditor();
    const addButtons = screen.getAllByText('+ Add item');
    await user.click(addButtons[0]);
    await waitFor(() => {
      const inputs = screen.getAllByRole('textbox');
      // After adding, there should be 3+ textboxes (problem + vision + new objective input)
      expect(inputs.length).toBeGreaterThan(2);
    });
  });

  it('T-51.09: pre-seeded objectives render as editable inputs', async () => {
    renderEditor({
      productOverview: {
        problem: '', vision: '',
        objectives: ['Reduce manual effort', 'Improve turnaround'],
        inScope: [], outOfScope: [], targetUsers: [], strategicAlignment: [],
      },
    });
    await waitFor(() => {
      expect(screen.getByDisplayValue('Reduce manual effort')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Improve turnaround')).toBeInTheDocument();
    });
  });

  it('T-51.10: pre-seeded targetUsers render as editable inputs', async () => {
    renderEditor({
      productOverview: {
        problem: '', vision: '', objectives: [], inScope: [], outOfScope: [],
        targetUsers: ['Business Owner', 'Government Official'], strategicAlignment: [],
      },
    });
    await waitFor(() => {
      expect(screen.getByDisplayValue('Business Owner')).toBeInTheDocument();
    });
  });

  it('T-51.11: typing in Problem Statement textarea triggers update', async () => {
    const user = userEvent.setup();
    renderEditor();
    const textareas = screen.getAllByRole('textbox');
    await user.type(textareas[0], 'Manual license processes waste time');
    expect(textareas[0]).toHaveValue('Manual license processes waste time');
  });

  it('T-51.12: typing in pre-seeded In Scope item triggers onChange', async () => {
    const user = userEvent.setup();
    renderEditor({
      productOverview: {
        problem: '', vision: '', objectives: [],
        inScope: ['Existing item'], outOfScope: [], targetUsers: [], strategicAlignment: [],
      },
    });
    await waitFor(() => screen.getByDisplayValue('Existing item'));
    const input = screen.getByDisplayValue('Existing item');
    await user.type(input, ' updated');
    expect(screen.getByDisplayValue('Existing item updated')).toBeInTheDocument();
  });

  it('T-51.13: typing in pre-seeded Out of Scope item triggers onChange', async () => {
    const user = userEvent.setup();
    renderEditor({
      productOverview: {
        problem: '', vision: '', objectives: [], inScope: [],
        outOfScope: ['Out item'], targetUsers: [], strategicAlignment: [],
      },
    });
    await waitFor(() => screen.getByDisplayValue('Out item'));
    const input = screen.getByDisplayValue('Out item');
    await user.type(input, ' extra');
    expect(screen.getByDisplayValue('Out item extra')).toBeInTheDocument();
  });
});
