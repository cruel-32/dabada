"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle } from "lucide-react";

interface LoginCompleteClientProps {
  authCode: string | null;
}

export default function LoginCompleteClient({ authCode }: LoginCompleteClientProps) {
  const t = useTranslations();
  const [isClosing, setIsClosing] = useState(false);

  const handleComplete = () => {
    console.log("handleComplete", authCode);
    setIsClosing(true);

    // 앱 딥링크 호출하여 인증 코드 전달
    if (authCode) {
      window.location.href = `dabada://auth/callback?code=${authCode}`;
    } else {
      // 코드가 없으면 에러 상태로 딥링크 호출
      window.location.href = "dabada://auth/callback?error=no_session";
    }
  };

  // 자동으로 3초 후 딥링크 호출 (사용자가 버튼을 누르지 않을 경우 대비)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isClosing) {
        handleComplete();
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [isClosing, authCode]);

  if (!authCode) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="rounded-full bg-red-100 p-4 dark:bg-red-900">
              <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              {t("auth.loginComplete.errorTitle")}
            </h1>
            <p className="text-muted-foreground">
              {t("auth.loginComplete.errorDescription")}
            </p>
          </div>
          <Button
            onClick={() => window.location.href = "dabada://auth/callback?error=no_session"}
            className="w-full"
            size="lg"
            variant="outline"
          >
            {t("auth.loginComplete.returnToApp")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="rounded-full bg-green-100 p-4 dark:bg-green-900">
            <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {t("auth.loginComplete.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("auth.loginComplete.description")}
          </p>
        </div>

        <Button
          onClick={handleComplete}
          className="w-full"
          size="lg"
          disabled={isClosing}
        >
          {isClosing ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              {t("auth.loginComplete.closing")}
            </div>
          ) : (
            t("auth.loginComplete.button")
          )}
        </Button>

        <p className="text-sm text-muted-foreground">
          {t("auth.loginComplete.autoClose")}
        </p>
      </div>
    </div>
  );
}
