import { NextResponse } from 'next/server';
import { detectWaste } from '@/lib/detect';

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

  try {
    const objects = await detectWaste(body.image);
    return NextResponse.json({ objects });
  } catch (err) {
    const e = err as { code?: unknown; details?: unknown; message?: unknown };
    console.error('analyze error:', {
      message: e.message,
      code: e.code,
      details: e.details,
      err,
    });
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
