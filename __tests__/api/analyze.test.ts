import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/detect', () => ({
  detectWasteStream: vi.fn(),
}));

import { detectWasteStream } from '@/lib/detect';
import { POST } from '@/app/api/analyze/route';
import type { DetectedObject } from '@/types';

const L4 = (s: string) => ({ en: s, zh: s, ja: s, ru: s });

async function* yieldItems(items: DetectedObject[]): AsyncGenerator<DetectedObject> {
  for (const it of items) yield it;
}

async function* yieldThenThrow(items: DetectedObject[], err: Error): AsyncGenerator<DetectedObject> {
  for (const it of items) yield it;
  throw err;
}

async function readNdjson(res: Response): Promise<Array<{ type: string; item?: DetectedObject; error?: string }>> {
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buf = '';
  const events: Array<{ type: string; item?: DetectedObject; error?: string }> = [];
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split('\n');
    buf = lines.pop() ?? '';
    for (const line of lines) {
      if (!line.trim()) continue;
      events.push(JSON.parse(line));
    }
  }
  return events;
}

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

  it('streams item events as NDJSON followed by done', async () => {
    const mock: DetectedObject[] = [{
      name: 'Plastic',
      category: 'Recyclable',
      bag: 'recycle',
      bbox: { x: 10, y: 10, w: 20, h: 20 },
      steps: [{ visual: 'V01', text: 'Remove cap' }],
      mascotText: L4('m'),
      funnyFact: L4('f'),
      confidence: 'high',
    }];
    vi.mocked(detectWasteStream).mockReturnValue(yieldItems(mock));

    const req = new Request('http://localhost/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ image: 'base64data' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('application/x-ndjson');

    const events = await readNdjson(res);
    expect(events).toHaveLength(2);
    expect(events[0].type).toBe('item');
    expect(events[0].item?.category).toBe('Recyclable');
    expect(events[0].item?.bag).toBe('recycle');
    expect(events[1].type).toBe('done');
  });

  it('emits an error event when detect throws mid-stream', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(detectWasteStream).mockReturnValue(yieldThenThrow([], new Error('boom')));

    const req = new Request('http://localhost/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ image: 'base64data' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);

    const events = await readNdjson(res);
    const errorEvent = events.find(e => e.type === 'error');
    expect(errorEvent).toBeDefined();
    expect(errorEvent?.error).toBe('Analysis failed');
    consoleSpy.mockRestore();
  });
});
