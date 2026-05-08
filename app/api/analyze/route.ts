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

  if (process.env.MOCK_ANALYZE === 'true') {
    const mock = [
      { nameEn: 'Plastic Bottle', nameZh: '塑料瓶', nameJa: 'ペットボトル', nameRu: 'Пластиковая бутылка', category: 'recycling', bbox: { x: 20, y: 15, w: 25, h: 40 } },
      { nameEn: 'Newspaper', nameZh: '报纸', nameJa: '新聞紙', nameRu: 'Газета', category: 'recycling', bbox: { x: 55, y: 20, w: 30, h: 35 } },
    ];
    return NextResponse.json({ objects: enrichObjects(mock) });
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
