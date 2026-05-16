import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/claude-vision', () => ({ claudeDetect: vi.fn() }));

import { claudeDetect } from '@/lib/claude-vision';
import { detectWaste } from '@/lib/detect';
import type { DetectedObject } from '@/types';

beforeEach(() => {
  vi.clearAllMocks();
});

const L4 = (s: string) => ({ en: s, zh: s, ja: s, ru: s });

const sample: DetectedObject = {
  name: 'Bottle',
  category: 'Recyclable',
  bag: 'general',
  bbox: { x: 0, y: 0, w: 50, h: 50 },
  steps: [{ visual: 'V01', text: 'Remove cap' }],
  mascotText: L4('hi'),
  funnyFact: L4('fact'),
  confidence: 'high',
};

describe('detectWaste', () => {
  it('delegates to claudeDetect and returns its result', async () => {
    vi.mocked(claudeDetect).mockResolvedValue([sample]);

    const result = await detectWaste('base64');

    expect(claudeDetect).toHaveBeenCalledWith('base64');
    expect(result).toEqual([sample]);
  });

  it('returns an empty array when Claude finds nothing', async () => {
    vi.mocked(claudeDetect).mockResolvedValue([]);

    const result = await detectWaste('base64');

    expect(result).toEqual([]);
  });

  it('propagates Claude errors to the caller', async () => {
    vi.mocked(claudeDetect).mockRejectedValue(new Error('boom'));

    await expect(detectWaste('base64')).rejects.toThrow('boom');
  });
});
