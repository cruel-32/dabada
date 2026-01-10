import YTDlpWrap from "yt-dlp-wrap";
import * as fs from "fs-extra";
import * as path from "path";
import { nanoid } from "nanoid";

const DOWNLOADS_DIR = process.env.DOWNLOADS_DIR || "./downloads";
const YT_DLP_BINARY_PATH = process.env.YT_DLP_BINARY_PATH || "./yt-dlp";

// yt-dlp 바이너리 초기화 (최초 실행 시 자동 다운로드)
let ytDlpWrapInstance: YTDlpWrap | null = null;

async function getYtDlpWrap(): Promise<YTDlpWrap> {
  if (!ytDlpWrapInstance) {
    // 바이너리가 없으면 자동 다운로드
    if (!(await fs.pathExists(YT_DLP_BINARY_PATH))) {
      await YTDlpWrap.downloadFromGithub(YT_DLP_BINARY_PATH);
    }
    ytDlpWrapInstance = new YTDlpWrap(YT_DLP_BINARY_PATH);
  }
  return ytDlpWrapInstance;
}

/**
 * 날짜별 폴더 경로 생성 (YYYY-MM-DD 형식)
 */
function getDateFolderPath(): string {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
  return path.join(DOWNLOADS_DIR, dateStr);
}

/**
 * 다운로드 폴더가 없으면 생성
 */
async function ensureDownloadDir(dirPath: string): Promise<void> {
  await fs.ensureDir(dirPath);
}

/**
 * 비디오 다운로드
 */
export async function downloadVideo(
  url: string,
  platform: "youtube" | "instagram"
): Promise<{ filePath: string; fileSize: number }> {
  // 날짜별 폴더 경로 생성
  const dateFolder = getDateFolderPath();
  await ensureDownloadDir(dateFolder);

  // 파일명 생성: {platform}-{nanoid}.mp4
  const videoId = nanoid();
  const filename = `${platform}-${videoId}.mp4`;
  const outputPath = path.join(dateFolder, filename);

  // yt-dlp-wrap 인스턴스 가져오기
  const ytDlpWrap = await getYtDlpWrap();

  // 다운로드 옵션 설정
  const options = [
    url,
    "-f", "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best", // 최고 품질 MP4
    "-o", outputPath,
    "--no-playlist", // 플레이리스트가 아닌 단일 비디오만
    "--no-warnings", // 경고 메시지 숨김
  ];

  // 다운로드 실행
  try {
    await ytDlpWrap.execPromise(options);
  } catch (error) {
    throw new Error(
      `Failed to download video: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }

  // 파일 존재 확인 및 크기 확인
  const stats = await fs.stat(outputPath);
  if (!stats.isFile()) {
    throw new Error("Downloaded file is not a valid file");
  }

  return {
    filePath: outputPath,
    fileSize: stats.size,
  };
}

/**
 * 파일 경로를 상대 경로로 변환 (DB 저장용)
 */
export function getRelativeFilePath(absolutePath: string): string {
  const projectRoot = process.cwd();
  return path.relative(projectRoot, absolutePath);
}

/**
 * 상대 경로를 절대 경로로 변환 (파일 서빙용)
 */
export function getAbsoluteFilePath(relativePath: string): string {
  const projectRoot = process.cwd();
  return path.resolve(projectRoot, relativePath);
}
