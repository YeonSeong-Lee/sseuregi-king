import { NextResponse } from 'next/server';
import { detectWaste } from '@/lib/detect';

export const runtime = 'nodejs';
export const maxDuration = 30;

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
    console.error('analyze error:', err);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
