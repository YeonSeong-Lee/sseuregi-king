import { NextResponse } from 'next/server';
import { analyzeImage } from '@/lib/analyze';
import { enrichObjects } from '@/lib/matcher';

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
    const rawObjects = await analyzeImage(body.image);
    const objects = enrichObjects(rawObjects);
    return NextResponse.json({ objects });
  } catch (err) {
    console.error('analyze error:', err);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
