import { NextResponse } from 'next/server';
import { streamGuideText } from '@/lib/claude-guide-text';
import type { DetectedObject, Locale } from '@/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

const VALID_LOCALES = new Set<Locale>(['en', 'zh', 'ja', 'ru']);

export async function POST(request: Request) {
  let body: { items?: unknown; locale?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: 'items must be a non-empty array' }, { status: 400 });
  }

  const locale: Locale =
    typeof body.locale === 'string' && VALID_LOCALES.has(body.locale as Locale)
      ? (body.locale as Locale)
      : 'en';

  const objects = body.items as DetectedObject[];
  const encoder = new TextEncoder();
  const upstreamAbort = new AbortController();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const onClientAbort = () => upstreamAbort.abort();
      request.signal.addEventListener('abort', onClientAbort);

      try {
        for await (const chunk of streamGuideText(objects, locale, upstreamAbort.signal)) {
          controller.enqueue(encoder.encode(chunk));
        }
      } catch (err) {
        const e = err as { name?: unknown };
        if (e.name !== 'AbortError') {
          console.error('guide-text error:', err);
        }
      } finally {
        request.signal.removeEventListener('abort', onClientAbort);
        try {
          controller.close();
        } catch {
          // already closed
        }
      }
    },
    cancel() {
      upstreamAbort.abort();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
