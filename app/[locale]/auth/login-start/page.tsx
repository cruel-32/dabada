"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function LoginStartPage() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const provider = searchParams.get("provider") as "google" | "apple" | null;
    const callbackURL = searchParams.get("callbackURL") || "/";

    if (!provider) {
      setError("Provider is required");
      return;
    }

    const startLogin = async () => {
      try {
        // 소셜 로그인 시작 - 이 함수가 OAuth provider로 리다이렉트함
        await authClient.signIn.social({
          provider,
          callbackURL,
        });
      } catch (err) {
        console.error("Login error:", err);
        setError("Login failed");
      }
    };

    startLogin();
  }, [searchParams]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p>로그인 중...</p>
      </div>
    </div>
  );
}
