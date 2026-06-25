import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { VisibilityBanner } from '../../admin/VisibilityBanner';
import { DataStoreProvider } from '../../store/DataStore';

vi.mock('../../lib/supabase');

function renderBanner(visKey: 'risks' | 'okrs' = 'risks', initialVisible = true) {
  if (!initialVisible) {
    localStorage.setItem('ppp_data_test', JSON.stringify({
      sectionVisibility: { risks: false, okrs: true, execSummary: true, productOverview: true,
        roadmap: true, budget: true, deliverables: true, conversations: true, decisions: true,
        changelog: true, appendix: true, dpiAdoption: true, plgLifecycle: true, ecosystemBuilding: true },
    }));
  }
  return render(
    <MemoryRouter initialEntries={['/test/admin']}>
      <Routes>
        <Route path="/:productSlug/admin" element={
          <DataStoreProvider productId="test">
            <VisibilityBanner visKey={visKey} label="Risk Registry" />
          </DataStoreProvider>
        } />
      </Routes>
    </MemoryRouter>
  );
}

describe('VisibilityBanner', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('T-31.01: shows "visible" state with green styling by default', () => {
    renderBanner();
    expect(screen.getByText(/visible/)).toBeInTheDocument();
    const banner = screen.getByText(/Risk Registry/).closest('div')!;
    expect(banner.parentElement).toHaveClass('bg-green-50');
  });

  it('T-31.02: clicking toggle calls set and inverts visibility', async () => {
    const user = userEvent.setup();
    renderBanner();
    await user.click(screen.getByText('Hide from exec view'));
    await waitFor(() => {
      expect(screen.getByText('Show in exec view')).toBeInTheDocument();
      expect(screen.getByText(/hidden/)).toBeInTheDocument();
    });
  });

  it('T-31.03: shows "hidden" state with amber styling when visible=false', () => {
    renderBanner('risks', false);
    expect(screen.getByText(/hidden/)).toBeInTheDocument();
    const bannerRoot = screen.getByText(/Risk Registry/).closest('div')!;
    expect(bannerRoot.parentElement).toHaveClass('bg-amber-50');
  });
});
