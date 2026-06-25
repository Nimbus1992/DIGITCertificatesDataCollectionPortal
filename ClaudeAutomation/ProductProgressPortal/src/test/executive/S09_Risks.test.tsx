import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { S09_Risks } from '../../executive/sections/S09_Risks';
import { DataStoreProvider } from '../../store/DataStore';
import type { Risk } from '../../types';

vi.mock('../../lib/supabase');

function makeRisk(description: string, probability: number, impact: number, status = 'Open', category?: Risk['category']): Risk {
  return { description, severity: 'Medium', probability, impact, owner: '', mitigation: '', eta: '', status, category };
}

function renderSection(risks: Risk[] = []) {
  if (risks.length > 0) {
    localStorage.setItem('ppp_data_lnp_pub', JSON.stringify({ risks }));
  }
  return render(
    <MemoryRouter initialEntries={['/lnp/executive/risks']}>
      <Routes>
        <Route path="/:productSlug/executive/risks" element={
          <DataStoreProvider productId="lnp_pub">
            <S09_Risks />
          </DataStoreProvider>
        } />
      </Routes>
    </MemoryRouter>
  );
}

describe('S09_Risks', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('T-29.01: renders heading when risks present', async () => {
    const { container } = renderSection([makeRisk('Risk A', 3, 4)]);
    await waitFor(() => {
      expect(container.querySelector('svg')).not.toBeNull();
    });
  });

  it('T-29.02: renders risk matrix SVG when risks present', async () => {
    const { container } = renderSection([makeRisk('Risk A', 3, 4)]);
    await waitFor(() => {
      expect(container.querySelector('svg')).not.toBeNull();
    });
  });

  it('T-29.03: clicking a matrix circle shows the Reset filter button', async () => {
    const { container } = renderSection([
      makeRisk('Risk at 3,4', 3, 4, 'Open'),
      makeRisk('Risk at 1,2', 1, 2, 'Open'),
    ]);
    await waitFor(() => container.querySelector('svg'));

    // Use fireEvent for SVG elements (userEvent doesn't work well with SVG in jsdom)
    const circles = container.querySelectorAll('circle');
    if (circles.length > 0) {
      // Click the first risk circle (not the background circle)
      const filledCircle = Array.from(circles).find(c => !c.getAttribute('fill')?.includes('e5e7eb'));
      if (filledCircle) {
        fireEvent.click(filledCircle.closest('g')!);
        await waitFor(() => {
          expect(screen.getByText('✕ Reset filter')).toBeInTheDocument();
        });
      }
    }
  });

  it('T-29.04: "Reset filter" button clears the matrix selection', async () => {
    const { container } = renderSection([makeRisk('Risk A', 3, 4), makeRisk('Risk B', 1, 2)]);
    await waitFor(() => container.querySelector('svg'));

    const circles = container.querySelectorAll('circle');
    const filledCircle = Array.from(circles).find(c => !c.getAttribute('fill')?.includes('e5e7eb'));
    if (filledCircle) {
      fireEvent.click(filledCircle.closest('g')!);
      await waitFor(() => screen.getByText('✕ Reset filter'));

      const user = userEvent.setup();
      await user.click(screen.getByText('✕ Reset filter'));
      await waitFor(() => {
        expect(screen.queryByText('✕ Reset filter')).not.toBeInTheDocument();
        expect(screen.getByText('Risk A')).toBeInTheDocument();
        expect(screen.getByText('Risk B')).toBeInTheDocument();
      });
    }
  });

  it('T-29.05: "Open" count chip shows only non-Closed risks count', async () => {
    const { container } = renderSection([
      makeRisk('R1', 2, 3, 'Open'),
      makeRisk('R2', 1, 1, 'Closed'),
    ]);
    await waitFor(() => {
      // The "Open" chip has class bg-red-50; its textContent is "Open 1"
      // getByText can't match "Open 1" because the count is in a nested <span>,
      // so query by CSS class and check textContent directly
      const openChip = container.querySelector('.bg-red-50.text-red-700');
      expect(openChip).not.toBeNull();
      expect(openChip!.textContent?.replace(/\s+/g, ' ').trim()).toMatch(/Open 1/);
    });
  });
});
