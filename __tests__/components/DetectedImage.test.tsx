import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DetectedImage } from '@/components/DetectedImage';
import type { DetectedObject } from '@/types';

const fixture: DetectedObject[] = [
  {
    nameEn: 'Banana peel', nameZh: '香蕉皮', nameJa: 'バナナの皮', nameRu: 'Кожура банана',
    category: 'food', bbox: { x: 10, y: 30, w: 20, h: 20 },
  },
  {
    nameEn: 'Plastic bottle', nameZh: '塑料瓶', nameJa: 'ペットボトル', nameRu: 'Пластиковая бутылка',
    category: 'plastic', bbox: { x: 60, y: 30, w: 15, h: 25 },
  },
  {
    nameEn: 'Cardboard', nameZh: '纸板', nameJa: '段ボール', nameRu: 'Картон',
    category: 'paper', bbox: { x: 40, y: 70, w: 20, h: 15 },
  },
];

describe('DetectedImage', () => {
  it('renders one dashed bbox per detected object', () => {
    render(<DetectedImage imageBase64="" objects={fixture} locale="en" />);
    const boxes = screen.getAllByTestId('bbox-rect');
    expect(boxes).toHaveLength(3);
    boxes.forEach(b => expect(b.className).toContain('border-dashed'));
  });

  it('renders the locale-appropriate label for each object', () => {
    render(<DetectedImage imageBase64="" objects={fixture} locale="ja" />);
    expect(screen.getByText('バナナの皮')).toBeTruthy();
    expect(screen.getByText('ペットボトル')).toBeTruthy();
    expect(screen.getByText('段ボール')).toBeTruthy();
  });

  it('places the bbox at the % coordinates from the object', () => {
    render(<DetectedImage imageBase64="" objects={[fixture[0]]} locale="en" />);
    const box = screen.getByTestId('bbox-rect') as HTMLElement;
    expect(box.style.left).toBe('10%');
    expect(box.style.top).toBe('30%');
    expect(box.style.width).toBe('20%');
    expect(box.style.height).toBe('20%');
  });
});
