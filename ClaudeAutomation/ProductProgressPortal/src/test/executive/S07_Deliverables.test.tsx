import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { S07_Deliverables } from '../../executive/sections/S07_Deliverables';
import { DataStoreProvider } from '../../store/DataStore';

vi.mock('../../lib/supabase');

function renderSection(data: Record<string, unknown> = {}) {
  if (Object.keys(data).length) localStorage.setItem('ppp_data_lnp_pub', JSON.stringify(data));
  return render(
    <MemoryRouter initialEntries={['/lnp/executive/deliverables']}>
      <Routes>
        <Route path="/:productSlug/executive/deliverables" element={
          <DataStoreProvider productId="lnp_pub">
            <S07_Deliverables />
          </DataStoreProvider>
        } />
      </Routes>
    </MemoryRouter>
  );
}

describe('S07_Deliverables', () => {
  beforeEach(() => { localStorage.clear(); vi.clearAllMocks(); });

  it('T-45.01: renders Key Assets heading', () => {
    renderSection();
    expect(screen.getByRole('heading', { name: /Key Assets/i })).toBeInTheDocument();
  });

  it('T-45.02: shows empty state when no artifacts', async () => {
    renderSection({ artifacts: [] });
    await waitFor(() => {
      expect(screen.getByText('No Key Assets added yet')).toBeInTheDocument();
    });
  });

  it('T-45.03: renders artifact title when present', async () => {
    renderSection({
      artifacts: [{ title: 'Product PRD', url: 'http://example.com', section: 'Design & Build DPGs', stage: 'Publish', type: 'Document' }],
    });
    await waitFor(() => {
      expect(screen.getByText('Product PRD')).toBeInTheDocument();
    });
  });
});
