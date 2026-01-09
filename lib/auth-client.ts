"use client";

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL:
    typeof window === "undefined"
      ? process.env.NEXT_PUBLIC_AUTH_URL || "http://localhost:3030"
      : window.location.origin + "/api/auth",
});

export const { signIn, signOut, useSession } = authClient;

