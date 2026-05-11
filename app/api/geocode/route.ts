import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

interface KakaoDocument {
  region_type?: string;
  region_2depth_name?: string;
}

interface KakaoResponse {
  documents?: KakaoDocument[];
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const lat = url.searchParams.get('lat');
  const lng = url.searchParams.get('lng');

  if (!lat || !lng || Number.isNaN(Number(lat)) || Number.isNaN(Number(lng))) {
    return NextResponse.json({ error: 'lat and lng query params required' }, { status: 400 });
  }

  const apiKey = process.env.KAKAO_REST_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'KAKAO_REST_API_KEY is not configured' }, { status: 500 });
  }

  let res: Response;
  try {
    res = await fetch(
      `https://dapi.kakao.com/v2/local/geo/coord2regioncode.json?x=${encodeURIComponent(lng)}&y=${encodeURIComponent(lat)}`,
      { headers: { Authorization: `KakaoAK ${apiKey}` } },
    );
  } catch (err) {
    console.error('geocode network error:', err);
    return NextResponse.json({ error: 'kakao request failed' }, { status: 502 });
  }

  if (!res.ok) {
    console.error('geocode kakao non-ok:', res.status);
    return NextResponse.json({ error: 'kakao response not ok' }, { status: 502 });
  }

  const data = (await res.json()) as KakaoResponse;
  const doc =
    data.documents?.find(d => d.region_type === 'H') ?? data.documents?.[0] ?? null;
  const koName = doc?.region_2depth_name ?? null;

  return NextResponse.json({ koName });
}
