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
    const response = await fetch("/api/download", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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
