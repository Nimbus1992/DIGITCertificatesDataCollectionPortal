import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { S11_Changelog } from '../../executive/sections/S11_Changelog';
import { DataStoreProvider } from '../../store/DataStore';
import type { ChangelogEntry } from '../../types';

vi.mock('../../lib/supabase');

function renderSection(entries: ChangelogEntry[] = []) {
  if (entries.length > 0) {
    localStorage.setItem('ppp_data_lnp_pub', JSON.stringify({ changelog: entries }));
  }
  return render(
    <MemoryRouter initialEntries={['/lnp/executive/changelog']}>
      <Routes>
        <Route path="/:productSlug/executive/changelog" element={
          <DataStoreProvider productId="lnp_pub">
            <S11_Changelog />
          </DataStoreProvider>
        } />
      </Routes>
    </MemoryRouter>
  );
}

const sampleEntries: ChangelogEntry[] = [
  { date: '2025-06-15', changeType: 'Milestone', description: 'MVP shipped', section: 'Roadmap', author: 'Alice' },
  { date: '2025-06-20', changeType: 'Risk', description: 'New risk added', section: 'Risks', author: 'Bob' },
];

describe('S11_Changelog', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('T-30.01: renders empty state when changelog is empty', async () => {
    renderSection();
    await waitFor(() => {
      expect(screen.getByText('No Changelog added yet')).toBeInTheDocument();
    });
  });

  it('T-30.02: renders timeline view by default with entries', async () => {
    renderSection(sampleEntries);
    await waitFor(() => {
      expect(screen.getByText('MVP shipped')).toBeInTheDocument();
      // Timeline tab is active by default
      const timelineBtn = screen.getByRole('button', { name: 'timeline' });
      expect(timelineBtn).toHaveClass('bg-white');
    });
  });

  it('T-30.03: shows entries with their dates in timeline view', async () => {
    renderSection(sampleEntries);
    await waitFor(() => {
      expect(screen.getByText('2025-06-15')).toBeInTheDocument();
      expect(screen.getByText('2025-06-20')).toBeInTheDocument();
    });
  });

  it('T-30.04: switching to weekly view changes the active tab', async () => {
    const user = userEvent.setup();
    renderSection(sampleEntries);
    await waitFor(() => screen.getByRole('button', { name: 'weekly' }));
    await user.click(screen.getByRole('button', { name: 'weekly' }));
    await waitFor(() => {
      const weeklyBtn = screen.getByRole('button', { name: 'weekly' });
      expect(weeklyBtn).toHaveClass('bg-white');
    });
  });
});
