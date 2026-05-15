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

  it('routes large appliances and furniture to large', () => {
    const cases = ['Refrigerator', 'Sofa', 'Washing machine', 'TV'];
    for (const nameEn of cases) {
      const result = enrichObjects([{
        nameEn, nameZh: '', nameJa: '', nameRu: '',
        category: '', bbox: { x: 0, y: 0, w: 10, h: 10 },
      }]);
      expect(result[0].category, nameEn).toBe('large');
    }
  });

  it('routes small electronics to e_waste, not large', () => {
    const cases = ['Phone', 'Smartphone', 'Tablet', 'Laptop', 'Monitor', 'Microwave'];
    for (const nameEn of cases) {
      const result = enrichObjects([{
        nameEn, nameZh: '', nameJa: '', nameRu: '',
        category: '', bbox: { x: 0, y: 0, w: 10, h: 10 },
      }]);
      expect(result[0].category, nameEn).toBe('e_waste');
    }
  });

  it('does not force the broad "Appliance" hypernym into large — falls back to etc', () => {
    const result = enrichObjects([{
      nameEn: 'Appliance', nameZh: '', nameJa: '', nameRu: '',
      category: '', bbox: { x: 0, y: 0, w: 10, h: 10 },
    }]);
    expect(result[0].category).toBe('etc');
  });

  it('classifies battery-ish labels under general', () => {
    const result = enrichObjects([{
      nameEn: 'Battery', nameZh: '', nameJa: '', nameRu: '',
      category: '', bbox: { x: 0, y: 0, w: 10, h: 10 },
    }]);
    expect(result[0].category).toBe('general');
  });
});
