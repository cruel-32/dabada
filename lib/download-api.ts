import { Filesystem, Directory } from "@capacitor/filesystem";
import { Toast } from "@capacitor/toast";
import { LocalNotifications } from "@capacitor/local-notifications";
import { Share } from "@capacitor/share";
import { getTranslations } from "./i18n";
import { Locale } from "@/i18n";

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
 * 네이티브 알림 발송
 */
async function sendNativeNotification(title: string, body: string) {
  try {
    const perm = await LocalNotifications.checkPermissions();
    if (perm.display !== "granted") {
      await LocalNotifications.requestPermissions();
    }
    await LocalNotifications.schedule({
      notifications: [
        {
          title,
          body,
          id: Math.floor(Math.random() * 10000),
          schedule: { at: new Date(Date.now() + 100) },
          sound: "default",
        },
      ],
    });
  } catch (err) {
    console.error("Failed to send notification:", err);
  }
}

export async function saveVideoToNativeGallery(
  downloadUrl: string,
  locale: Locale,
  onProgress?: (progress: number) => void
): Promise<{ success: boolean; error?: string }> {
  const t = await getTranslations(locale);

  try {
    const baseURL = getApiBaseURL();
    const fullUrl = downloadUrl.startsWith("http")
      ? downloadUrl
      : `${baseURL}${downloadUrl}`;
    const downloadId = `dl_${Date.now()}`;
    const fileName = `${downloadId}.mp4`;

    await Toast.show({
      text: t("home.download.native.start"),
      duration: "short",
    });

    try {
      const downloadResult = await Filesystem.downloadFile({
        url: fullUrl,
        path: fileName,
        directory: Directory.Cache,
        progress: true,
        onProgress: (status) => {
          if (onProgress) {
            const progress = (status.bytes) / (status.contentLength);
            onProgress(Math.round(progress * 100));
          }
        },
      });

      const fileUri = downloadResult.path;
      if (!fileUri) {
        throw new Error(t("home.download.native.noPath"));
      }

      await Share.share({
        title: t("home.download.native.shareTitle"),
        text: t("home.download.native.shareText"),
        url: fileUri,
        dialogTitle: t("home.download.native.shareDialogTitle"),
      });
    } catch (err) {
      throw err;
    }

    await sendNativeNotification(
      t("home.download.native.successTitle"),
      t("home.download.native.successBody")
    );

    return { success: true };
  } catch (error) {
    console.error("Native download/save error:", error);

    await Toast.show({
      text: t("home.download.native.errorToast"),
      duration: "long",
    });

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : t("home.download.native.errorUnknown"),
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
