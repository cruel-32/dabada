"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export default function LoginStartPage() {
  const searchParams = useSearchParams();
  const callbackURL = searchParams.get("callbackURL") || "/";
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const startLogin = async (provider: "google" | "apple") => {
    try {
      setIsLoading(true);
      setError(null);
      await authClient.signIn.social({
        provider,
        callbackURL,
      });
    } catch (err) {
      setError(`에러 발생: ${String(err)}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-xl font-semibold">로그인</h1>
          <p className="text-sm text-muted-foreground">
            계속하려면 로그인해주세요.
          </p>
        </div>

        {error && (
          <div className="rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Button
            onClick={() => startLogin("google")}
            variant="outline"
            size="lg"
            disabled={isLoading}
          >
            Google 로그인
          </Button>
          <Button
            onClick={() => startLogin("apple")}
            variant="outline"
            size="lg"
            disabled={isLoading}
          >
            Apple 로그인
          </Button>
        </div>
      </div>
    </div>
  );
}
