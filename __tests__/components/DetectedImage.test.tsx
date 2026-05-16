import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DetectedImage } from '@/components/DetectedImage';
import type { DetectedObject } from '@/types';

function make(overrides: Partial<DetectedObject>): DetectedObject {
  return {
    name: { en: 'Item', zh: '物', ja: 'モノ', ru: 'Предмет' },
    category: 'Recyclable',
    bag: 'B03',
    bbox: { x: 0, y: 0, w: 10, h: 10 },
    steps: [{ visual: 'V01', text: { en: 's', zh: 's', ja: 's', ru: 's' } }],
    mascotText: { en: 'm', zh: 'm', ja: 'm', ru: 'm' },
    funnyFact: { en: 'f', zh: 'f', ja: 'f', ru: 'f' },
    confidence: 'high',
    ...overrides,
  };
}

const fixture: DetectedObject[] = [
  make({
    name: { en: 'Banana peel', zh: '香蕉皮', ja: 'バナナの皮', ru: 'Кожура банана' },
    category: 'Food Waste', bag: 'B02',
    bbox: { x: 10, y: 30, w: 20, h: 20 },
  }),
  make({
    name: { en: 'Plastic bottle', zh: '塑料瓶', ja: 'ペットボトル', ru: 'Пластиковая бутылка' },
    category: 'Recyclable', bag: 'B04',
    bbox: { x: 60, y: 30, w: 15, h: 25 },
  }),
  make({
    name: { en: 'Cardboard', zh: '纸板', ja: '段ボール', ru: 'Картон' },
    category: 'Recyclable', bag: 'B03',
    bbox: { x: 40, y: 70, w: 20, h: 15 },
  }),
];

describe('DetectedImage', () => {
  it('renders one tag per detected object (no rect)', () => {
    render(<DetectedImage imageBase64="" objects={fixture} locale="en" />);
    expect(screen.getAllByTestId('bbox-tag')).toHaveLength(3);
    expect(screen.queryByTestId('bbox-rect')).toBeNull();
  });

  it('renders the locale-appropriate label for each object', () => {
    render(<DetectedImage imageBase64="" objects={fixture} locale="ja" />);
    expect(screen.getByText('バナナの皮')).toBeTruthy();
    expect(screen.getByText('ペットボトル')).toBeTruthy();
    expect(screen.getByText('段ボール')).toBeTruthy();
  });

  it('positions the tag at the horizontal center of the bbox', () => {
    render(<DetectedImage imageBase64="" objects={[fixture[0]]} locale="en" />);
    // fixture[0] bbox: x=10, w=20 → center = 20%
    const tag = screen.getByTestId('bbox-tag') as HTMLElement;
    expect(tag.style.left).toBe('20%');
  });
});
