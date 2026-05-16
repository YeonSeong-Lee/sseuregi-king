import { NextResponse } from 'next/server';
import { detectWasteStream } from '@/lib/detect';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: Request) {
  let body: { image?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.image || typeof body.image !== 'string') {
    return NextResponse.json({ error: 'image field is required' }, { status: 400 });
  }

  const image = body.image;
  const encoder = new TextEncoder();
  const upstreamAbort = new AbortController();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const onClientAbort = () => upstreamAbort.abort();
      request.signal.addEventListener('abort', onClientAbort);

      const send = (obj: unknown) => {
        controller.enqueue(encoder.encode(JSON.stringify(obj) + '\n'));
      };

      try {
        for await (const item of detectWasteStream(image, upstreamAbort.signal)) {
          send({ type: 'item', item });
        }
        send({ type: 'done' });
      } catch (err) {
        const e = err as { code?: unknown; details?: unknown; message?: unknown; name?: unknown };
        if (e.name === 'AbortError') {
          // client went away — no need to log noisily
        } else {
          console.error('analyze error:', {
            message: e.message,
            code: e.code,
            details: e.details,
            err,
          });
          try {
            send({ type: 'error', error: 'Analysis failed' });
          } catch {
            // controller may already be closed
          }
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
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
