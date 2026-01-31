import { NextRequest, NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { verification } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";

const connectionString =
  process.env.DATABASE_URL ||
  `postgresql://${process.env.DB_USER || "dabada"}:${process.env.DB_PASSWORD || "dabada_password"}@${process.env.DB_HOST || "localhost"}:${process.env.DB_PORT || "5432"}/${process.env.DB_NAME || "dabada_db"}`;

const client = postgres(connectionString);
const db = drizzle(client);

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: "Code is required" },
        { status: 400 }
      );
    }

    // verification 테이블에서 유효한 코드 찾기
    const records = await db
      .select()
      .from(verification)
      .where(
        and(
          eq(verification.identifier, "app_auth_exchange"),
          gt(verification.expiresAt, new Date())
        )
      );

    // 코드 매칭 확인
    let matchedRecord = null;
    for (const record of records) {
      try {
        const data = JSON.parse(record.value);
        if (data.code === code) {
          matchedRecord = { record, data };
          break;
        }
      } catch {
        continue;
      }
    }

    if (!matchedRecord) {
      return NextResponse.json(
        { error: "Invalid or expired code" },
        { status: 401 }
      );
    }

    const { record, data } = matchedRecord;
    const sessionToken = data.sessionToken;

    // 사용한 코드 삭제 (일회용)
    await db.delete(verification).where(eq(verification.id, record.id));

    // 세션 쿠키 설정하여 응답
    const response = NextResponse.json({ success: true });

    // better-auth 세션 쿠키 설정
    const isProduction = process.env.NODE_ENV === "production";
    response.cookies.set("better-auth.session_token", sessionToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7일
    });

    return response;
  } catch (error) {
    console.error("Exchange error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
