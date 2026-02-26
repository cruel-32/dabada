#!/usr/bin/env node
/**
 * App Store 스크린샷 생성 (웹 URL 기준)
 * 사용: pnpm add -D puppeteer && node scripts/app-store-screenshots.mjs
 * 또는: npx puppeteer node scripts/app-store-screenshots.mjs
 *
 * 결과: screenshots-app-store/ 에 기기별 PNG 저장
 */

import { mkdir } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "screenshots-app-store");

// App Store Connect 요구 해상도 (이름, width, height)
const SIZES = [
  // iPhone
  { name: "iPhone-1242x2688-portrait", width: 1242, height: 2688 },
  { name: "iPhone-2688x1242-landscape", width: 2688, height: 1242 },
  { name: "iPhone-1284x2778-portrait", width: 1284, height: 2778 },
  { name: "iPhone-2778x1284-landscape", width: 2778, height: 1284 },
  // iPad
  { name: "iPad-2064x2752-portrait", width: 2064, height: 2752 },
  { name: "iPad-2752x2064-landscape", width: 2752, height: 2064 },
  { name: "iPad-2048x2732-portrait", width: 2048, height: 2732 },
  { name: "iPad-2732x2048-landscape", width: 2732, height: 2048 },
];

const BASE_URL = process.env.SCREENSHOT_URL || "https://dabada.cloudish.cloud/ko";

async function main() {
  let puppeteer;
  try {
    puppeteer = await import("puppeteer");
  } catch {
    console.error("puppeteer가 없습니다. 설치 후 다시 실행하세요:");
    console.error("  pnpm add -D puppeteer");
    process.exit(1);
  }

  await mkdir(OUT_DIR, { recursive: true });
  console.log("URL:", BASE_URL);
  console.log("출력 폴더:", OUT_DIR);

  // 시스템에 설치된 Chrome 사용 (Puppeteer 번들 Chrome 없을 때)
  const { existsSync } = await import("fs");
  const systemChrome =
    process.platform === "darwin"
      ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
      : process.platform === "win32"
        ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
        : "/usr/bin/google-chrome";
  const launchOptions = { headless: "new" };
  if (existsSync(systemChrome)) {
    launchOptions.executablePath = systemChrome;
  }

  let browser;
  try {
    browser = await puppeteer.default.launch(launchOptions);
  } catch (launchErr) {
    console.error(launchErr.message);
    console.error("\nChrome을 찾을 수 없습니다. 아래 중 하나를 실행하세요:");
    console.error("  1) npx puppeteer browsers install chrome");
    console.error("  2) macOS에서 Google Chrome을 설치한 뒤 다시 실행");
    process.exit(1);
  }

  try {
    for (const { name, width, height } of SIZES) {
      const page = await browser.newPage();
      await page.setViewport({ width, height, deviceScaleFactor: 1 });
      await page.goto(BASE_URL, { waitUntil: "networkidle2", timeout: 30000 });
      await page.evaluate(() => document.body.style.background = "#fff");
      await new Promise((r) => setTimeout(r, 1500));

      const path = join(OUT_DIR, `${name}.png`);
      await page.screenshot({ path, type: "png" });
      console.log("저장:", path);
      await page.close();
    }
  } finally {
    if (browser) await browser.close();
  }

  console.log("\n완료. screenshots-app-store/ 폴더를 App Store Connect에 업로드하세요.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
