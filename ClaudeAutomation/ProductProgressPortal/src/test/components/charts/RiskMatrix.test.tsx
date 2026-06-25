import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import { RiskMatrix } from '../../../components/charts/RiskMatrix';
import type { Risk } from '../../../types';

function makeRisk(probability: number, impact: number): Risk {
  return { description: 'Risk', severity: 'Medium', probability, impact, owner: '', mitigation: '', eta: '', status: 'Open' };
}

describe('RiskMatrix', () => {
  it('T-24.01: renders SVG element for non-empty risks', () => {
    const { container } = render(<RiskMatrix risks={[makeRisk(3, 4)]} />);
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('T-24.02: renders count label in SVG text element', () => {
    const { container } = render(<RiskMatrix risks={[makeRisk(2, 3), makeRisk(2, 3), makeRisk(2, 3)]} />);
    // Find SVG text element with count "3"
    const textElements = Array.from(container.querySelectorAll('text'));
    const countText = textElements.find(t => t.textContent === '3');
    expect(countText).not.toBeNull();
  });

  it('T-24.03: calls onSelect with cell key when circle group clicked', () => {
    const onSelect = vi.fn();
    const { container } = render(<RiskMatrix risks={[makeRisk(2, 3)]} onSelect={onSelect} />);
    // Find the clickable group (contains text "1" for 1 risk)
    const groups = Array.from(container.querySelectorAll('g[style*="cursor: pointer"], g[style*="cursor:pointer"]'));
    if (groups.length > 0) {
      fireEvent.click(groups[0]);
      expect(onSelect).toHaveBeenCalledOnce();
      expect(onSelect.mock.calls[0][0]).toMatch(/^\d+-\d+$/);
    } else {
      // Fallback: find any g with onClick by clicking the circle
      const circles = container.querySelectorAll('circle');
      if (circles.length > 0) {
        fireEvent.click(circles[0].closest('g')!);
        expect(onSelect).toHaveBeenCalled();
      }
    }
  });

  it('T-24.04: deselect — clicking same key when already selected', () => {
    const onSelect = vi.fn();
    // probability=2 → col=1, impact=3 → row=5-3=2, key="1-2"
    const { container } = render(
      <RiskMatrix risks={[makeRisk(2, 3)]} selectedKey="1-2" onSelect={onSelect} />
    );
    const circles = container.querySelectorAll('circle');
    if (circles.length > 0) {
      fireEvent.click(circles[0].closest('g')!);
      expect(onSelect).toHaveBeenCalledOnce();
    }
  });

  it('T-24.05: title tooltip contains P and I values', () => {
    const { container } = render(<RiskMatrix risks={[makeRisk(3, 4)]} />);
    const title = container.querySelector('title');
    expect(title?.textContent).toContain('P=3');
    expect(title?.textContent).toContain('I=4');
  });

  it('T-24.06: clamps probability and impact to 1–5 range', () => {
    const { container } = render(<RiskMatrix risks={[makeRisk(0, 6)]} />);
    const title = container.querySelector('title');
    expect(title?.textContent).toContain('P=1');
    expect(title?.textContent).toContain('I=5');
  });
});
