import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/detect', () => ({
  detectWaste: vi.fn(),
}));

import { detectWaste } from '@/lib/detect';
import { POST } from '@/app/api/analyze/route';
import type { DetectedObject } from '@/types';

const L4 = (s: string) => ({ en: s, zh: s, ja: s, ru: s });

describe('POST /api/analyze', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 400 when image field is missing', async () => {
    const req = new Request('http://localhost/api/analyze', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns detected objects on success', async () => {
    const mock: DetectedObject[] = [{
      name: L4('Plastic'),
      category: 'Recyclable',
      bag: 'B03',
      bbox: { x: 10, y: 10, w: 20, h: 20 },
      steps: [{ visual: 'V01', text: L4('Remove cap') }],
      mascotText: L4('m'),
      funnyFact: L4('f'),
      confidence: 'high',
    }];
    vi.mocked(detectWaste).mockResolvedValue(mock);

    const req = new Request('http://localhost/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ image: 'base64data' }),
    });
    const res = await POST(req);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.objects[0].category).toBe('Recyclable');
    expect(body.objects[0].bag).toBe('B03');
  });

  it('returns 500 when detect throws', async () => {
    vi.mocked(detectWaste).mockRejectedValue(new Error('boom'));

    const req = new Request('http://localhost/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ image: 'base64data' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(500);
  });
});
