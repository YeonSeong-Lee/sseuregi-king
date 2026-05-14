import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/detect', () => ({
  detectWaste: vi.fn(),
}));

import { detectWaste } from '@/lib/detect';
import { POST } from '@/app/api/analyze/route';
import type { DetectedObject } from '@/types';

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
    const mockEnriched: DetectedObject[] = [{
      nameEn: 'Plastic Bottle', nameZh: '塑料瓶', nameJa: 'ペットボトル', nameRu: 'Пластиковая бутылка',
      category: 'recycling', bbox: { x: 10, y: 10, w: 20, h: 20 },
      itemId: 'plastic_bottle', videoUrl: 'https://s3.../v.mp4', thumbnailUrl: 'https://s3.../t.jpg',
    }];
    vi.mocked(detectWaste).mockResolvedValue(mockEnriched);

    const req = new Request('http://localhost/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ image: 'base64data' }),
    });
    const res = await POST(req);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.objects[0].itemId).toBe('plastic_bottle');
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
