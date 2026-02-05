// src/app/api/vpn-check/route.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ALLOWED_VPN_IP = '72.14.201.167';

export function GET(request: NextRequest) {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const clientIp = forwardedFor 
    ? forwardedFor.split(',')[0].trim() 
    : '127.0.0.1'; 

  // 개발 환경이거나 IP가 일치하면 통과
  const isDev = process.env.NODE_ENV === 'development';
  const isAllowed = clientIp === ALLOWED_VPN_IP || isDev;

  return NextResponse.json({
    allowed: isAllowed,
    clientIp: clientIp,
  });
}