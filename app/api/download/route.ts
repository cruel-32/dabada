import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { nanoid } from "nanoid";
import {
  findVideoByUrl,
  getLastDownloadTime,
  createVideoRecord,
  createDownloadLog,
  getUserRole,
  updateLastDownloadTime,
} from "@/lib/db";
import { downloadVideo, getRelativeFilePath } from "@/lib/download-service";
import { normalizeUrl } from "@/lib/utils";
import { DOWNLOAD_COOLDOWN_SECONDS } from "@/lib/config";
import { addCorsHeaders, handleCorsPreflightResponse } from "@/lib/cors";

/**
 * 시간을 밀리초로 변환하여 더함
 */
function addSeconds(date: Date, seconds: number): Date {
  return new Date(date.getTime() + seconds * 1000);
}

// CORS preflight
export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflightResponse(request);
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
      const response = NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
      return addCorsHeaders(response, request);
    }

    const userId = session.user.id;

    // 요청 본문 파싱
    const body = await request.json();
    const { url, platform } = body;

    // 입력 검증
    if (!url || typeof url !== "string") {
      const response = NextResponse.json(
        { success: false, error: "URL is required" },
        { status: 400 }
      );
      return addCorsHeaders(response, request);
    }

    if (!platform || !["youtube", "instagram"].includes(platform)) {
      const response = NextResponse.json(
        { success: false, error: "Invalid platform" },
        { status: 400 }
      );
      return addCorsHeaders(response, request);
    }

    // URL 유효성 검증
    const urlPatterns = {
      youtube: /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/,
      instagram: /^(https?:\/\/)?(www\.)?instagram\.com\/.+/,
    };

    if (!urlPatterns[platform as keyof typeof urlPatterns].test(url)) {
      const response = NextResponse.json(
        { success: false, error: `Invalid ${platform} URL` },
        { status: 400 }
      );
      return addCorsHeaders(response, request);
    }

    // URL 정규화
    const normalizedUrl = normalizeUrl(url, platform);
    console.log("Normalized URL:", normalizedUrl);

    // 쿨다운 체크
    const role = await getUserRole(userId);
    if (role !== "admin") {
      const lastDownload = await getLastDownloadTime(userId);
      const now = new Date();

      if (lastDownload) {
        const cooldownUntil = addSeconds(
          lastDownload.downloadedAt,
          DOWNLOAD_COOLDOWN_SECONDS
        );

        if (now < cooldownUntil) {
          const response = NextResponse.json({
            success: false,
            cooldownUntil: cooldownUntil.toISOString(),
            error: "Cooldown period active",
          });
          return addCorsHeaders(response, request);
        }
      }
    }

    // 정규화된 URL로 이미 다운로드된 비디오가 있는지 조회
    let video = await findVideoByUrl(normalizedUrl);
    console.log("Video found in DB:", video);

    if (!video) {
      // 비디오가 없으면 다운로드 진행
      try {
        const { filePath, fileSize } = await downloadVideo(url, platform);
        const relativePath = getRelativeFilePath(filePath);

        // DB에 비디오 레코드 생성
        video = await createVideoRecord({
          id: nanoid(),
          url: normalizedUrl, // Use normalizedUrl for the unique 'url' field
          platform,
          filePath: relativePath,
          fileSize,
          userId,
        });
      } catch (downloadError) {
        console.error("Download error:", downloadError);
        const response = NextResponse.json(
          {
            success: false,
            error: "Failed to download video",
            details: downloadError instanceof Error ? downloadError.message : "Unknown error",
          },
          { status: 500 }
        );
        return addCorsHeaders(response, request);
      }
    }

    // 다운로드 로그 기록 및 사용자 필드 업데이트
    await createDownloadLog({
      id: nanoid(),
      userId,
      videoId: video.id,
    });
    await updateLastDownloadTime(userId);

    // 응답 반환
    const response = NextResponse.json({
      success: true,
      videoId: video.id,
      downloadUrl: `/api/download/${video.id}`,
    });
    return addCorsHeaders(response, request);
  } catch (error) {
    console.error("Download API error:", error);
    const response = NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
    return addCorsHeaders(response, request);
  }
}
