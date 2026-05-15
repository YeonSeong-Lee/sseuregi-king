import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/vision', () => ({ cloudVisionDetect: vi.fn() }));
vi.mock('@/lib/claude-vision', () => ({ claudeDetect: vi.fn() }));

import { cloudVisionDetect } from '@/lib/vision';
import { claudeDetect } from '@/lib/claude-vision';
import { detectWaste } from '@/lib/detect';

beforeEach(() => {
  vi.clearAllMocks();
  delete process.env.DETECT_PROVIDER;
});

describe('detectWaste orchestrator', () => {
  it('returns category-enriched results when labels match the catalog', async () => {
    vi.mocked(cloudVisionDetect).mockResolvedValue([
      { nameEn: 'Newspaper', nameZh: '', nameJa: '', nameRu: '', category: '',
        bbox: { x: 10, y: 10, w: 20, h: 20 } },
      { nameEn: 'Plastic bag', nameZh: '', nameJa: '', nameRu: '', category: '',
        bbox: { x: 40, y: 40, w: 20, h: 20 } },
    ]);

    const result = await detectWaste('base64');

    expect(result).toHaveLength(2);
    expect(result[0].category).toBe('paper');
    expect(result[1].category).toBe('vinyl');
  });

  it('falls back to etc (unclear) for unmatched Vision labels', async () => {
    vi.mocked(cloudVisionDetect).mockResolvedValue([
      { nameEn: 'Newspaper', nameZh: '', nameJa: '', nameRu: '', category: '',
        bbox: { x: 0, y: 0, w: 10, h: 10 } },
      { nameEn: 'Banana', nameZh: '', nameJa: '', nameRu: '', category: '',
        bbox: { x: 50, y: 50, w: 10, h: 10 } },
    ]);

    const result = await detectWaste('base64');

    expect(result).toHaveLength(2);
    expect(result[0].category).toBe('paper');
    expect(result[1].category).toBe('etc');
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

  it('routes to claudeDetect when DETECT_PROVIDER=claude', async () => {
    process.env.DETECT_PROVIDER = 'claude';
    vi.mocked(claudeDetect).mockResolvedValue([
      { nameEn: 'Paper', nameZh: '纸类', nameJa: '紙類', nameRu: 'Бумага',
        category: 'paper', bbox: { x: 5, y: 5, w: 10, h: 10 } },
    ]);

    const result = await detectWaste('base64');

    expect(claudeDetect).toHaveBeenCalledWith('base64');
    expect(cloudVisionDetect).not.toHaveBeenCalled();
    expect(result).toHaveLength(1);
    expect(result[0].category).toBe('paper');
  });

  it('routes to Vision when DETECT_PROVIDER is unset, empty, or unknown', async () => {
    vi.mocked(cloudVisionDetect).mockResolvedValue([]);

    delete process.env.DETECT_PROVIDER;
    await detectWaste('base64');
    process.env.DETECT_PROVIDER = '';
    await detectWaste('base64');
    process.env.DETECT_PROVIDER = 'gemini';
    await detectWaste('base64');

    expect(cloudVisionDetect).toHaveBeenCalledTimes(3);
    expect(claudeDetect).not.toHaveBeenCalled();
  });

  it('skips enrichObjects on the Claude path (Claude returns categorized)', async () => {
    process.env.DETECT_PROVIDER = 'claude';
    vi.mocked(claudeDetect).mockResolvedValue([
      { nameEn: 'X', nameZh: 'X', nameJa: 'X', nameRu: 'X',
        category: 'etc', bbox: { x: 0, y: 0, w: 1, h: 1 } },
    ]);

    const result = await detectWaste('base64');

    expect(result[0].category).toBe('etc');
    expect(result[0].nameEn).toBe('X');
  });
});
