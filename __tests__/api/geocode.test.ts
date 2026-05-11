import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GET } from '@/app/api/geocode/route';

const ORIGINAL_FETCH = global.fetch;
const ORIGINAL_KEY = process.env.KAKAO_REST_API_KEY;

beforeEach(() => {
  process.env.KAKAO_REST_API_KEY = 'test-key';
});

afterEach(() => {
  global.fetch = ORIGINAL_FETCH;
  if (ORIGINAL_KEY === undefined) delete process.env.KAKAO_REST_API_KEY;
  else process.env.KAKAO_REST_API_KEY = ORIGINAL_KEY;
});

function makeReq(query: string) {
  return new Request(`http://localhost/api/geocode${query}`);
}

describe('GET /api/geocode', () => {
  it('returns 400 when lat or lng is missing', async () => {
    const res = await GET(makeReq('?lat=37.5'));
    expect(res.status).toBe(400);
  });

  it('returns 400 when coords are not numeric', async () => {
    const res = await GET(makeReq('?lat=abc&lng=127'));
    expect(res.status).toBe(400);
  });

  it('returns 500 when API key is not configured', async () => {
    delete process.env.KAKAO_REST_API_KEY;
    const res = await GET(makeReq('?lat=37.5&lng=127.0'));
    expect(res.status).toBe(500);
  });

  it('returns koName from Kakao region_type=H document', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        documents: [
          { region_type: 'B', region_2depth_name: 'WRONG' },
          { region_type: 'H', region_2depth_name: '강남구' },
        ],
      }),
    }) as unknown as typeof fetch;

    const res = await GET(makeReq('?lat=37.498&lng=127.028'));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.koName).toBe('강남구');
  });

  it('falls back to first document when no H document exists', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        documents: [{ region_type: 'B', region_2depth_name: '마포구' }],
      }),
    }) as unknown as typeof fetch;

    const res = await GET(makeReq('?lat=37.555&lng=126.910'));
    const body = await res.json();
    expect(body.koName).toBe('마포구');
  });

  it('returns null koName when documents array is empty', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ documents: [] }),
    }) as unknown as typeof fetch;

    const res = await GET(makeReq('?lat=0&lng=0'));
    const body = await res.json();
    expect(body.koName).toBeNull();
  });

  it('returns 502 when Kakao response is not ok', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({}),
    }) as unknown as typeof fetch;

    const res = await GET(makeReq('?lat=37.5&lng=127.0'));
    expect(res.status).toBe(502);
  });

  it('returns 502 when Kakao fetch throws', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('network down')) as unknown as typeof fetch;
    const res = await GET(makeReq('?lat=37.5&lng=127.0'));
    expect(res.status).toBe(502);
  });

  it('passes lat to y param and lng to x param', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ documents: [{ region_type: 'H', region_2depth_name: '강남구' }] }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    await GET(makeReq('?lat=37.498&lng=127.028'));
    const calledUrl = fetchMock.mock.calls[0][0] as string;
    expect(calledUrl).toContain('x=127.028');
    expect(calledUrl).toContain('y=37.498');
  });
});
