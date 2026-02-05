// src/app/api/proxy/vision-inspect/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const limit = searchParams.get('limit') || '10';

  // 비전 검사 이력 API
  const targetUrl = `http://192.168.10.176:8900/api/vision-inspect/records?limit=${limit}`;

  try {
    const res = await fetch(targetUrl, { cache: 'no-store' });
    
    if (!res.ok) {
      throw new Error(`External API Error: ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);

  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch vision data' }, { status: 500 });
  }
}