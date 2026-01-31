import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { nanoid } from "nanoid";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { verification } from "@/db/schema";
import LoginCompleteClient from "./client";

const connectionString =
  process.env.DATABASE_URL ||
  `postgresql://${process.env.DB_USER || "dabada"}:${process.env.DB_PASSWORD || "dabada_password"}@${process.env.DB_HOST || "localhost"}:${process.env.DB_PORT || "5432"}/${process.env.DB_NAME || "dabada_db"}`;

const client = postgres(connectionString);
const db = drizzle(client);

export default async function LoginCompletePage() {
  // 서버에서 현재 세션 확인
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("better-auth.session_token")?.value;

  let authCode: string | null = null;

  if (sessionToken) {
    // 일회용 교환 코드 생성 (5분 유효)
    authCode = nanoid(32);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5분 후 만료

    // verification 테이블에 저장
    await db.insert(verification).values({
      id: nanoid(),
      identifier: "app_auth_exchange",
      value: JSON.stringify({
        code: authCode,
        sessionToken,
      }),
      expiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  return <LoginCompleteClient authCode={authCode} />;
}
