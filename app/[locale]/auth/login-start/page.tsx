"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function LoginStartPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<string>("초기화 중...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const provider = searchParams.get("provider") as "google" | "apple" | null;
    const callbackURL = searchParams.get("callbackURL") || "/";

    if (!provider) {
      setError("Provider is required");
      return;
    }

    setStatus(`${provider} 로그인 시작...`);

    const startLogin = async () => {
      try {
        setStatus("API 호출 중...");

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

        setStatus(`응답 받음: ${response.status}`);

        // 리다이렉트 응답인 경우
        if (response.redirected) {
          setStatus(`리다이렉트: ${response.url}`);
          window.location.href = response.url;
          return;
        }

        const text = await response.text();
        setStatus(`응답 본문: ${text.substring(0, 100)}`);

        try {
          const data = JSON.parse(text);

          // 응답에서 리다이렉트 URL 추출하여 직접 이동
          if (data.url) {
            setStatus(`URL로 이동: ${data.url}`);
            window.location.href = data.url;
          } else if (data.redirect) {
            setStatus(`Redirect로 이동: ${data.redirect}`);
            window.location.href = data.redirect;
          } else {
            setError(`응답에 URL 없음: ${JSON.stringify(data)}`);
          }
        } catch {
          setError(`JSON 파싱 실패: ${text.substring(0, 200)}`);
        }
      } catch (err) {
        setError(`에러 발생: ${String(err)}`);
      }
    };

    startLogin();
  }, [searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="flex flex-col items-center gap-4 max-w-md text-center">
        {error ? (
          <>
            <p className="text-red-500 font-bold">에러 발생</p>
            <p className="text-red-400 text-sm break-all">{error}</p>
          </>
        ) : (
          <>
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-gray-500 break-all">{status}</p>
          </>
        )}
      </div>
    </div>
  );
}
