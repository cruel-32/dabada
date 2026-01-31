"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function LoginStartPage() {
  const searchParams = useSearchParams();
  const provider = searchParams.get("provider") as "google" | "apple" | null;
  const callbackURL = searchParams.get("callbackURL") || "/";
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('provider :::::: ', provider)
    console.log('callbackURL :::::: ', callbackURL)

    if (!provider) {
      return;
    }

    const startLogin = async () => {
      try {
        await authClient.signIn.social({
          provider,
          callbackURL,
        });
      } catch (err) {
        setError(`에러 발생: ${String(err)}`);
      }
    };

    startLogin();
  }, [provider, callbackURL]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="flex flex-col items-center gap-4 max-w-md text-center">
        {!provider ? (
          <>
            <p className="text-red-500 font-bold">에러 발생</p>
            <p className="text-red-400 text-sm break-all">
              Provider is required
            </p>
          </>
        ) : error ? (
          <>
            <p className="text-red-500 font-bold">에러 발생</p>
            <p className="text-red-400 text-sm break-all">{error}</p>
          </>
        ) : (
          <>
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">
              로그인 처리 중...
            </p>
          </>
        )}
      </div>
    </div>
  );
}
