import { describe, it, expect } from 'vitest';
import { enrichObjects } from '@/lib/matcher';

describe('enrichObjects', () => {
  it('promotes to the matching trash item and preserves detector translations', () => {
    const result = enrichObjects([{
      nameEn: 'Newspaper', nameZh: '报纸', nameJa: '新聞', nameRu: 'Газета',
      category: '', bbox: { x: 10, y: 10, w: 20, h: 20 },
    }]);
    expect(result[0].category).toBe('paper');
    expect(result[0].trashItemId).toBe('newspaper_office_paper');
    expect(result[0].nameEn).toBe('Newspaper / office paper');
    // Detector-supplied locale names are preserved when the item's translation is empty.
    expect(result[0].nameZh).toBe('报纸');
    expect(result[0].nameJa).toBe('新聞');
    expect(result[0].nameRu).toBe('Газета');
  });

  it('falls back to the item English name for locales the detector did not translate', () => {
    const result = enrichObjects([{
      nameEn: 'Cardboard box', nameZh: '', nameJa: '', nameRu: '',
      category: '', bbox: { x: 0, y: 0, w: 10, h: 10 },
    }]);
    expect(result[0].category).toBe('paper');
    expect(result[0].trashItemId).toBe('cardboard_box');
    expect(result[0].nameEn).toBe('Cardboard box');
    expect(result[0].nameZh).toBe('Cardboard box');
    expect(result[0].nameJa).toBe('Cardboard box');
    expect(result[0].nameRu).toBe('Cardboard box');
  });

  it('falls back to etc for unknown labels but still shows the raw name with a ❓ marker', () => {
    const result = enrichObjects([{
      nameEn: 'Spaceship', nameZh: '', nameJa: '', nameRu: '',
      category: '', bbox: { x: 0, y: 0, w: 10, h: 10 },
    }]);
    expect(result[0].category).toBe('etc');
    expect(result[0].nameEn).toBe('Spaceship ❓');
    expect(result[0].nameZh).toBe('Spaceship ❓');
    expect(result[0].nameJa).toBe('Spaceship ❓');
    expect(result[0].nameRu).toBe('Spaceship ❓');
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

  it('routes batteries to the e_waste/hazardous bucket via the trash-items catalog', () => {
    const result = enrichObjects([{
      nameEn: 'Battery', nameZh: '', nameJa: '', nameRu: '',
      category: '', bbox: { x: 0, y: 0, w: 10, h: 10 },
    }]);
    // Item-level match wins: batteries item routes to e_waste (drop-off collection),
    // overriding the legacy general-waste alias.
    expect(result[0].category).toBe('e_waste');
    expect(result[0].trashItemId).toBe('batteries');
  });
});
