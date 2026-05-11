import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ObjectOverlay } from '@/components/ObjectOverlay';
import type { DetectedObject } from '@/types';

const fixture: DetectedObject[] = [
  {
    nameEn: 'Plastic Bottle', nameZh: '塑料瓶', nameJa: 'ペットボトル', nameRu: 'Пластиковая бутылка',
    category: 'recycling', bbox: { x: 10, y: 10, w: 10, h: 10 },
    itemId: 'plastic_bottle', videoUrl: null, thumbnailUrl: null,
  },
  {
    nameEn: 'Food Waste', nameZh: '厨余垃圾', nameJa: '生ごみ', nameRu: 'Пищевые отходы',
    category: 'food', bbox: { x: 30, y: 10, w: 10, h: 10 },
    itemId: 'food_waste', videoUrl: null, thumbnailUrl: null,
  },
  {
    nameEn: 'Plastic Bag', nameZh: '塑料袋', nameJa: 'ビニール袋', nameRu: 'Полиэтиленовый пакет',
    category: 'general', bbox: { x: 50, y: 10, w: 10, h: 10 },
    itemId: 'plastic_bag', videoUrl: null, thumbnailUrl: null,
  },
  {
    nameEn: 'Phone', nameZh: '手机', nameJa: '電話', nameRu: 'Телефон',
    category: 'large', bbox: { x: 70, y: 10, w: 10, h: 10 },
    itemId: 'electronic_waste', videoUrl: null, thumbnailUrl: null,
  },
];

function renderOverlay(objects: DetectedObject[] = fixture) {
  return render(
    <ObjectOverlay
      imageBase64=""
      objects={objects}
      locale="en"
      tapHint="Tap an object"
      seeGuideLabel="See Guide"
      selectAllLabel="Select all"
      deselectAllLabel="Deselect all"
      onSeeGuide={vi.fn()}
    />
  );
}

describe('ObjectOverlay category colors', () => {
  it('renders each category with its mapped background class', () => {
    renderOverlay();
    expect(screen.getByRole('button', { name: 'Plastic Bottle' }).className).toContain('bg-blue-500');
    expect(screen.getByRole('button', { name: 'Food Waste' }).className).toContain('bg-emerald-500');
    expect(screen.getByRole('button', { name: 'Plastic Bag' }).className).toContain('bg-zinc-600');
    expect(screen.getByRole('button', { name: 'Phone' }).className).toContain('bg-orange-500');
  });

  it('toggles ring-2 on the tag when tapped, keeping its category color', async () => {
    const user = userEvent.setup();
    renderOverlay();
    const food = screen.getByRole('button', { name: 'Food Waste' });

    expect(food.className).not.toContain('ring-2');

    await user.click(food);
    expect(food.className).toContain('ring-2');
    expect(food.className).toContain('bg-emerald-500');

    await user.click(food);
    expect(food.className).not.toContain('ring-2');
    expect(food.className).toContain('bg-emerald-500');
  });
});

describe('ObjectOverlay select-all toggle', () => {
  it('selects every tag, then deselects, flipping the label between calls', async () => {
    const user = userEvent.setup();
    renderOverlay();

    const tagNames = fixture.map(o => o.nameEn);
    const tagButtons = () => tagNames.map(n => screen.getByRole('button', { name: n }));

    tagButtons().forEach(b => expect(b.className).not.toContain('ring-2'));

    await user.click(screen.getByRole('button', { name: 'Select all' }));
    tagButtons().forEach(b => expect(b.className).toContain('ring-2'));

    await user.click(screen.getByRole('button', { name: 'Deselect all' }));
    tagButtons().forEach(b => expect(b.className).not.toContain('ring-2'));
    expect(screen.getByRole('button', { name: 'Select all' })).toBeTruthy();
  });

  it('flips label back to "Select all" when one tag is manually deselected after select-all', async () => {
    const user = userEvent.setup();
    renderOverlay();

    await user.click(screen.getByRole('button', { name: 'Select all' }));
    expect(screen.getByRole('button', { name: 'Deselect all' })).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Food Waste' }));
    expect(screen.getByRole('button', { name: 'Select all' })).toBeTruthy();
  });

  it('disables the toggle when no objects are detected', () => {
    renderOverlay([]);
    expect(screen.getByRole('button', { name: 'Select all' }).hasAttribute('disabled')).toBe(true);
  });
});
