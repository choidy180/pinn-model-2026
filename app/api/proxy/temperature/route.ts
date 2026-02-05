// src/app/api/proxy/temperature/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  // 1. 쿼리 파라미터 가져오기 (?machine_id=200.1)
  const searchParams = request.nextUrl.searchParams;
  const machineId = searchParams.get('machine_id');

  if (!machineId) {
    return NextResponse.json({ error: 'Machine ID is required' }, { status: 400 });
  }

  try {
    // 2. Next.js 서버가 실제 외부 API로 요청 (서버 간 통신이므로 CORS 없음)
    const targetUrl = `http://192.168.10.176:8900/api/temperature/current?machine_id=${machineId}`;
    
    const res = await fetch(targetUrl, {
      cache: 'no-store', // 실시간 데이터이므로 캐시 안 함
    });

    if (!res.ok) {
      throw new Error(`External API Error: ${res.status}`);
    }

    const data = await res.json();

    // 3. 받아온 데이터를 브라우저에게 그대로 전달
    return NextResponse.json(data);

  } catch (error) {
    console.error('Proxy Error:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}