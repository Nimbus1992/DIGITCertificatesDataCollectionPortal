import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { SectionShell } from '../../components/SectionShell';

vi.mock('../../config/ConfigContext', () => ({
  useConfig: vi.fn(() => ({ isConfigured: true })),
}));

import { useConfig } from '../../config/ConfigContext';
const mockUseConfig = useConfig as ReturnType<typeof vi.fn>;

describe('SectionShell', () => {
  beforeEach(() => {
    mockUseConfig.mockReturnValue({ isConfigured: true });
  });

  it('T-21.01: shows "not configured" state when isConfigured=false', () => {
    mockUseConfig.mockReturnValue({ isConfigured: false });
    render(
      <SectionShell title="Risks" loading={false} error={null}>
        <p>Children</p>
      </SectionShell>
    );
    expect(screen.getByText(/not configured/)).toBeInTheDocument();
    expect(screen.queryByText('Children')).not.toBeInTheDocument();
  });

  it('T-21.02: shows loading spinner when loading=true', () => {
    render(
      <SectionShell title="Risks" loading={true} error={null}>
        <p>Children</p>
      </SectionShell>
    );
    expect(screen.getByText('Loading Risks…')).toBeInTheDocument();
  });

  it('T-21.03: shows error state with message and retry button', () => {
    const onRefetch = vi.fn();
    render(
      <SectionShell title="Risks" loading={false} error="Network timeout" onRefetch={onRefetch}>
        <p>Children</p>
      </SectionShell>
    );
    expect(screen.getByText('Failed to load Risks')).toBeInTheDocument();
    expect(screen.getByText('Network timeout')).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('T-21.04: calls onRefetch when retry button clicked', async () => {
    const onRefetch = vi.fn();
    const user = userEvent.setup();
    render(
      <SectionShell title="Risks" loading={false} error="Oops" onRefetch={onRefetch}>
        <p>Children</p>
      </SectionShell>
    );
    await user.click(screen.getByText('Retry'));
    expect(onRefetch).toHaveBeenCalledOnce();
  });

  it('T-21.05: shows empty state when empty=true', () => {
    render(
      <SectionShell title="Risks" loading={false} error={null} empty={true}>
        <p>Children</p>
      </SectionShell>
    );
    expect(screen.getByText('No data in Risks yet.')).toBeInTheDocument();
    expect(screen.queryByText('Children')).not.toBeInTheDocument();
  });

  it('T-21.06: renders children in normal state', () => {
    render(
      <SectionShell title="Risks" loading={false} error={null}>
        <p>Normal content</p>
      </SectionShell>
    );
    expect(screen.getByText('Normal content')).toBeInTheDocument();
  });
});
