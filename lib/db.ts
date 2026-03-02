import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { videos, downloadLogs, user } from "@/db/schema";
import { ANONYMOUS_USER_ID } from "@/db/schema";

const connectionString =
  process.env.DATABASE_URL ||
  `postgresql://${process.env.DB_USER || "dabada"}:${process.env.DB_PASSWORD || "dabada_password"}@${process.env.DB_HOST || "localhost"}:${process.env.DB_PORT || "5432"}/${process.env.DB_NAME || "dabada_db"}`;

const client = postgres(connectionString);
export const db = drizzle(client, { schema });

/**
 * 사용자 역할 조회
 */
export async function getUserRole(userId: string) {
  const result = await db
    .select({ role: user.role })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  return result[0]?.role || 'user';
}

/**
 * URL로 비디오 조회 (정규화된 URL 사용)
 */
export async function findVideoByUrl(url: string) {
  const result = await db
    .select()
    .from(videos)
    .where(eq(videos.url, url))
    .limit(1);

  return result[0] || null;
}

/**
 * 사용자별 마지막 다운로드 시간 조회
 */
export async function getLastDownloadTime(userId: string) {
  const result = await db
    .select({ lastDownloadAt: user.lastDownloadAt })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  return result[0]?.lastDownloadAt ? { downloadedAt: result[0].lastDownloadAt } : null;
}

/**
 * IP별 마지막 다운로드 시간 조회 (비로그인 사용자 쿨다운용)
 */
export async function getLastDownloadTimeByIp(ipAddress: string) {
  const result = await db
    .select({ downloadedAt: downloadLogs.downloadedAt })
    .from(downloadLogs)
    .where(eq(downloadLogs.ipAddress, ipAddress))
    .orderBy(desc(downloadLogs.downloadedAt))
    .limit(1);

  return result[0] ? { downloadedAt: result[0].downloadedAt } : null;
}

/**
 * 비로그인 사용자용 시스템 계정 생성/확인
 */
export async function ensureAnonymousUser() {
  const existing = await db.select().from(user).where(eq(user.id, ANONYMOUS_USER_ID)).limit(1);
  if (existing[0]) return existing[0];
  await db.insert(user).values({
    id: ANONYMOUS_USER_ID,
    name: "Anonymous",
    email: "anonymous@dabada.local",
    emailVerified: true,
    role: "user",
  }).onConflictDoNothing({ target: user.id });
  const [row] = await db.select().from(user).where(eq(user.id, ANONYMOUS_USER_ID)).limit(1);
  return row;
}

/**
 * 사용자의 마지막 다운로드 시간 업데이트
 */
export async function updateLastDownloadTime(userId: string) {
  await db
    .update(user)
    .set({ lastDownloadAt: new Date() })
    .where(eq(user.id, userId));
}

/**
 * 사용자 쿨다운 초기화 (마지막 다운로드 기록 삭제 및 필드 초기화)
 */
export async function clearUserCooldown(userId: string) {
  // 1. user 테이블의 lastDownloadAt 초기화
  await db
    .update(user)
    .set({ lastDownloadAt: null })
    .where(eq(user.id, userId));

  // 2. download_logs에서 마지막 기록 삭제 (기존 로직 호환용)
  const lastLog = await db
    .select()
    .from(downloadLogs)
    .where(eq(downloadLogs.userId, userId))
    .orderBy(desc(downloadLogs.downloadedAt))
    .limit(1);

  if (lastLog[0]) {
    await db
      .delete(downloadLogs)
      .where(eq(downloadLogs.id, lastLog[0].id));
  }
  return true;
}

/**
 * 비디오 레코드 생성
 */
export async function createVideoRecord(data: {
  id: string;
  url: string; // This will now store the normalized URL
  platform: "youtube" | "instagram";
  filePath: string;
  fileSize: number;
  userId: string;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD 형식

  const [video] = await db
    .insert(videos)
    .values({
      ...data,
      downloadDate: todayStr,
    })
    .returning();

  return video;
}

/**
 * 다운로드 로그 생성
 */
export async function createDownloadLog(data: {
  id: string;
  userId: string;
  videoId?: string | null;
  ipAddress?: string | null;
}) {
  const [log] = await db
    .insert(downloadLogs)
    .values(data)
    .returning();

  return log;
}

/**
 * 비디오 ID로 조회
 */
export async function findVideoById(id: string) {
  const result = await db
    .select()
    .from(videos)
    .where(eq(videos.id, id))
    .limit(1);

  return result[0] || null;
}
