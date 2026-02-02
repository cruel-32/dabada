import YTDlpWrap from "yt-dlp-wrap";
import * as fs from "fs-extra";
import * as path from "path";

const DOWNLOADS_DIR = process.env.DOWNLOADS_DIR || "./downloads";
const YT_DLP_BINARY_PATH = process.env.YT_DLP_BINARY_PATH || "./yt-dlp";

let ytDlpWrapInstance: YTDlpWrap | null = null;

async function getYtDlpWrap(): Promise<YTDlpWrap> {
  if (!ytDlpWrapInstance) {
    const binaryPath = path.resolve(process.cwd(), YT_DLP_BINARY_PATH);
    if (!(await fs.pathExists(binaryPath))) {
      await YTDlpWrap.downloadFromGithub(binaryPath);
    }
    ytDlpWrapInstance = new YTDlpWrap(binaryPath);
  }
  return ytDlpWrapInstance;
}

function getDateFolderPath(): string {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];
  return path.join(DOWNLOADS_DIR, dateStr);
}

async function ensureDownloadDir(dirPath: string): Promise<void> {
  await fs.ensureDir(dirPath);
}

export async function downloadVideo(
  url: string,
  platform: "youtube" | "instagram"
): Promise<{ filePath: string; fileSize: number }> {
  const dateFolder = getDateFolderPath();
  await ensureDownloadDir(dateFolder);

  const ytDlpWrap = await getYtDlpWrap();
  const formatString = "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best";

  const commonOptions = [
    "--no-check-certificates",
    "--force-ipv4",
    "--user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    "--add-header", "Accept:text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "--add-header", "Accept-Language:en-US,en;q=0.9",
  ];

  if (platform === "youtube") {
    commonOptions.push("--extractor-args", "youtube:player-client=web;player_skip=web_embedded_player,mweb,tv");
  }

  const filenameOptions = [
    url,
    "-f", formatString,
    "--print-json",
    "--skip-download",
    "--restrict-filenames",
    "--no-playlist",
    "--force-overwrites",
    ...commonOptions,
  ];

  let fileJsonOutput;
  try {
    const output: any = await ytDlpWrap.execPromise(filenameOptions);
    let stdout = '';

    if (typeof output === 'string') {
      stdout = output;
    } else if (output && typeof output.stdout === 'string') {
      stdout = output.stdout;
    }

    if (!stdout || stdout.trim() === '' || stdout === 'undefined') {
        throw new Error(`yt-dlp did not return valid JSON metadata.`);
    }

    fileJsonOutput = JSON.parse(stdout);
  } catch (error) {
    const err = error as any;
    const stderr = err.stderr || '';
    const stdout = err.stdout || '';
    const message = err.message || "Unknown error";
    
    throw new Error(
      `Failed to get video info from yt-dlp: ${message}. Stderr: ${stderr}, Stdout: ${stdout}`
    );
  }

  const actualFilename = fileJsonOutput._filename || fileJsonOutput.title + '.mp4';
  if (!actualFilename) {
    throw new Error("Could not determine actual filename from yt-dlp metadata.");
  }

  const safeFilename = path.basename(actualFilename);
  const absDateFolder = path.resolve(process.cwd(), dateFolder);
  const finalOutputPath = path.join(absDateFolder, safeFilename);

  const downloadOptions = [
    url,
    "-f", formatString,
    "-P", absDateFolder,
    "--paths", `temp:${absDateFolder}`,
    "-o", safeFilename,
    "--no-playlist",
    "--no-warnings",
    "--restrict-filenames",
    "--force-overwrites",
    ...commonOptions,
  ];

  try {
    await ytDlpWrap.execPromise(downloadOptions);
  } catch (error) {
    throw new Error(
      `Failed to download video: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }

  const stats = await fs.stat(finalOutputPath);
  if (!stats.isFile()) {
    throw new Error(`Downloaded file is not a valid file or does not exist at ${finalOutputPath}`);
  }

  return {
    filePath: finalOutputPath,
    fileSize: stats.size,
  };
}

export function getRelativeFilePath(absolutePath: string): string {
  const projectRoot = process.cwd();
  return path.relative(projectRoot, absolutePath);
}

export function getAbsoluteFilePath(relativePath: string): string {
  const projectRoot = process.cwd();
  return path.resolve(projectRoot, relativePath);
}
