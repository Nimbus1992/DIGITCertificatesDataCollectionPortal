import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { Field, ListEditor } from '../../components/Field';

describe('Field', () => {
  it('T-20.01: renders label text', () => {
    render(<Field label="My Label"><input /></Field>);
    expect(screen.getByText('My Label')).toBeInTheDocument();
  });

  it('T-20.02: renders hint when provided', () => {
    render(<Field label="X" hint="Helpful tip"><input /></Field>);
    expect(screen.getByText('Helpful tip')).toBeInTheDocument();
  });
});

describe('ListEditor', () => {
  it('T-20.03: renders initial values', () => {
    render(<ListEditor values={['Alpha', 'Beta']} onChange={vi.fn()} />);
    expect(screen.getByDisplayValue('Alpha')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Beta')).toBeInTheDocument();
  });

  it('T-20.04: adds empty string on "+ Add item" click', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<ListEditor values={['Alpha']} onChange={onChange} />);
    await user.click(screen.getByText('+ Add item'));
    expect(onChange).toHaveBeenCalledWith(['Alpha', '']);
  });

  it('T-20.05: removes correct item by index on × click', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<ListEditor values={['Alpha', 'Beta', 'Gamma']} onChange={onChange} />);
    const removeButtons = screen.getAllByText('×');
    // Click the second × (index 1 = Beta)
    await user.click(removeButtons[1]);
    expect(onChange).toHaveBeenCalledWith(['Alpha', 'Gamma']);
  });

  it('T-20.06: calls onChange when input value changes', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    // Start with an empty value to avoid controlled-input clear issues
    render(<ListEditor values={['']} onChange={onChange} />);
    const input = screen.getByDisplayValue('');
    await user.type(input, 'X');
    // onChange should have been called at least once
    expect(onChange).toHaveBeenCalled();
    // Last call should contain the typed character
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(lastCall[0]).toBe('X');
  });
});
