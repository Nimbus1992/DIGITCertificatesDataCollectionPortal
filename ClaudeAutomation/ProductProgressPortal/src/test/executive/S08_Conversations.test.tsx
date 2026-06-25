import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { S08_Conversations } from '../../executive/sections/S08_Conversations';
import { DataStoreProvider } from '../../store/DataStore';

vi.mock('../../lib/supabase');

function renderSection(data: Record<string, unknown> = {}) {
  if (Object.keys(data).length) localStorage.setItem('ppp_data_lnp_pub', JSON.stringify(data));
  return render(
    <MemoryRouter initialEntries={['/lnp/executive/conversations']}>
      <Routes>
        <Route path="/:productSlug/executive/conversations" element={
          <DataStoreProvider productId="lnp_pub">
            <S08_Conversations />
          </DataStoreProvider>
        } />
      </Routes>
    </MemoryRouter>
  );
}

describe('S08_Conversations', () => {
  beforeEach(() => { localStorage.clear(); vi.clearAllMocks(); });

  it('T-46.01: renders External Conversations heading', () => {
    renderSection();
    expect(screen.getByRole('heading', { name: /External Conversations/i })).toBeInTheDocument();
  });

  it('T-46.02: shows empty state when no conversations', async () => {
    renderSection({ conversations: [] });
    await waitFor(() => {
      expect(screen.getByText('No Conversations added yet')).toBeInTheDocument();
    });
  });

  it('T-46.03: renders conversation name when present', async () => {
    renderSection({
      // S08 renders conv.organization (not conv.name)
      conversations: [{ organization: 'State IT Secretary', stage: 'Implement', date: '2025-06-01', nextSteps: '', owner: '' }],
    });
    await waitFor(() => {
      expect(screen.getByText('State IT Secretary')).toBeInTheDocument();
    });
  });
});
