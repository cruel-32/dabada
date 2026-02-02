import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { clearUserCooldown } from "@/lib/db";
import { addCorsHeaders, handleCorsPreflightResponse } from "@/lib/cors";

// CORS preflight
export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflightResponse(request);
}

/**
 * POST /api/download/reset-cooldown
 * 광고 시청 후 쿨다운 초기화
 */
export async function POST(request: NextRequest) {
  try {
    const headers = new Headers();
    request.headers.forEach((value, key) => {
      headers.set(key, value);
    });

    const session = await auth.api.getSession({
      headers: headers as any,
    });

    if (!session?.user) {
      const response = NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
      return addCorsHeaders(response, request);
    }

    const userId = session.user.id;
    const success = await clearUserCooldown(userId);

    const response = NextResponse.json({
      success,
      error: success ? undefined : "No active cooldown to reset",
    });
    return addCorsHeaders(response, request);
  } catch (error) {
    console.error("Reset cooldown error:", error);
    const response = NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
    return addCorsHeaders(response, request);
  }
}
