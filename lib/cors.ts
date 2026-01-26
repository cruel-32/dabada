import { NextResponse } from "next/server";

const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3030",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3030",
  "https://dabada.cloudish.cloud",
  // Capacitor origins
  "capacitor://localhost",
  "http://localhost",
  "https://localhost",
];

/**
 * origin이 허용되는지 확인
 */
function isAllowedOrigin(origin: string): boolean {
  // 명시적 허용 목록
  if (ALLOWED_ORIGINS.includes(origin)) {
    return true;
  }

  // Capacitor origin
  if (origin.startsWith("capacitor://")) {
    return true;
  }

  // LAN IP (개발용) - 192.168.x.x, 172.x.x.x, 10.x.x.x
  const lanPattern = /^https?:\/\/(192\.168\.\d+\.\d+|172\.\d+\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?$/;
  if (lanPattern.test(origin)) {
    return true;
  }

  return false;
}

/**
 * CORS 헤더를 추가하는 함수
 */
export function corsHeaders(origin: string | null) {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, Cookie",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400",
  };

  if (origin && isAllowedOrigin(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  } else if (!origin) {
    // origin이 없는 경우 (same-origin 또는 일부 Capacitor 환경)
    headers["Access-Control-Allow-Origin"] = "*";
  }
  // origin이 있지만 허용되지 않는 경우 - Access-Control-Allow-Origin 헤더 없음 (CORS 차단)

  return headers;
}

/**
 * CORS preflight OPTIONS 응답
 */
export function handleCorsPreflightResponse(request: Request) {
  const origin = request.headers.get("origin");
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(origin),
  });
}

/**
 * NextResponse에 CORS 헤더 추가
 */
export function addCorsHeaders(response: NextResponse, request: Request) {
  const origin = request.headers.get("origin");
  const headers = corsHeaders(origin);

  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}
