import { describe, it, expect, vi, beforeEach } from 'vitest';

const { objectLocalizationMock } = vi.hoisted(() => ({
  objectLocalizationMock: vi.fn(),
}));

vi.mock('@google-cloud/vision', () => ({
  default: {
    ImageAnnotatorClient: function ImageAnnotatorClient() {
      return { objectLocalization: objectLocalizationMock };
    },
  },
}));

import { cloudVisionDetect } from '@/lib/vision';

beforeEach(() => objectLocalizationMock.mockReset());

describe('cloudVisionDetect', () => {
  it('converts normalizedVertices to BBox in percent coordinates', async () => {
    objectLocalizationMock.mockResolvedValue([{
      localizedObjectAnnotations: [{
        name: 'Newspaper',
        score: 0.91,
        boundingPoly: {
          normalizedVertices: [
            { x: 0.1, y: 0.2 },
            { x: 0.4, y: 0.2 },
            { x: 0.4, y: 0.6 },
            { x: 0.1, y: 0.6 },
          ],
        },
      }],
    }]);

    const result = await cloudVisionDetect('base64data');

    expect(result).toHaveLength(1);
    expect(result[0].nameEn).toBe('Newspaper');
    expect(result[0].bbox.x).toBeCloseTo(10);
    expect(result[0].bbox.y).toBeCloseTo(20);
    expect(result[0].bbox.w).toBeCloseTo(30);
    expect(result[0].bbox.h).toBeCloseTo(40);
  });

  it('drops annotations below the score threshold (0.5)', async () => {
    objectLocalizationMock.mockResolvedValue([{
      localizedObjectAnnotations: [
        { name: 'LowConf', score: 0.3, boundingPoly: { normalizedVertices: [{ x: 0, y: 0 }] } },
        { name: 'Threshold', score: 0.5, boundingPoly: { normalizedVertices: [{ x: 0, y: 0 }] } },
        { name: 'HighConf', score: 0.95, boundingPoly: { normalizedVertices: [{ x: 0, y: 0 }] } },
      ],
    }]);

    const result = await cloudVisionDetect('base64data');
    const names = result.map(r => r.nameEn);

    expect(names).not.toContain('LowConf');
    expect(names).toContain('Threshold');
    expect(names).toContain('HighConf');
  });

  it('does not throw when boundingPoly is missing', async () => {
    objectLocalizationMock.mockResolvedValue([{
      localizedObjectAnnotations: [{ name: 'NoPoly', score: 0.9 }],
    }]);

    const result = await cloudVisionDetect('base64data');
    expect(result[0].nameEn).toBe('NoPoly');
    expect(result[0].bbox).toEqual({ x: 0, y: 0, w: 0, h: 0 });
  });

  it('returns empty array when API returns no annotations', async () => {
    objectLocalizationMock.mockResolvedValue([{ localizedObjectAnnotations: [] }]);
    expect(await cloudVisionDetect('base64data')).toEqual([]);
  });
});
