"use client";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { createAuthClient } from "better-auth/react";

const getBaseURL = () => {
  // 서버 사이드
  if (typeof window === "undefined") {
    return `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3030"}/api/auth`;
  }

  // 웹 브라우저
  return window.location.origin + "/api/auth";
};

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
});

export const { signIn, signOut, useSession } = authClient;

