import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { S05_Budget } from '../../executive/sections/S05_Budget';
import { DataStoreProvider } from '../../store/DataStore';

vi.mock('../../lib/supabase');

function renderSection(data: Record<string, unknown> = {}) {
  if (Object.keys(data).length) localStorage.setItem('ppp_data_lnp_pub', JSON.stringify(data));
  return render(
    <MemoryRouter initialEntries={['/lnp/executive/budget']}>
      <Routes>
        <Route path="/:productSlug/executive/budget" element={
          <DataStoreProvider productId="lnp_pub">
            <S05_Budget />
          </DataStoreProvider>
        } />
      </Routes>
    </MemoryRouter>
  );
}

describe('S05_Budget', () => {
  beforeEach(() => { localStorage.clear(); vi.clearAllMocks(); });

  it('T-44.01: renders Budget heading', () => {
    renderSection();
    expect(screen.getByRole('heading', { name: /Budget/i })).toBeInTheDocument();
  });

  it('T-44.02: shows empty state when no budget rows', async () => {
    renderSection({ budget: [] });
    await waitFor(() => {
      expect(screen.getByText('No Budget added yet')).toBeInTheDocument();
    });
  });

  it('T-44.03: renders budget category when rows present', async () => {
    renderSection({
      budget: [{ category: 'Infrastructure', budgeted: 500000, consumed: 200000, forecast: 450000, variance: -50000 }],
    });
    await waitFor(() => {
      expect(screen.getByText('Infrastructure')).toBeInTheDocument();
    });
  });
});
