// src/app/api/proxy/shot-data/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const machineId = searchParams.get('machine_id');

  // API 주소 변경됨: shot-data/latest
  const targetUrl = `http://192.168.10.176:8900/api/shot-data/latest?machine_id=${machineId}`;

  try {
    const res = await fetch(targetUrl, { cache: 'no-store' });
    
    if (!res.ok) {
      throw new Error(`External API Error: ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);

  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}