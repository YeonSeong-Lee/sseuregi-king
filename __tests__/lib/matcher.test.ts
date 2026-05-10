import { describe, it, expect } from 'vitest';
import { matchItem, enrichObjects, getAllItems } from '@/lib/matcher';

describe('matchItem', () => {
  it('matches exact alias', () => {
    expect(matchItem('Plastic Bottle')?.id).toBe('plastic_bottle');
  });

  it('matches case-insensitively', () => {
    expect(matchItem('aluminum can')?.id).toBe('aluminum_can');
  });

  it('matches partial alias', () => {
    expect(matchItem('soda can')?.id).toBe('aluminum_can');
  });

  it('returns null for unknown items', () => {
    expect(matchItem('unicorn')).toBeNull();
  });
});

describe('enrichObjects', () => {
  it('enriches matched objects with itemId and videoUrl', () => {
    const result = enrichObjects([{
      nameEn: 'Newspaper', nameZh: '报纸', nameJa: '新聞紙', nameRu: 'Газета',
      category: 'recycling', bbox: { x: 10, y: 10, w: 20, h: 20 },
    }]);
    expect(result[0].itemId).toBe('newspaper');
    expect(result[0].videoUrl).toContain('newspaper');
  });

  it('sets itemId null for unknown objects', () => {
    const result = enrichObjects([{
      nameEn: 'Unknown Thing', nameZh: '?', nameJa: '?', nameRu: '?',
      category: 'general', bbox: { x: 0, y: 0, w: 10, h: 10 },
    }]);
    expect(result[0].itemId).toBeNull();
    expect(result[0].videoUrl).toBeNull();
  });

  it('prefers catalog category and translations over raw values when matched', () => {
    const result = enrichObjects([{
      nameEn: 'Newspaper',
      nameZh: 'wrong-zh', nameJa: 'wrong-ja', nameRu: 'wrong-ru',
      category: 'huge',
      bbox: { x: 0, y: 0, w: 10, h: 10 },
    }]);
    expect(result[0].category).toBe('recycling');
    expect(result[0].nameZh).toBe('报纸');
    expect(result[0].nameJa).toBe('新聞紙');
    expect(result[0].nameRu).toBe('Газета');
  });

  it('falls back to raw values when no match', () => {
    const result = enrichObjects([{
      nameEn: 'Spaceship',
      nameZh: 'zh', nameJa: 'ja', nameRu: 'ru',
      category: 'general',
      bbox: { x: 0, y: 0, w: 10, h: 10 },
    }]);
    expect(result[0].nameEn).toBe('Spaceship');
    expect(result[0].nameZh).toBe('zh');
    expect(result[0].category).toBe('general');
  });
});

describe('getAllItems', () => {
  it('returns all 10 items', () => {
    expect(getAllItems()).toHaveLength(10);
  });
});
