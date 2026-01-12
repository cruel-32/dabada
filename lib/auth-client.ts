"use client";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: typeof window === "undefined"
    ? `${process.env.AUTH_URL || 'http://localhost:3030'}/api/auth`
    : window.location.origin + "/api/auth",
});

export const { signIn, signOut, useSession } = authClient;

