import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DetectedItemList } from '@/components/DetectedItemList';
import type { DetectedObject } from '@/types';

function make(overrides: Partial<DetectedObject>): DetectedObject {
  return {
    name: 'Item',
    category: 'Recyclable',
    bag: 'recycle',
    bbox: { x: 0, y: 0, w: 1, h: 1 },
    steps: [{ visual: 'REMOVE_CAP_OR_LID_PUMP', text: 's' }],
    mascotText: { en: 'm', zh: 'm', ja: 'm', ru: 'm' },
    funnyFact: { en: 'f', zh: 'f', ja: 'f', ru: 'f' },
    confidence: 'high',
    ...overrides,
  };
}

const fixture: DetectedObject[] = [
  make({
    name: 'Banana peel',
    category: 'Food Waste', bag: 'food',
  }),
  make({
    name: 'Plastic bottle',
    category: 'Recyclable', bag: 'recycle',
  }),
  make({
    name: 'Cardboard',
    category: 'Recyclable', bag: 'recycle',
  }),
];

const labels = { recyclable: 'RECYCLABLE', food: 'FOOD WASTE', general: 'GENERAL' };

describe('DetectedItemList', () => {
  it('renders one row per object with the name', () => {
    render(
      <DetectedItemList objects={fixture} groupLabels={labels} onTapItem={vi.fn()} />,
    );
    // Items are non-clickable cards (commit c864679 disabled navigation on tap).
    const items = screen.getAllByRole('listitem');
    expect(items.length).toBeGreaterThanOrEqual(3);
    expect(screen.getByText('Banana peel')).toBeTruthy();
    expect(screen.getByText('Plastic bottle')).toBeTruthy();
    expect(screen.getByText('Cardboard')).toBeTruthy();
  });

  it('shows the right group label per category', () => {
    render(
      <DetectedItemList objects={fixture} groupLabels={labels} onTapItem={vi.fn()} />,
    );
    expect(screen.getByText('FOOD WASTE')).toBeTruthy();
    expect(screen.getAllByText('RECYCLABLE')).toHaveLength(2);
  });

  // onTapItem prop is currently a no-op (commit c864679 disabled navigation on tap).
  it.skip('fires onTapItem with the tapped object', async () => {
    const onTap = vi.fn();
    const user = userEvent.setup();
    render(
      <DetectedItemList objects={fixture} groupLabels={labels} onTapItem={onTap} />,
    );
    await user.click(screen.getByRole('button', { name: /Plastic bottle/ }));
    expect(onTap).toHaveBeenCalledTimes(1);
    expect(onTap).toHaveBeenCalledWith(fixture[1]);
  });

  it('numbers rows starting at 1', () => {
    render(
      <DetectedItemList objects={fixture} groupLabels={labels} onTapItem={vi.fn()} />,
    );
    // Step badges also render "1" inside each StepRow, so "1" is non-unique;
    // item-circle "2" and "3" are unique to the per-item number.
    expect(screen.getAllByText('1').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('2')).toBeTruthy();
    expect(screen.getByText('3')).toBeTruthy();
  });
});
