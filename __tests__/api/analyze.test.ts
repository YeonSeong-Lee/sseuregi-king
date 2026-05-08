import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/analyze', () => ({
  analyzeImage: vi.fn(),
}));
vi.mock('@/lib/matcher', () => ({
  enrichObjects: vi.fn(),
}));

import { analyzeImage } from '@/lib/analyze';
import { enrichObjects } from '@/lib/matcher';
import { POST } from '@/app/api/analyze/route';

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

  it('returns enriched objects on success', async () => {
    const mockRaw = [{ nameEn: 'Plastic Bottle', nameZh: '塑料瓶', nameJa: 'ペットボトル', nameRu: 'Пластиковая бутылка', category: 'recycling', bbox: { x: 10, y: 10, w: 20, h: 20 } }];
    const mockEnriched = [{ ...mockRaw[0], itemId: 'plastic_bottle', videoUrl: 'https://s3.../v.mp4', thumbnailUrl: 'https://s3.../t.jpg' }];
    vi.mocked(analyzeImage).mockResolvedValue(mockRaw);
    vi.mocked(enrichObjects).mockReturnValue(mockEnriched as any);

    const req = new Request('http://localhost/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ image: 'base64data' }),
    });
    const res = await POST(req);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.objects[0].itemId).toBe('plastic_bottle');
  });
});
