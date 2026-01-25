"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useTranslations } from "next-intl";

export default function MobileLoginPage() {
  const searchParams = useSearchParams();
  const t = useTranslations();
  
  useEffect(() => {
    const provider = searchParams.get("provider");
    const callbackURL = searchParams.get("callbackURL");

    if (provider && (provider === "google" || provider === "apple")) {
      // 약간의 지연을 주어 UI가 렌더링된 후 실행되도록 함
      const timer = setTimeout(() => {
        authClient.signIn.social({
          provider: provider,
          callbackURL: callbackURL || "/auth/mobile-callback", // 모바일 앱으로 돌아가기 위한 딥링크 처리 페이지 또는 스키마
        });
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-muted-foreground">
          {t("home.download.checking")} {/* "확인 및 다운로드 중..." (임시 메시지) */}
        </p>
      </div>
    </div>
  );
}
