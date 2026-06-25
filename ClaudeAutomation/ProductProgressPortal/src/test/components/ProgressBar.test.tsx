import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { ProgressBar } from '../../components/ProgressBar';

describe('ProgressBar', () => {
  it('T-17.01: renders correct width percentage in style', () => {
    const { container } = render(<ProgressBar value={75} max={100} />);
    const bar = container.querySelector('[style]') as HTMLElement;
    expect(bar.style.width).toBe('75%');
  });

  it('T-17.02: caps at 100% when value exceeds max', () => {
    const { container } = render(<ProgressBar value={150} max={100} />);
    const bar = container.querySelector('[style]') as HTMLElement;
    expect(bar.style.width).toBe('100%');
  });

  it('T-17.03: shows percentage label by default', () => {
    render(<ProgressBar value={75} max={100} />);
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('T-17.04: hides label when showLabel=false', () => {
    render(<ProgressBar value={75} max={100} showLabel={false} />);
    expect(screen.queryByText('75%')).not.toBeInTheDocument();
  });

  it('T-17.05: rounds to nearest integer', () => {
    render(<ProgressBar value={1} max={3} />);
    expect(screen.getByText('33%')).toBeInTheDocument();
  });
});
