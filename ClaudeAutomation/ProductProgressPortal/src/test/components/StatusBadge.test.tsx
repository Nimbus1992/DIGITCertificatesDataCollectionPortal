import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { StatusBadge } from '../../components/StatusBadge';

describe('StatusBadge', () => {
  it('T-16.01: renders "Green" with green classes', () => {
    render(<StatusBadge status="Green" />);
    const el = screen.getByText('Green').closest('span')!;
    expect(el).toHaveClass('bg-green-100');
    expect(el).toHaveClass('text-green-800');
  });

  it('T-16.02: renders "Amber" with amber classes', () => {
    render(<StatusBadge status="Amber" />);
    const el = screen.getByText('Amber').closest('span')!;
    expect(el).toHaveClass('bg-amber-100');
  });

  it('T-16.03: renders "Red" with red classes', () => {
    render(<StatusBadge status="Red" />);
    const el = screen.getByText('Red').closest('span')!;
    expect(el).toHaveClass('bg-red-100');
  });

  it('T-16.04: applies sm size classes', () => {
    render(<StatusBadge status="Green" size="sm" />);
    const el = screen.getByText('Green').closest('span')!;
    expect(el).toHaveClass('text-xs');
  });

  it('T-16.05: applies lg size classes', () => {
    render(<StatusBadge status="Green" size="lg" />);
    const el = screen.getByText('Green').closest('span')!;
    expect(el).toHaveClass('text-base');
  });
});
