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

  // Capacitor에서는 window.location.origin이 capacitor://localhost 등일 수 있으므로
  // 환경변수가 있다면 우선 사용
  return process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
}

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64 = base64String.split(",")[1];
      if (base64) resolve(base64);
      else reject(new Error("Failed to parse base64"));
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function saveVideoToNativeGallery(downloadUrl: string): Promise<{ success: boolean; error?: string }> {
  try {
    const fsPerms = await Filesystem.checkPermissions();
    if (fsPerms.publicStorage !== "granted") {
      await Filesystem.requestPermissions();
    }

    const baseURL = getApiBaseURL();
    const fullUrl = downloadUrl.startsWith("http") ? downloadUrl : `${baseURL}${downloadUrl}`;
    
    const response = await fetch(fullUrl, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch video: ${response.statusText}`);
    }

    const blob = await response.blob();
    const base64Data = await blobToBase64(blob);

    const fileName = `dabada_${Date.now()}.mp4`;
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Cache,
    });

    await Media.saveVideo({
      path: savedFile.uri,
      fileName: `dabada_${Date.now()}`,
    });

    await Filesystem.deleteFile({
      path: fileName,
      directory: Directory.Cache,
    });

    return { success: true };
  } catch (error) {
    console.error("Native save error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown native save error",
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
      credentials: "include", // 쿠키 포함
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
      credentials: "include", // 쿠키 포함
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
 * 파일 다운로드 트리거
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
