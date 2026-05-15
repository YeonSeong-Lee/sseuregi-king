import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DetectedItemList } from '@/components/DetectedItemList';
import type { DetectedObject } from '@/types';

const fixture: DetectedObject[] = [
  {
    nameEn: 'Banana peel', nameZh: '香蕉皮', nameJa: 'バナナの皮', nameRu: 'Кожура банана',
    category: 'food', bbox: { x: 0, y: 0, w: 1, h: 1 },
  },
  {
    nameEn: 'Plastic bottle', nameZh: '塑料瓶', nameJa: 'ペットボトル', nameRu: 'Пластиковая бутылка',
    category: 'plastic', bbox: { x: 0, y: 0, w: 1, h: 1 },
  },
  {
    nameEn: 'Cardboard', nameZh: '纸板', nameJa: '段ボール', nameRu: 'Картон',
    category: 'paper', bbox: { x: 0, y: 0, w: 1, h: 1 },
  },
];

const labels = { recyclable: 'RECYCLABLE', food: 'FOOD WASTE', general: 'GENERAL' };

describe('DetectedItemList', () => {
  it('renders one row per object with the localized name', () => {
    render(
      <DetectedItemList objects={fixture} locale="en" groupLabels={labels} onTapItem={vi.fn()} />,
    );
    expect(screen.getAllByRole('button')).toHaveLength(3);
    expect(screen.getByRole('button', { name: /Banana peel/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Plastic bottle/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Cardboard/ })).toBeTruthy();
  });

  it('shows the right group label per category', () => {
    render(
      <DetectedItemList objects={fixture} locale="en" groupLabels={labels} onTapItem={vi.fn()} />,
    );
    expect(screen.getByText('FOOD WASTE')).toBeTruthy();
    expect(screen.getAllByText('RECYCLABLE')).toHaveLength(2);
  });

  it('fires onTapItem with the tapped object', async () => {
    const onTap = vi.fn();
    const user = userEvent.setup();
    render(
      <DetectedItemList objects={fixture} locale="en" groupLabels={labels} onTapItem={onTap} />,
    );
    await user.click(screen.getByRole('button', { name: /Plastic bottle/ }));
    expect(onTap).toHaveBeenCalledTimes(1);
    expect(onTap).toHaveBeenCalledWith(fixture[1]);
  });

  it('numbers rows starting at 1', () => {
    render(
      <DetectedItemList objects={fixture} locale="en" groupLabels={labels} onTapItem={vi.fn()} />,
    );
    expect(screen.getByText('1')).toBeTruthy();
    expect(screen.getByText('2')).toBeTruthy();
    expect(screen.getByText('3')).toBeTruthy();
  });

  it('uses the locale name field for labels', () => {
    render(
      <DetectedItemList objects={fixture} locale="ja" groupLabels={labels} onTapItem={vi.fn()} />,
    );
    expect(screen.getByText('バナナの皮')).toBeTruthy();
    expect(screen.getByText('ペットボトル')).toBeTruthy();
  });
});
