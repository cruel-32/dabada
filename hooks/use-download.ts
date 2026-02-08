"use client";

import { useState, useEffect, useCallback, useSyncExternalStore } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  requestDownload,
  triggerFileDownload,
  checkCooldown,
  DownloadResponse,
  resetCooldown,
  saveVideoToNativeGallery,
} from "@/lib/download-api";
import { DOWNLOAD_COOLDOWN_SECONDS } from "@/lib/config";
import { authClient } from "@/lib/auth-client";
import { Capacitor, type PluginListenerHandle } from "@capacitor/core";
import {
  AdMob,
  RewardAdOptions,
  RewardAdPluginEvents,
} from "@capacitor-community/admob";
import { Locale } from "@/i18n";

export type DownloadStatus =
  | "idle"
  | "checking"
  | "downloading"
  | "ready"
  | "error"
  | "cooldown"
  | "watching_ad";

export interface UseDownloadReturn {
  status: DownloadStatus;
  progress: number;
  error: string | null;
  cooldownUntil: Date | null;
  remainingCooldownSeconds: number;
  isCapacitor: boolean;
  download: (url: string, platform: "youtube" | "instagram") => Promise<void>;
  watchAdAndResetCooldown: () => Promise<void>;
  reset: () => void;
}

export function useDownload(): UseDownloadReturn {
  const [status, setStatus] = useState<DownloadStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [cooldownUntil, setCooldownUntil] = useState<Date | null>(null);
  const [remainingCooldownSeconds, setRemainingCooldownSeconds] = useState(0);
  const locale = useLocale() as Locale;
  const t = useTranslations();

  const isCapacitor = useSyncExternalStore(
    () => () => {},
    () => Capacitor.isNativePlatform(),
    () => false
  );

  const { data: session } = authClient.useSession();

  useEffect(() => {
    if (isCapacitor) {
      AdMob.initialize().catch((err) =>
        console.error("AdMob initialization failed", err)
      );
    }
  }, [isCapacitor]);

  useEffect(() => {
    const initCooldown = async () => {
      const status = await checkCooldown();
      if (status.authenticated && status.cooldownUntil) {
        setCooldownUntil(new Date(status.cooldownUntil));
        setStatus("cooldown");
      }
    };
    initCooldown();
  }, []);

  useEffect(() => {
    if (!cooldownUntil) {
      queueMicrotask(() => {
        setRemainingCooldownSeconds(0);
        if (status === "cooldown" || status === "watching_ad") {
          setStatus("idle");
        }
      });
      return;
    }

    const updateRemainingTime = () => {
      const now = new Date();
      const remaining = Math.max(
        0,
        Math.floor((cooldownUntil.getTime() - now.getTime()) / 1000)
      );

      setRemainingCooldownSeconds(remaining);

      if (remaining <= 0) {
        setCooldownUntil(null);
        setStatus("idle");
      } else if (status !== "watching_ad") {
        setStatus("cooldown");
      }
    };

    queueMicrotask(updateRemainingTime);
    const interval = setInterval(updateRemainingTime, 1000);
    return () => clearInterval(interval);
  }, [cooldownUntil, status]);

  const watchAdAndResetCooldown = useCallback(async () => {
    if (!isCapacitor || status !== "cooldown") return;

    setStatus("watching_ad");
    setError(null);

    const listeners: PluginListenerHandle[] = [];
    const cleanup = async () => {
      while (listeners.length > 0) {
        const handle = listeners.pop();
        if (handle) {
          try {
            await handle.remove();
          } catch (e) {
            console.error("Error removing listener", e);
          }
        }
      }
    };

    try {
      const adId =
        Capacitor.getPlatform() === "ios"
          ? process.env.NEXT_PUBLIC_AD_MOB_IOS_UNIT ||
            "ca-app-pub-3940256099942544/1712485313"
          : process.env.NEXT_PUBLIC_AD_MOB_ANDROID_UNIT ||
            "ca-app-pub-3940256099942544/5224354917";

      const options: RewardAdOptions = {
        adId,
      };

      let rewardEarned = false;

      listeners.push(
        await AdMob.addListener(RewardAdPluginEvents.Rewarded, () => {
          rewardEarned = true;
        })
      );

      listeners.push(
        await AdMob.addListener(RewardAdPluginEvents.Dismissed, async () => {
          await cleanup();

          if (rewardEarned) {
            const result = await resetCooldown();
            if (result.success) {
              setCooldownUntil(null);
              setRemainingCooldownSeconds(0);
              setStatus("idle");
            } else {
              setError(result.error || "Failed to reset cooldown");
              setStatus("error");
            }
          } else {
            setStatus("cooldown");
          }
        })
      );

      const handleFailure = async () => {
        await cleanup();
        setError(t("home.download.adLoadFailed"));
        setStatus("error");
      };

      listeners.push(
        await AdMob.addListener(RewardAdPluginEvents.FailedToLoad, handleFailure)
      );

      listeners.push(
        await AdMob.addListener(RewardAdPluginEvents.FailedToShow, handleFailure)
      );

      await AdMob.prepareRewardVideoAd(options);
      await AdMob.showRewardVideoAd();
    } catch (err) {
      console.error("AdMob Error:", err);
      await cleanup();
      setError(err instanceof Error ? err.message : "Ad playback error");
      setStatus("error");
    }
  }, [isCapacitor, status, t]);

  const download = useCallback(
    async (url: string, platform: "youtube" | "instagram") => {
      const isAdmin = session?.user?.role === "admin";

      if (!isAdmin && cooldownUntil && new Date() < cooldownUntil) {
        return;
      }

      setStatus("checking");
      setError(null);

      try {
        const response: DownloadResponse = await requestDownload(url, platform);

        if (!response.success) {
          if (response.cooldownUntil && !isAdmin) {
            const cooldownDate = new Date(response.cooldownUntil);
            setCooldownUntil(cooldownDate);
            setStatus("cooldown");
          } else {
            setError(response.error || "Download failed");
            setStatus("error");
          }
          return;
        }

        if (response.downloadUrl) {
          if (isCapacitor) {
            setStatus("downloading");
            setProgress(0);
            try {
              const nativeResult = await saveVideoToNativeGallery(
                response.downloadUrl,
                locale,
                (p) => setProgress(p)
              );
              if (!nativeResult.success) {
                setError(nativeResult.error || "Failed to save to gallery.");
                setStatus("error");
                return;
              }
            } catch {
              setError("An error occurred during native save.");
              setStatus("error");
              return;
            }
          } else {
            triggerFileDownload(response.downloadUrl);
          }

          if (isAdmin) {
            setCooldownUntil(null);
            setStatus("idle");
          } else {
            const now = new Date();
            const newCooldownUntil = new Date(
              now.getTime() + DOWNLOAD_COOLDOWN_SECONDS * 1000
            );
            setCooldownUntil(newCooldownUntil);
            setStatus("cooldown");
          }
        } else {
          setError("Download URL not provided");
          setStatus("error");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        setStatus("error");
      }
    },
    [isCapacitor, session, cooldownUntil, locale]
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
    setCooldownUntil(null);
    setRemainingCooldownSeconds(0);
  }, []);

  return {
    status,
    progress,
    error,
    cooldownUntil,
    remainingCooldownSeconds,
    isCapacitor,
    download,
    watchAdAndResetCooldown,
    reset,
  };
}
