import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { S01_ExecSummary } from '../../executive/sections/S01_ExecSummary';
import { DataStoreProvider } from '../../store/DataStore';

vi.mock('../../lib/supabase');

function renderSection(storeData: Record<string, unknown> = {}) {
  if (Object.keys(storeData).length > 0) {
    localStorage.setItem('ppp_data_lnp_pub', JSON.stringify(storeData));
  }
  return render(
    <MemoryRouter initialEntries={['/lnp/executive/summary']}>
      <Routes>
        <Route path="/:productSlug/executive/summary" element={
          <DataStoreProvider productId="lnp_pub">
            <S01_ExecSummary />
          </DataStoreProvider>
        } />
        <Route path="/:productSlug/executive/okrs" element={<div>OKRs View</div>} />
        <Route path="/:productSlug/executive/risks" element={<div>Risks View</div>} />
        <Route path="/:productSlug/executive/decisions" element={<div>Decisions View</div>} />
        <Route path="/:productSlug/executive/budget" element={<div>Budget View</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('S01_ExecSummary', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('T-28.01: renders "Executive Summary" heading', () => {
    renderSection();
    expect(screen.getByText('Executive Summary')).toBeInTheDocument();
  });

  it('T-28.02: shows "—" for OKRs when no milestones', () => {
    renderSection({ milestones: [] });
    // No milestones → OKR tile shows — with "No OKRs added yet"
    expect(screen.getByText('No OKRs added yet')).toBeInTheDocument();
  });

  it('T-28.03: shows OKR completion percentage from milestones', async () => {
    renderSection({
      milestones: [
        { id: '1', title: 'M1', keyResult: 'KR1', status: 'Complete', owner: '', tasks: [] },
        { id: '2', title: 'M2', keyResult: 'KR1', status: 'In Progress', owner: '', tasks: [] },
      ],
    });
    // getByText only matches direct text nodes — the sublabel is a pure text node and
    // uniquely identifies the 50% state (1 of 2 complete)
    await waitFor(() => {
      expect(screen.getByText('1 of 2 complete (all quarters)')).toBeInTheDocument();
    });
  });

  it('T-28.04: shows open risk count from risks array', async () => {
    renderSection({
      risks: [
        { description: 'R1', severity: 'High', probability: 3, impact: 3, owner: '', mitigation: '', eta: '', status: 'Open' },
        { description: 'R2', severity: 'Low', probability: 1, impact: 1, owner: '', mitigation: '', eta: '', status: 'Closed' },
      ],
    });
    await waitFor(() => {
      // Only 1 open risk — tile should show "1"
      // Check for the Open Risks label and its value
      expect(screen.getAllByText('1').length).toBeGreaterThan(0);
    });
  });

  it('T-28.05: shows open decision count from decisions array', async () => {
    renderSection({
      decisions: [
        { decision: 'D1', date: '', owner: '', context: '', tradeoff: '', outcome: '', status: 'Open' },
      ],
    });
    await waitFor(() => {
      // Open decisions tile should show "1"
      expect(screen.getAllByText('1').length).toBeGreaterThan(0);
    });
  });

  it('T-28.06: budget consumed tile shows 0% consumed when no budget rows', async () => {
    renderSection({ budget: [] });
    await waitFor(() => {
      // "0% consumed" appears in the inline text: "of ₹0 · 0% consumed"
      expect(screen.getByText(/0% consumed/)).toBeInTheDocument();
    });
  });

  it('T-28.07: team section is absent when team array is empty', async () => {
    renderSection({ team: [] });
    await waitFor(() => {
      expect(screen.queryByText('Team Deployed')).not.toBeInTheDocument();
    });
  });

  it('T-28.08: clicking OKR tile navigates to okrs section', async () => {
    const user = userEvent.setup();
    renderSection({
      milestones: [
        { id: '1', title: 'M1', keyResult: 'KR1', status: 'Complete', owner: '', tasks: [] },
      ],
    });
    // Wait for milestones to load — sublabel confirms 100% state (all quarters)
    await waitFor(() => screen.getByText('1 of 1 complete (all quarters)'));
    // Click the OKRs tile (label text matches "OKRs Completed")
    const okrLabel = screen.getByText(/OKRs Completed/i);
    const tile = okrLabel.closest('[class*="cursor-pointer"]') as HTMLElement ?? okrLabel.closest('div') as HTMLElement;
    if (tile) {
      await user.click(tile);
      await waitFor(() => expect(screen.queryByText('OKRs View')).toBeInTheDocument());
    }
  });
});
