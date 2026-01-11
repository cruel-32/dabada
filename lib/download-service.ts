import YTDlpWrap from "yt-dlp-wrap";
import * as fs from "fs-extra";
import * as path from "path";
// import { nanoid } from "nanoid"; // nanoid no longer needed for filename

const DOWNLOADS_DIR = process.env.DOWNLOADS_DIR || "./downloads";
const YT_DLP_BINARY_PATH = process.env.YT_DLP_BINARY_PATH || "./yt-dlp";

// yt-dlp 바이너리 초기화 (최초 실행 시 자동 다운로드)
let ytDlpWrapInstance: YTDlpWrap | null = null;

async function getYtDlpWrap(): Promise<YTDlpWrap> {
  if (!ytDlpWrapInstance) {
    const binaryPath = path.resolve(process.cwd(), YT_DLP_BINARY_PATH);
    // 바이너리가 없으면 자동 다운로드
    if (!(await fs.pathExists(binaryPath))) {
      await YTDlpWrap.downloadFromGithub(binaryPath);
    }
    ytDlpWrapInstance = new YTDlpWrap(binaryPath);
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
  // 날짜별 폴더 경로 생성 및 확인
  const dateFolder = getDateFolderPath();
  await ensureDownloadDir(dateFolder);

  // yt-dlp-wrap 인스턴스 가져오기
  const ytDlpWrap = await getYtDlpWrap();

  // 포맷 옵션 정의 (메타데이터 조회와 다운로드 모두에 동일하게 적용해야 확장자가 일치함)
  const formatString = "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best";

  // 1단계: yt-dlp로부터 실제 파일명 얻기
  const filenameOptions = [
    url,
    "-f", formatString, // 포맷 옵션 추가
    "--print-json", // JSON 형식으로 메타데이터 출력
    "--skip-download", // 다운로드 방지 (중요: 루트에 파일 생성 방지)
    "--restrict-filenames", // 파일명을 안전한 문자로 제한
    "--no-playlist", // 플레이리스트가 아닌 단일 비디오만
    "--force-overwrites", // 이미 파일이 있을 경우 덮어쓰기
  ];
  let fileJsonOutput;
  try {
    // execPromise returns an object with stdout, stderr, etc. OR just the stdout string
    const output: any = await ytDlpWrap.execPromise(filenameOptions);
    let stdout = '';

    if (typeof output === 'string') {
      stdout = output;
    } else if (output && typeof output.stdout === 'string') {
      stdout = output.stdout;
    }

    // stdout 유효성 검사 추가
    if (!stdout || stdout.trim() === '' || stdout === 'undefined') {
        console.error('yt-dlp returned invalid output:', output);
        throw new Error(`yt-dlp did not return valid JSON metadata. Output Type: ${typeof output}`);
    }

    fileJsonOutput = JSON.parse(stdout);
  } catch (error) {
    // 에러 객체에 stdout/stderr가 포함되어 있을 수 있음 (yt-dlp-wrap 특성)
    const err = error as any;
    const stderr = err.stderr || '';
    const stdout = err.stdout || '';
    const message = err.message || "Unknown error";
    
    throw new Error(
      `Failed to get video info from yt-dlp: ${message}. Stderr: ${stderr}, Stdout: ${stdout}`
    );
  }

  // yt-dlp가 사용할 최종 파일명 추출
  // '_filename'이 가장 정확하며, 없으면 'title' 등으로 대체 가능.
  // 여기서는 _filename이 가장 신뢰할 수 있다고 가정합니다.
  const actualFilename = fileJsonOutput._filename || fileJsonOutput.title + '.mp4'; // fallback
  if (!actualFilename) {
    throw new Error("Could not determine actual filename from yt-dlp metadata.");
  }

  // 경로 문제 방지를 위해 파일명만 추출
  const safeFilename = path.basename(actualFilename);
  
  // 절대 경로로 폴더 지정
  const absDateFolder = path.resolve(process.cwd(), dateFolder);
  
  // 실제 파일이 저장될 전체 경로 (검증용)
  const finalOutputPath = path.join(absDateFolder, safeFilename);


  // 2단계: 실제 파일명으로 다운로드 실행
  const downloadOptions = [
    url,
    "-f", formatString, // 저장된 포맷 옵션 사용
    "-P", absDateFolder, // 다운로드 경로 지정
    "--paths", `temp:${absDateFolder}`, // 임시 파일 경로 지정 (루트 생성 방지)
    "-o", safeFilename, // 파일명 지정
    "--no-playlist", // 플레이리스트가 아닌 단일 비디오만
    "--no-warnings", // 경고 메시지 숨김
    "--restrict-filenames", // 파일명을 안전한 문자로 제한
    "--force-overwrites", // 이미 파일이 있을 경우 덮어쓰기
  ];

  try {
    await ytDlpWrap.execPromise(downloadOptions);
  } catch (error) {
    throw new Error(
      `Failed to download video: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }

  // 파일 존재 확인 및 크기 확인
  const stats = await fs.stat(finalOutputPath);
  if (!stats.isFile()) {
    throw new Error(`Downloaded file is not a valid file or does not exist at ${finalOutputPath}`);
  }

  return {
    filePath: finalOutputPath,
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
