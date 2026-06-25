import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { S10_DecisionLog } from '../../executive/sections/S10_DecisionLog';
import { DataStoreProvider } from '../../store/DataStore';

vi.mock('../../lib/supabase');

function renderSection(data: Record<string, unknown> = {}) {
  if (Object.keys(data).length) localStorage.setItem('ppp_data_lnp_pub', JSON.stringify(data));
  return render(
    <MemoryRouter initialEntries={['/lnp/executive/decisions']}>
      <Routes>
        <Route path="/:productSlug/executive/decisions" element={
          <DataStoreProvider productId="lnp_pub">
            <S10_DecisionLog />
          </DataStoreProvider>
        } />
      </Routes>
    </MemoryRouter>
  );
}

describe('S10_DecisionLog', () => {
  beforeEach(() => { localStorage.clear(); vi.clearAllMocks(); });

  it('T-47.01: renders Decision Log heading', () => {
    renderSection();
    expect(screen.getByRole('heading', { name: /Decision Log/i })).toBeInTheDocument();
  });

  it('T-47.02: shows empty state when no decisions', async () => {
    renderSection({ decisions: [] });
    await waitFor(() => {
      expect(screen.getByText('No Decisions added yet')).toBeInTheDocument();
    });
  });

  it('T-47.03: renders decision text when present', async () => {
    renderSection({
      decisions: [{ decision: 'Adopt cloud-native architecture', date: '2025-06-01', owner: 'CTO', context: '', tradeoff: '', outcome: '', status: 'Open' }],
    });
    await waitFor(() => {
      expect(screen.getByText('Adopt cloud-native architecture')).toBeInTheDocument();
    });
  });
});
