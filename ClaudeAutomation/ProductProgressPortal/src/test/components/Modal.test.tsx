import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { Modal } from '../../components/Modal';

describe('Modal', () => {
  const defaultProps = {
    title: 'Test Modal',
    onClose: vi.fn(),
    onSave: vi.fn(),
    children: <p>Modal body</p>,
  };

  it('T-19.01: renders title and children', () => {
    render(<Modal {...defaultProps} />);
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal body')).toBeInTheDocument();
  });

  it('T-19.02: calls onClose when × button clicked', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<Modal {...defaultProps} onClose={onClose} />);
    await user.click(screen.getByText('×'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('T-19.03: calls onClose when Cancel button clicked', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<Modal {...defaultProps} onClose={onClose} />);
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('T-19.04: calls onSave when Save button clicked', async () => {
    const onSave = vi.fn();
    const user = userEvent.setup();
    render(<Modal {...defaultProps} onSave={onSave} />);
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSave).toHaveBeenCalledOnce();
  });

  it('T-19.05: applies wide class when wide=true', () => {
    const { container: narrow } = render(<Modal {...defaultProps} />);
    const { container: wide } = render(<Modal {...defaultProps} wide />);
    const narrowPanel = narrow.querySelector('.max-w-lg');
    const widePanel = wide.querySelector('.max-w-3xl');
    expect(narrowPanel).not.toBeNull();
    expect(widePanel).not.toBeNull();
  });
});
