import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/vision', () => ({ cloudVisionDetect: vi.fn() }));
vi.mock('@/lib/analyze', () => ({ analyzeImage: vi.fn() }));

import { cloudVisionDetect } from '@/lib/vision';
import { analyzeImage } from '@/lib/analyze';
import { detectWaste } from '@/lib/detect';

beforeEach(() => {
  vi.clearAllMocks();
  delete process.env.DISABLE_CLOUD_VISION;
});

describe('detectWaste orchestrator', () => {
  it('returns Vision results when all are catalog matches', async () => {
    vi.mocked(cloudVisionDetect).mockResolvedValue([
      { nameEn: 'Newspaper', nameZh: '', nameJa: '', nameRu: '', category: '',
        bbox: { x: 10, y: 10, w: 20, h: 20 } },
      { nameEn: 'Plastic bag', nameZh: '', nameJa: '', nameRu: '', category: '',
        bbox: { x: 40, y: 40, w: 20, h: 20 } },
    ]);

    const result = await detectWaste('base64');

    expect(analyzeImage).not.toHaveBeenCalled();
    expect(result).toHaveLength(2);
    expect(result[0].itemId).toBe('newspaper');
    expect(result[1].itemId).toBe('plastic_bag');
  });

  it('falls back to Claude when any Vision result is unmatched', async () => {
    vi.mocked(cloudVisionDetect).mockResolvedValue([
      { nameEn: 'Newspaper', nameZh: '', nameJa: '', nameRu: '', category: '',
        bbox: { x: 0, y: 0, w: 10, h: 10 } },
      { nameEn: 'Banana', nameZh: '', nameJa: '', nameRu: '', category: '',
        bbox: { x: 50, y: 50, w: 10, h: 10 } },
    ]);
    vi.mocked(analyzeImage).mockResolvedValue([
      { nameEn: 'Food Waste', nameZh: '厨余垃圾', nameJa: '生ごみ', nameRu: 'Пищевые отходы',
        category: 'food', bbox: { x: 50, y: 50, w: 10, h: 10 } },
    ]);

    const result = await detectWaste('base64');

    expect(analyzeImage).toHaveBeenCalledOnce();
    expect(analyzeImage).toHaveBeenCalledWith('base64');
    expect(result).toHaveLength(1);
    expect(result[0].itemId).toBe('food_waste');
  });

  it('falls back to Claude when Vision returns zero detections', async () => {
    vi.mocked(cloudVisionDetect).mockResolvedValue([]);
    vi.mocked(analyzeImage).mockResolvedValue([
      { nameEn: 'Battery', nameZh: '电池', nameJa: '電池', nameRu: 'Батарейка',
        category: 'general', bbox: { x: 0, y: 0, w: 10, h: 10 } },
    ]);

    const result = await detectWaste('base64');

    expect(analyzeImage).toHaveBeenCalledOnce();
    expect(result[0].itemId).toBe('battery');
  });

  it('falls back to Claude when Vision throws', async () => {
    vi.mocked(cloudVisionDetect).mockRejectedValue(new Error('auth failed'));
    vi.mocked(analyzeImage).mockResolvedValue([
      { nameEn: 'Newspaper', nameZh: '报纸', nameJa: '新聞紙', nameRu: 'Газета',
        category: 'recycling', bbox: { x: 0, y: 0, w: 10, h: 10 } },
    ]);

    const result = await detectWaste('base64');

    expect(analyzeImage).toHaveBeenCalledOnce();
    expect(result[0].itemId).toBe('newspaper');
  });

  it('skips Vision entirely when DISABLE_CLOUD_VISION=true', async () => {
    process.env.DISABLE_CLOUD_VISION = 'true';
    vi.mocked(analyzeImage).mockResolvedValue([
      { nameEn: 'Newspaper', nameZh: '报纸', nameJa: '新聞紙', nameRu: 'Газета',
        category: 'recycling', bbox: { x: 0, y: 0, w: 10, h: 10 } },
    ]);

    await detectWaste('base64');

    expect(cloudVisionDetect).not.toHaveBeenCalled();
    expect(analyzeImage).toHaveBeenCalledOnce();
  });
});
