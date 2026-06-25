import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { BudgetGauge } from '../../../components/charts/BudgetGauge';

describe('BudgetGauge', () => {
  it('T-23.01: renders the percentage text', () => {
    render(<BudgetGauge utilized={73} />);
    expect(screen.getByText('73%')).toBeInTheDocument();
  });

  it('T-23.02: caps displayed percentage at 100', () => {
    render(<BudgetGauge utilized={120} />);
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.queryByText('120%')).not.toBeInTheDocument();
  });

  it('T-23.03: renders "consumed" label', () => {
    render(<BudgetGauge utilized={50} />);
    expect(screen.getByText('consumed')).toBeInTheDocument();
  });
});
