import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { S02_ProductOverview } from '../../executive/sections/S02_ProductOverview';
import { DataStoreProvider } from '../../store/DataStore';

vi.mock('../../lib/supabase');

function renderSection(data: Record<string, unknown> = {}) {
  if (Object.keys(data).length) localStorage.setItem('ppp_data_lnp_pub', JSON.stringify(data));
  return render(
    <MemoryRouter initialEntries={['/lnp/executive/overview']}>
      <Routes>
        <Route path="/:productSlug/executive/overview" element={
          <DataStoreProvider productId="lnp_pub">
            <S02_ProductOverview />
          </DataStoreProvider>
        } />
      </Routes>
    </MemoryRouter>
  );
}

describe('S02_ProductOverview', () => {
  beforeEach(() => { localStorage.clear(); vi.clearAllMocks(); });

  it('T-41.01: renders Product Overview heading', () => {
    renderSection();
    expect(screen.getByRole('heading', { name: /Product Overview/i })).toBeInTheDocument();
  });

  it('T-41.02: shows per-theme empty hint when no metrics loaded', async () => {
    renderSection({ metrics: [] });
    await waitFor(() => {
      // Each theme block renders this message when it has no metrics
      const hints = screen.getAllByText(/No metrics — update in Admin/i);
      expect(hints.length).toBeGreaterThan(0);
    });
  });

  it('T-41.03: renders metric name when metrics are present', async () => {
    renderSection({
      // theme must match a THEME_CONFIG key so the metric appears in a ThemeBlock
      metrics: [{ name: 'Daily Active Users', target: '1000', actual: '800', trend: 'Up', status: 'On Track', theme: 'Adoption' }],
    });
    await waitFor(() => {
      expect(screen.getByText('Daily Active Users')).toBeInTheDocument();
    });
  });
});
