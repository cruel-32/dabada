import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { nanoid } from "nanoid";
import {
  findVideoByUrlToday,
  getLastDownloadTime,
  createVideoRecord,
  createDownloadLog,
} from "@/lib/db";
import { downloadVideo, getRelativeFilePath } from "@/lib/download-service";

const COOLDOWN_MINUTES = 5;

/**
 * 분을 밀리초로 변환
 */
function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

/**
 * POST /api/download
 * 다운로드 요청 처리
 */
export async function POST(request: NextRequest) {
  try {
    // 인증 확인
    const headers = new Headers();
    request.headers.forEach((value, key) => {
      headers.set(key, value);
    });
    
    const session = await auth.api.getSession({
      headers: headers as any,
    });

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // 요청 본문 파싱
    const body = await request.json();
    const { url, platform } = body;

    // 입력 검증
    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { success: false, error: "URL is required" },
        { status: 400 }
      );
    }

    if (!platform || !["youtube", "instagram"].includes(platform)) {
      return NextResponse.json(
        { success: false, error: "Invalid platform" },
        { status: 400 }
      );
    }

    // URL 유효성 검증
    const urlPatterns = {
      youtube: /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/,
      instagram: /^(https?:\/\/)?(www\.)?instagram\.com\/.+/,
    };

    if (!urlPatterns[platform].test(url)) {
      return NextResponse.json(
        { success: false, error: `Invalid ${platform} URL` },
        { status: 400 }
      );
    }

    // 쿨다운 체크
    const lastDownload = await getLastDownloadTime(userId);
    const now = new Date();

    if (lastDownload) {
      const cooldownUntil = addMinutes(
        lastDownload.downloadedAt,
        COOLDOWN_MINUTES
      );

      if (now < cooldownUntil) {
        return NextResponse.json({
          success: false,
          cooldownUntil: cooldownUntil.toISOString(),
          error: "Cooldown period active",
        });
      }
    }

    // 오늘 날짜로 해당 URL의 비디오가 있는지 조회
    let video = await findVideoByUrlToday(url);

    if (!video) {
      // 비디오가 없으면 다운로드 진행
      try {
        const { filePath, fileSize } = await downloadVideo(url, platform);
        const relativePath = getRelativeFilePath(filePath);

        // DB에 비디오 레코드 생성
        video = await createVideoRecord({
          id: nanoid(),
          url,
          platform,
          filePath: relativePath,
          fileSize,
          userId,
        });
      } catch (downloadError) {
        console.error("Download error:", downloadError);
        return NextResponse.json(
          {
            success: false,
            error: "Failed to download video",
            details: downloadError instanceof Error ? downloadError.message : "Unknown error",
          },
          { status: 500 }
        );
      }
    }

    // 다운로드 로그 기록
    await createDownloadLog({
      id: nanoid(),
      userId,
      videoId: video.id,
    });

    // 응답 반환
    return NextResponse.json({
      success: true,
      videoId: video.id,
      downloadUrl: `/api/download/${video.id}`,
    });
  } catch (error) {
    console.error("Download API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
