import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/vision', () => ({ cloudVisionDetect: vi.fn() }));

import { cloudVisionDetect } from '@/lib/vision';
import { detectWaste } from '@/lib/detect';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('detectWaste orchestrator', () => {
  it('returns enriched Vision results when items match the catalog', async () => {
    vi.mocked(cloudVisionDetect).mockResolvedValue([
      { nameEn: 'Newspaper', nameZh: '', nameJa: '', nameRu: '', category: '',
        bbox: { x: 10, y: 10, w: 20, h: 20 } },
      { nameEn: 'Plastic bag', nameZh: '', nameJa: '', nameRu: '', category: '',
        bbox: { x: 40, y: 40, w: 20, h: 20 } },
    ]);

    const result = await detectWaste('base64');

    expect(result).toHaveLength(2);
    expect(result[0].itemId).toBe('newspaper');
    expect(result[1].itemId).toBe('plastic_bag');
  });

  it('returns unmatched Vision items with itemId === null', async () => {
    vi.mocked(cloudVisionDetect).mockResolvedValue([
      { nameEn: 'Newspaper', nameZh: '', nameJa: '', nameRu: '', category: '',
        bbox: { x: 0, y: 0, w: 10, h: 10 } },
      { nameEn: 'Banana', nameZh: '', nameJa: '', nameRu: '', category: '',
        bbox: { x: 50, y: 50, w: 10, h: 10 } },
    ]);

    const result = await detectWaste('base64');

    expect(result).toHaveLength(2);
    expect(result[0].itemId).toBe('newspaper');
    expect(result[1].itemId).toBeNull();
  });

  it('returns an empty array when Vision finds nothing', async () => {
    vi.mocked(cloudVisionDetect).mockResolvedValue([]);

    const result = await detectWaste('base64');

    expect(result).toEqual([]);
  });

  it('propagates Vision errors to the caller', async () => {
    vi.mocked(cloudVisionDetect).mockRejectedValue(new Error('auth failed'));

    await expect(detectWaste('base64')).rejects.toThrow('auth failed');
  });
});
