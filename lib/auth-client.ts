"use client";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { createAuthClient } from "better-auth/react";
import { Capacitor } from "@capacitor/core";

// Capacitor 앱에서는 window.location.origin이 capacitor://localhost가 되므로
// 실제 서버 URL을 사용해야 함
const getBaseURL = () => {
  // 서버 사이드
  if (typeof window === "undefined") {
    return `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3030'}/api/auth`;
  }

  // Capacitor 네이티브 앱
  if (Capacitor.isNativePlatform()) {
    return `${process.env.NEXT_PUBLIC_APP_URL || 'https://dabada.cloudish.cloud'}/api/auth`;
  }

  // 웹 브라우저
  return window.location.origin + "/api/auth";
};

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
});

export const { signIn, signOut, useSession } = authClient;

