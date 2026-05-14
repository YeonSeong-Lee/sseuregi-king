import { describe, it, expect } from 'vitest';
import { enrichObjects } from '@/lib/matcher';

describe('enrichObjects', () => {
  it('maps a known label to its category and pulls names from the catalog', () => {
    const result = enrichObjects([{
      nameEn: 'Newspaper', nameZh: 'wrong-zh', nameJa: 'wrong-ja', nameRu: 'wrong-ru',
      category: '', bbox: { x: 10, y: 10, w: 20, h: 20 },
    }]);
    expect(result[0].category).toBe('paper');
    expect(result[0].nameEn).toBe('Paper');
    expect(result[0].nameZh).toBe('纸类');
    expect(result[0].nameJa).toBe('紙類');
    expect(result[0].nameRu).toBe('Бумага');
  });

  it('falls back to etc for unknown labels and replaces the raw name with the localized "Other" label', () => {
    const result = enrichObjects([{
      nameEn: 'Spaceship', nameZh: 'zh', nameJa: 'ja', nameRu: 'ru',
      category: '', bbox: { x: 0, y: 0, w: 10, h: 10 },
    }]);
    expect(result[0].category).toBe('etc');
    expect(result[0].nameEn).toBe('Other ❓');
    expect(result[0].nameZh).toBe('其他 ❓');
    expect(result[0].nameJa).toBe('その他 ❓');
    expect(result[0].nameRu).toBe('Другое ❓');
  });

  it('routes plastic-ish labels via category alias even without a specific name', () => {
    const result = enrichObjects([{
      nameEn: 'Yogurt cup', nameZh: '', nameJa: '', nameRu: '',
      category: '', bbox: { x: 0, y: 0, w: 10, h: 10 },
    }]);
    expect(result[0].category).toBe('plastic');
  });

  it('routes appliance labels to large', () => {
    const result = enrichObjects([{
      nameEn: 'Refrigerator', nameZh: '', nameJa: '', nameRu: '',
      category: '', bbox: { x: 0, y: 0, w: 10, h: 10 },
    }]);
    expect(result[0].category).toBe('large');
  });

  it('classifies battery-ish labels under general', () => {
    const result = enrichObjects([{
      nameEn: 'Battery', nameZh: '', nameJa: '', nameRu: '',
      category: '', bbox: { x: 0, y: 0, w: 10, h: 10 },
    }]);
    expect(result[0].category).toBe('general');
  });
});
