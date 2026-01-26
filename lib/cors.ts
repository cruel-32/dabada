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
 * CORS 헤더를 추가하는 함수
 */
export function corsHeaders(origin: string | null) {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, Cookie",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400",
  };

  // origin이 허용 목록에 있거나 Capacitor origin인 경우
  if (origin && (ALLOWED_ORIGINS.includes(origin) || origin.startsWith("capacitor://"))) {
    headers["Access-Control-Allow-Origin"] = origin;
  } else if (!origin) {
    // origin이 없는 경우 (same-origin 또는 일부 Capacitor 환경)
    headers["Access-Control-Allow-Origin"] = "*";
  }

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
