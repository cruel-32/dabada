"use client";

import { useState, useEffect, useCallback } from "react";
import { requestDownload, triggerFileDownload, checkCooldown, DownloadResponse, resetCooldown } from "@/lib/download-api";
import { DOWNLOAD_COOLDOWN_SECONDS } from "@/lib/config";
import { authClient } from "@/lib/auth-client";
import { Capacitor } from "@capacitor/core";

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
  error: string | null;
  cooldownUntil: Date | null;
  remainingCooldownSeconds: number;
  isCapacitor: boolean;
  download: (url: string, platform: "youtube" | "instagram") => Promise<void>;
  watchAdAndResetCooldown: () => Promise<void>;
  reset: () => void;
}

/**
 * 다운로드 상태 및 쿨다운 타이머 관리 훅
 */
export function useDownload(): UseDownloadReturn {
  const [status, setStatus] = useState<DownloadStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [cooldownUntil, setCooldownUntil] = useState<Date | null>(null);
  const [remainingCooldownSeconds, setRemainingCooldownSeconds] = useState(0);
  const [isCapacitor, setIsCapacitor] = useState(false);

  // Get session data
  const { data: session } = authClient.useSession();

  // Capacitor 여부 확인
  useEffect(() => {
    setIsCapacitor(Capacitor.isNativePlatform());
  }, []);

  // 초기 로드 시 쿨다운 상태 확인
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

  // 쿨다운 타이머 업데이트
  useEffect(() => {
    if (!cooldownUntil) {
      setRemainingCooldownSeconds(0);
      if (status === "cooldown" || status === "watching_ad") {
        setStatus("idle");
      }
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

    // 즉시 한 번 실행
    updateRemainingTime();

    // 1초마다 업데이트
    const interval = setInterval(updateRemainingTime, 1000);

    return () => clearInterval(interval);
  }, [cooldownUntil, status]);

  /**
   * 광고 시청 및 쿨다운 초기화
   */
  const watchAdAndResetCooldown = useCallback(async () => {
    if (!isCapacitor || status !== "cooldown") return;

    setStatus("watching_ad");
    
    try {
      // TODO: 실제 광고 SDK 연동 (AdMob 등)
      // 현재는 3초 대기하는 시뮬레이션으로 대체
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const result = await resetCooldown();
      if (result.success) {
        setCooldownUntil(null);
        setRemainingCooldownSeconds(0);
        setStatus("idle");
      } else {
        setError(result.error || "Failed to reset cooldown");
        setStatus("error");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ad playback error");
      setStatus("error");
    }
  }, [isCapacitor, status]);

  /**
   * 다운로드 요청
   */
  const download = useCallback(
    async (url: string, platform: "youtube" | "instagram") => {
      // 쿨다운 중이면 요청하지 않음 (이 로직은 admin도 동일하게 적용)
      if (cooldownUntil && new Date() < cooldownUntil) {
        return;
      }

      setStatus("checking");
      setError(null);

      try {
        const response: DownloadResponse = await requestDownload(url, platform);

        if (!response.success) {
          if (response.cooldownUntil) {
            // 쿨다운 응답
            const cooldownDate = new Date(response.cooldownUntil);
            setCooldownUntil(cooldownDate);
            setStatus("cooldown");
          } else {
            // 에러 응답
            setError(response.error || "Download failed");
            setStatus("error");
          }
          return;
        }

        // 다운로드 성공
        if (response.downloadUrl) {
          triggerFileDownload(response.downloadUrl);

          // Admin이 아닌 경우에만 쿨다운 시작
          if (session?.user?.role !== "admin") {
            const now = new Date();
            const newCooldownUntil = new Date(
              now.getTime() + DOWNLOAD_COOLDOWN_SECONDS * 1000
            );
            setCooldownUntil(newCooldownUntil);
            setStatus("cooldown");
          } else {
            // Admin인 경우, 쿨다운 타이머를 리셋하고 'idle' 상태로 유지
            setCooldownUntil(null);
            setStatus("idle");
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
    [cooldownUntil, status, session]
  );

  /**
   * 상태 리셋
   */
  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
    setCooldownUntil(null);
    setRemainingCooldownSeconds(0);
  }, []);

  return {
    status,
    error,
    cooldownUntil,
    remainingCooldownSeconds,
    isCapacitor,
    download,
    watchAdAndResetCooldown,
    reset,
  };
}
