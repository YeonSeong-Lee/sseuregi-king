import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DetectedItemList } from '@/components/DetectedItemList';
import type { DetectedObject } from '@/types';

function make(overrides: Partial<DetectedObject>): DetectedObject {
  return {
    name: 'Item',
    category: 'Recyclable',
    bag: 'B03',
    bbox: { x: 0, y: 0, w: 1, h: 1 },
    steps: [{ visual: 'V01', text: 's' }],
    mascotText: { en: 'm', zh: 'm', ja: 'm', ru: 'm' },
    funnyFact: { en: 'f', zh: 'f', ja: 'f', ru: 'f' },
    confidence: 'high',
    ...overrides,
  };
}

const fixture: DetectedObject[] = [
  make({
    name: 'Banana peel',
    category: 'Food Waste', bag: 'B02',
  }),
  make({
    name: 'Plastic bottle',
    category: 'Recyclable', bag: 'B03',
  }),
  make({
    name: 'Cardboard',
    category: 'Recyclable', bag: 'B03',
  }),
];

const labels = { recyclable: 'RECYCLABLE', food: 'FOOD WASTE', general: 'GENERAL' };

describe('DetectedItemList', () => {
  it('renders one row per object with the name', () => {
    render(
      <DetectedItemList objects={fixture} groupLabels={labels} onTapItem={vi.fn()} />,
    );
    expect(screen.getAllByRole('button')).toHaveLength(3);
    expect(screen.getByRole('button', { name: /Banana peel/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Plastic bottle/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Cardboard/ })).toBeTruthy();
  });

  it('shows the right group label per category', () => {
    render(
      <DetectedItemList objects={fixture} groupLabels={labels} onTapItem={vi.fn()} />,
    );
    expect(screen.getByText('FOOD WASTE')).toBeTruthy();
    expect(screen.getAllByText('RECYCLABLE')).toHaveLength(2);
  });

  it('fires onTapItem with the tapped object', async () => {
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
    expect(screen.getByText('1')).toBeTruthy();
    expect(screen.getByText('2')).toBeTruthy();
    expect(screen.getByText('3')).toBeTruthy();
  });
});
