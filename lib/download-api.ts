import { Filesystem, Directory } from "@capacitor/filesystem";
import { Media } from "@capacitor-community/media";

export interface CooldownStatus {
  authenticated: boolean;
  cooldownUntil: string | null;
  error?: string;
}

function getApiBaseURL(): string {
  if (typeof window === "undefined") {
    return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3030";
  }
  return process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
}

/**
 * 네이티브 갤러리에 비디오 저장 (Capacitor 전용 최적화)
 */
export async function saveVideoToNativeGallery(downloadUrl: string): Promise<{ success: boolean; error?: string }> {
  try {
    const baseURL = getApiBaseURL();
    const fullUrl = downloadUrl.startsWith("http") ? downloadUrl : `${baseURL}${downloadUrl}`;
    const fileName = `dabada_${Date.now()}.mp4`;

    // 1. 네이티브 다운로드 (Native Streaming)
    // Filesystem.downloadFile은 JS 스레드를 거치지 않고 직접 디스크에 스트리밍하여 대용량 파일에 적합합니다.
    const downloadResult = await Filesystem.downloadFile({
      url: fullUrl,
      path: fileName,
      directory: Directory.Cache,
      headers: {
        // 세션 쿠키는 Capacitor 브릿지를 통해 자동으로 전송되도록 시도됩니다.
      }
    });

    const fileUri = downloadResult.path;
    if (!fileUri) {
      throw new Error("다운로드 결과 경로를 찾을 수 없습니다.");
    }

    // 2. 미디어 갤러리(사진첩) 저장
    await Media.saveVideo({
      path: fileUri,
      fileName: fileName.replace(".mp4", ""),
    });

    // 3. 캐시 삭제
    await Filesystem.deleteFile({
      path: fileName,
      directory: Directory.Cache,
    });

    return { success: true };
  } catch (error) {
    console.error("Native download/save error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "네이티브 저장 중 알 수 없는 오류가 발생했습니다.",
    };
  }
}

/**
 * 쿨다운 상태 확인
 */
export async function checkCooldown(): Promise<CooldownStatus> {
  try {
    const baseURL = getApiBaseURL();
    const response = await fetch(`${baseURL}/api/download/status`, {
      credentials: "include",
    });
    if (!response.ok) {
        if (response.status === 401) {
            return { authenticated: false, cooldownUntil: null };
        }
        throw new Error("Failed to check cooldown status");
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to check cooldown:", error);
    return { authenticated: false, cooldownUntil: null, error: "Network error" };
  }
}

export interface DownloadResponse {
  success: boolean;
  videoId?: string;
  downloadUrl?: string;
  cooldownUntil?: string;
  error?: string;
}

/**
 * 다운로드 요청
 */
export async function requestDownload(
  url: string,
  platform: "youtube" | "instagram"
): Promise<DownloadResponse> {
  try {
    const baseURL = getApiBaseURL();
    const response = await fetch(`${baseURL}/api/download`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ url, platform }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || "Download request failed",
        cooldownUntil: data.cooldownUntil,
      };
    }

    return data;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}

/**
 * 쿨다운 리셋 요청 (광고 시청 후)
 */
export async function resetCooldown(): Promise<{ success: boolean; error?: string }> {
  try {
    const baseURL = getApiBaseURL();
    const response = await fetch(`${baseURL}/api/download/reset-cooldown`, {
      method: "POST",
      credentials: "include",
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}

/**
 * 브라우저 파일 다운로드 트리거 (웹용)
 */
export function triggerFileDownload(downloadUrl: string, filename?: string) {
  const link = document.createElement("a");
  link.href = downloadUrl;
  if (filename) {
    link.download = filename;
  }
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
