"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

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
        // better-auth 소셜 로그인 API 직접 호출
        const response = await fetch("/api/auth/sign-in/social", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            provider,
            callbackURL,
          }),
        });

        const data = await response.json();

        // 응답에서 리다이렉트 URL 추출하여 직접 이동
        if (data.url) {
          window.location.href = data.url;
        } else if (data.redirect) {
          window.location.href = data.redirect;
        } else {
          console.error("No redirect URL in response:", data);
          setError("Login failed - no redirect URL");
        }
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
