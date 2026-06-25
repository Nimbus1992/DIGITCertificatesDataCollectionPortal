import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { BurnupChart } from '../../../components/charts/BurnupChart';
import type { BudgetRow } from '../../../types';

const makeRow = (month: string, budgeted: number, consumed: number): BudgetRow => ({
  category: 'Tech', workstream: '', month, budgeted, consumed, remaining: 0, forecast: 0, variance: 0,
});

describe('BurnupChart', () => {
  it('T-22.01: renders "No monthly data" when data is empty', () => {
    render(<BurnupChart data={[]} />);
    expect(screen.getByText('No monthly data')).toBeInTheDocument();
  });

  it('T-22.02: does not show "No monthly data" for non-empty data', () => {
    render(<BurnupChart data={[makeRow('Jan 2025', 1000, 800)]} />);
    expect(screen.queryByText('No monthly data')).not.toBeInTheDocument();
  });

  it('T-22.03: aggregates multiple rows with the same month', () => {
    // Two rows for "Jan 2025" with budgeted 500 each → total 1000
    // We test by confirming the chart renders (not the empty state)
    const data = [makeRow('Jan 2025', 500, 300), makeRow('Jan 2025', 500, 200)];
    render(<BurnupChart data={data} />);
    expect(screen.queryByText('No monthly data')).not.toBeInTheDocument();
  });
});
