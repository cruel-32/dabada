import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { videos, downloadLogs } from "@/db/schema";

const connectionString =
  process.env.DATABASE_URL ||
  `postgresql://${process.env.DB_USER || "dabada"}:${process.env.DB_PASSWORD || "dabada_password"}@${process.env.DB_HOST || "localhost"}:${process.env.DB_PORT || "5432"}/${process.env.DB_NAME || "dabada_db"}`;

const client = postgres(connectionString);
export const db = drizzle(client, { schema });

/**
 * 오늘 날짜로 해당 URL의 비디오가 있는지 조회
 */
export async function findVideoByUrlToday(url: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD 형식

  const result = await db
    .select()
    .from(videos)
    .where(
      and(
        eq(videos.url, url),
        eq(videos.downloadDate, todayStr)
      )
    )
    .limit(1);

  return result[0] || null;
}

/**
 * 사용자별 마지막 다운로드 시간 조회
 */
export async function getLastDownloadTime(userId: string) {
  const result = await db
    .select()
    .from(downloadLogs)
    .where(eq(downloadLogs.userId, userId))
    .orderBy(desc(downloadLogs.downloadedAt))
    .limit(1);

  return result[0] || null;
}

/**
 * 비디오 레코드 생성
 */
export async function createVideoRecord(data: {
  id: string;
  url: string;
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
