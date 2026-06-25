import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { S04_Roadmap } from '../../executive/sections/S04_Roadmap';
import { DataStoreProvider } from '../../store/DataStore';

vi.mock('../../lib/supabase');

function renderSection(data: Record<string, unknown> = {}) {
  if (Object.keys(data).length) localStorage.setItem('ppp_data_lnp_pub', JSON.stringify(data));
  return render(
    <MemoryRouter initialEntries={['/lnp/executive/roadmap']}>
      <Routes>
        <Route path="/:productSlug/executive/roadmap" element={
          <DataStoreProvider productId="lnp_pub">
            <S04_Roadmap />
          </DataStoreProvider>
        } />
      </Routes>
    </MemoryRouter>
  );
}

describe('S04_Roadmap', () => {
  beforeEach(() => { localStorage.clear(); vi.clearAllMocks(); });

  it('T-43.01: renders Roadmap heading', () => {
    renderSection();
    expect(screen.getByRole('heading', { name: /Roadmap/i })).toBeInTheDocument();
  });

  it('T-43.02: shows empty state when no roadmap items', async () => {
    renderSection({ roadmap: [] });
    await waitFor(() => {
      expect(screen.getByText('No Roadmap added yet')).toBeInTheDocument();
    });
  });

  it('T-43.03: renders roadmap item when present', async () => {
    renderSection({
      // S04 renders item.item (not item.feature)
      roadmap: [
        { item: 'Certificate Module', phase: 'P1', status: 'Planned', confidence: 'High', quarter: 'Q1 FY26' },
      ],
    });
    await waitFor(() => {
      expect(screen.getByText('Certificate Module')).toBeInTheDocument();
    });
  });
});
