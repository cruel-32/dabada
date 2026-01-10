import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { findVideoById } from "@/lib/db";
import { getAbsoluteFilePath } from "@/lib/download-service";
import * as fs from "fs-extra";
import * as path from "path";

/**
 * GET /api/download/[id]
 * 비디오 파일 서빙
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // 비디오 조회
    const video = await findVideoById(id);

    if (!video) {
      return NextResponse.json(
        { error: "Video not found" },
        { status: 404 }
      );
    }

    // 파일 경로 검증 (경로 트래버설 방지)
    const absolutePath = getAbsoluteFilePath(video.filePath);
    const projectRoot = process.cwd();
    const resolvedPath = path.resolve(projectRoot, absolutePath);

    // 프로젝트 루트 밖의 파일 접근 방지
    if (!resolvedPath.startsWith(projectRoot)) {
      return NextResponse.json(
        { error: "Invalid file path" },
        { status: 400 }
      );
    }

    // 파일 존재 확인
    const fileExists = await fs.pathExists(resolvedPath);
    if (!fileExists) {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      );
    }

    // 파일 정보 가져오기
    const stats = await fs.stat(resolvedPath);
    const fileSize = stats.size;

    // Range 요청 처리 (스트리밍 지원)
    const range = request.headers.get("range");
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      const fileStream = fs.createReadStream(resolvedPath, { start, end });
      const headers = {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize.toString(),
        "Content-Type": "video/mp4",
        "Content-Disposition": `attachment; filename="${path.basename(resolvedPath)}"`,
      };

      return new NextResponse(fileStream as any, {
        status: 206,
        headers,
      });
    }

    // 전체 파일 스트리밍
    const fileStream = fs.createReadStream(resolvedPath);
    const headers = {
      "Content-Length": fileSize.toString(),
      "Content-Type": "video/mp4",
      "Content-Disposition": `attachment; filename="${path.basename(resolvedPath)}"`,
      "Accept-Ranges": "bytes",
    };

    return new NextResponse(fileStream as any, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("File serving error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
