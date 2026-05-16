import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DetectedImage } from '@/components/DetectedImage';
import type { DetectedObject } from '@/types';

function make(overrides: Partial<DetectedObject>): DetectedObject {
  return {
    name: 'Item',
    category: 'Recyclable',
    bag: 'recycle',
    bbox: { x: 0, y: 0, w: 10, h: 10 },
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
    bbox: { x: 10, y: 30, w: 20, h: 20 },
  }),
  make({
    name: 'Plastic bottle',
    category: 'Recyclable', bag: 'recycle',
    bbox: { x: 60, y: 30, w: 15, h: 25 },
  }),
  make({
    name: 'Cardboard',
    category: 'Recyclable', bag: 'recycle',
    bbox: { x: 40, y: 70, w: 20, h: 15 },
  }),
];

describe('DetectedImage', () => {
  it('renders one tag per detected object (no rect)', () => {
    render(<DetectedImage imageBase64="" objects={fixture} />);
    expect(screen.getAllByTestId('bbox-tag')).toHaveLength(3);
    expect(screen.queryByTestId('bbox-rect')).toBeNull();
  });

  it('renders the English label for each object', () => {
    render(<DetectedImage imageBase64="" objects={fixture} />);
    expect(screen.getByText('Banana peel')).toBeTruthy();
    expect(screen.getByText('Plastic bottle')).toBeTruthy();
    expect(screen.getByText('Cardboard')).toBeTruthy();
  });

  it('positions the tag at the horizontal center of the bbox', () => {
    render(<DetectedImage imageBase64="" objects={[fixture[0]]} />);
    // fixture[0] bbox: x=10, w=20 → center = 20%
    const tag = screen.getByTestId('bbox-tag') as HTMLElement;
    expect(tag.style.left).toBe('20%');
  });
});
