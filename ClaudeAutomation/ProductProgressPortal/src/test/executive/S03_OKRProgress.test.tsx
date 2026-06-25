import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { S03_OKRProgress } from '../../executive/sections/S03_OKRProgress';
import { DataStoreProvider } from '../../store/DataStore';

vi.mock('../../lib/supabase');

function renderSection(data: Record<string, unknown> = {}) {
  if (Object.keys(data).length) localStorage.setItem('ppp_data_lnp_pub', JSON.stringify(data));
  return render(
    <MemoryRouter initialEntries={['/lnp/executive/okrs']}>
      <Routes>
        <Route path="/:productSlug/executive/okrs" element={
          <DataStoreProvider productId="lnp_pub">
            <S03_OKRProgress />
          </DataStoreProvider>
        } />
      </Routes>
    </MemoryRouter>
  );
}

describe('S03_OKRProgress', () => {
  beforeEach(() => { localStorage.clear(); vi.clearAllMocks(); });

  it('T-42.01: renders Milestone Tracker heading', () => {
    renderSection();
    expect(screen.getByRole('heading', { name: /Milestone Tracker/i })).toBeInTheDocument();
  });

  it('T-42.02: shows empty state when no milestones', async () => {
    renderSection({ milestones: [] });
    await waitFor(() => {
      expect(screen.getByText('No Milestones added yet')).toBeInTheDocument();
    });
  });

  it('T-42.03: renders milestone title when milestones present', async () => {
    renderSection({
      milestones: [
        { id: '1', title: 'MVP Launch', keyResult: 'KR1', status: 'In Progress', owner: 'Alice', tasks: [] },
      ],
    });
    await waitFor(() => {
      expect(screen.getByText('MVP Launch')).toBeInTheDocument();
    });
  });
});
