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
        console.log("Starting login with provider:", provider, "callbackURL:", callbackURL);

        // better-auth 소셜 로그인 API 직접 호출
        const response = await fetch("/api/auth/sign-in/social", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            provider,
            callbackURL,
          }),
        });

        console.log("Response status:", response.status);
        console.log("Response headers:", Object.fromEntries(response.headers.entries()));

        // 리다이렉트 응답인 경우
        if (response.redirected) {
          console.log("Redirected to:", response.url);
          window.location.href = response.url;
          return;
        }

        const text = await response.text();
        console.log("Response text:", text);

        try {
          const data = JSON.parse(text);
          console.log("Parsed data:", data);

          // 응답에서 리다이렉트 URL 추출하여 직접 이동
          if (data.url) {
            window.location.href = data.url;
          } else if (data.redirect) {
            window.location.href = data.redirect;
          } else {
            setError(`Login failed - response: ${JSON.stringify(data)}`);
          }
        } catch {
          // JSON이 아닌 경우 (HTML 등)
          setError(`Unexpected response: ${text.substring(0, 200)}`);
        }
      } catch (err) {
        console.error("Login error:", err);
        setError(`Login failed: ${err}`);
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
