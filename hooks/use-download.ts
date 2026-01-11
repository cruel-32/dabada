"use client";

import { useState, useEffect, useCallback } from "react";
import { requestDownload, triggerFileDownload, checkCooldown, DownloadResponse } from "@/lib/download-api";
import { DOWNLOAD_COOLDOWN_SECONDS } from "@/lib/config";

export type DownloadStatus =
  | "idle"
  | "checking"
  | "downloading"
  | "ready"
  | "error"
  | "cooldown";

export interface UseDownloadReturn {
  status: DownloadStatus;
  error: string | null;
  cooldownUntil: Date | null;
  remainingCooldownSeconds: number;
  download: (url: string, platform: "youtube" | "instagram") => Promise<void>;
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
      if (status === "cooldown") {
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
      } else {
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
   * 다운로드 요청
   */
  const download = useCallback(
    async (url: string, platform: "youtube" | "instagram") => {
      // 쿨다운 중이면 요청하지 않음
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
          setStatus("downloading");
          
          // 파일 다운로드 트리거
          triggerFileDownload(response.downloadUrl);

          // 다운로드 로그 기록을 위해 쿨다운 시작
          // 실제로는 서버에서 이미 기록했지만, 클라이언트에서도 쿨다운 시작
          const now = new Date();
          const newCooldownUntil = new Date(
            now.getTime() + DOWNLOAD_COOLDOWN_SECONDS * 1000
          );
          setCooldownUntil(newCooldownUntil);
          setStatus("cooldown");

          // 다운로드 완료 후 ready 상태로 변경 (짧은 시간)
          setTimeout(() => {
            if (status !== "cooldown") {
              setStatus("ready");
            }
          }, 1000);
        } else {
          setError("Download URL not provided");
          setStatus("error");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        setStatus("error");
      }
    },
    [cooldownUntil, status]
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
    download,
    reset,
  };
}
