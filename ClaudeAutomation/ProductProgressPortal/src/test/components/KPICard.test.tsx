import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { KPICard } from '../../components/KPICard';

describe('KPICard', () => {
  it('T-18.01: renders label and value', () => {
    render(<KPICard label="Active Users" value={142} />);
    expect(screen.getByText('Active Users')).toBeInTheDocument();
    expect(screen.getByText('142')).toBeInTheDocument();
  });

  it('T-18.02: renders unit next to value', () => {
    render(<KPICard label="Completion" value={73} unit="%" />);
    expect(screen.getByText('%')).toBeInTheDocument();
  });

  it('T-18.03: renders sublabel when provided', () => {
    render(<KPICard label="Budget" value={500} sublabel="of 1000" />);
    expect(screen.getByText('of 1000')).toBeInTheDocument();
  });

  it('T-18.04: sublabel is absent when not provided', () => {
    render(<KPICard label="Metric" value={10} />);
    expect(screen.queryByText('of 1000')).not.toBeInTheDocument();
  });
});
