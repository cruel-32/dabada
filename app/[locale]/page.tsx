"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSelector } from "@/components/language-selector";
import { authClient } from "@/lib/auth-client";
import { Download, Youtube, Instagram, LogIn, LogOut, User, Clock, AlertCircle } from "lucide-react";
import { useDownload } from "@/hooks/use-download";
import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";
import { App } from "@capacitor/app";

type Platform = "youtube" | "instagram";

/**
 * 쿨다운 시간을 포맷팅 (예: "3분 24초")
 */
function formatCooldownTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes > 0) {
    return `${minutes}분 ${remainingSeconds}초`;
  }
  return `${remainingSeconds}초`;
}

export default function Home() {
  const t = useTranslations();
  const locale = useLocale();
  const [platform, setPlatform] = useState<Platform>("youtube");
  const [url, setUrl] = useState("");
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { data: session, isPending, refetch } = authClient.useSession();
  const {
    status,
    error,
    remainingCooldownSeconds,
    download,
    reset,
  } = useDownload();

  // 에러가 발생하면 일정 시간 후 리셋
  useEffect(() => {
    if (status === "error") {
      const timer = setTimeout(() => {
        reset();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [status, reset]);

  // 앱에서 딥링크로 인증 코드를 받았을 때 처리
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    const handleAppUrlOpen = async (event: { url: string }) => {
      const url = new URL(event.url);

      // dabada://auth/callback?code=xxx 형태의 URL 처리
      if (url.pathname === "/auth/callback" || url.host === "auth") {
        const code = url.searchParams.get("code");
        const error = url.searchParams.get("error");

        // 인앱 브라우저 닫기
        await Browser.close();

        if (error) {
          console.error("Login error:", error);
          return;
        }

        if (code) {
          try {
            // 교환 API 호출하여 세션 쿠키 설정
            const response = await fetch("/api/auth/exchange", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
              body: JSON.stringify({ code }),
            });

            if (response.ok) {
              // 세션 새로고침
              await refetch?.();
              setIsLoginOpen(false);
            }
          } catch (err) {
            console.error("Session exchange error:", err);
          }
        }
      }
    };

    // App URL listener 등록
    const listener = App.addListener("appUrlOpen", handleAppUrlOpen);

    return () => {
      listener.then((l) => l.remove());
    };
  }, [refetch]);

  const handleDownload = async () => {
    if (!url.trim()) {
      alert(t("home.download.urlRequired"));
      return;
    }

    if (!session?.user) {
      setIsLoginOpen(true);
      return;
    }

    await download(url, platform);
  };

  const isCooldown = status === "cooldown";
  const isError = status === "error";

  const handleOAuthLogin = async (provider: "google" | "apple") => {
    try {
      if (Capacitor.isNativePlatform()) {
        // 앱에서는 인앱 브라우저로 로그인 시작 페이지 열기
        const baseUrl =
          process.env.NEXT_PUBLIC_APP_URL || "https://dabada.cloudish.cloud";
        const callbackUrl = `/${locale}/auth/login-complete`;
        // 로그인 시작 페이지에서 동일한 로그인 함수 호출
        const signInUrl = `${baseUrl}/${locale}/auth/login-start?provider=${provider}&callbackURL=${encodeURIComponent(callbackUrl)}`;

        // 로그인 다이얼로그 닫기
        setIsLoginOpen(false);

        // 인앱 브라우저 열기
        await Browser.open({
          url: signInUrl,
        });

        return;
      }

      // 웹에서는 기존 방식 유지
      await authClient.signIn.social({
        provider: provider,
        callbackURL: `/${locale}`,
      });
    } catch (error) {
      console.error(`${provider} login error:`, error);
      alert(t(`auth.login.${provider}Error`));
    }
  };

  const handleGoogleLogin = () => {
    handleOAuthLogin("google");
  };

  const handleAppleLogin = () => {
    handleOAuthLogin("apple");
  };

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl); // Update the URL state

    // Auto-select platform based on URL
    if (newUrl.includes("youtube.com") || newUrl.includes("youtu.be")) {
      setPlatform("youtube");
    } else if (newUrl.includes("instagram.com")) {
      setPlatform("instagram");
    }
    // If neither, keep current platform or reset (current approach keeps current)
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      {/* Header - Top Right */}
      <div className="fixed top-4 right-4 flex items-center gap-2">
        {isPending ? (
          <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
        ) : session?.user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || t("common.user")}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                ) : (
                  <User className="h-5 w-5" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center gap-2 p-2">
                <div className="flex flex-col space-y-1">
                  {session.user.name && (
                    <p className="text-sm font-medium leading-none">{session.user.name}</p>
                  )}
                  {session.user.email && (
                    <p className="text-xs text-muted-foreground">
                      {session.user.email}
                    </p>
                  )}
                </div>
              </div>
              <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:text-red-600 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>{t("common.signOut")}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            variant="ghost"
            onClick={() => setIsLoginOpen(true)}
            className="h-9"
          >
            <LogIn className="h-5 w-5" />
            {t("common.signIn")}
          </Button>
        )}
        <LanguageSelector />
        <ThemeToggle />
      </div>

      {/* Login Dialog */}
      <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("auth.login.title")}</DialogTitle>
            <DialogDescription>
              {t("auth.login.description")}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-4">
            <Button
              onClick={handleGoogleLogin}
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              size="lg"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              {t("auth.login.google")}
            </Button>
            <Button
              onClick={handleAppleLogin}
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              size="lg"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.17 2.08-1.85 4.04-3.74 4.25z" />
              </svg>
              {t("auth.login.apple")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="w-full max-w-2xl space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center space-y-4">
          <h1 className="text-5xl font-bold tracking-tight text-foreground">
            {t("home.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("home.subtitle")}
          </p>
        </div>

        {/* Main Card */}
        <div className="rounded-lg border bg-card p-6 shadow-lg">
          <div className="space-y-6">
            {/* Platform Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">
                {t("home.platform.select")}
              </label>
              <RadioGroup
                value={platform}
                onValueChange={(value: string) => setPlatform(value as Platform)}
                className="grid grid-cols-2 gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="youtube" id="youtube" />
                  <label
                    htmlFor="youtube"
                    className="flex cursor-pointer items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    <Youtube className="h-4 w-4" />
                    {t("home.platform.youtube")}
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="instagram" id="instagram" />
                  <label
                    htmlFor="instagram"
                    className="flex cursor-pointer items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    <Instagram className="h-4 w-4" />
                    {t("home.platform.instagram")}
                  </label>
                </div>
              </RadioGroup>
            </div>

            {/* URL Input */}
            <div className="space-y-2">
              <label
                htmlFor="url"
                className="text-sm font-medium text-foreground"
              >
                {t("home.videoUrl.label")}
              </label>
              <Input
                id="url"
                type="url"
                placeholder={
                  platform === "youtube"
                    ? t("home.videoUrl.placeholder.youtube")
                    : t("home.videoUrl.placeholder.instagram")
                }
                value={url}
                onChange={handleUrlChange}
                onClear={() => setUrl("")}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === "Enter") {
                    handleDownload();
                  }
                }}
                className="w-full"
              />
            </div>

            {/* Error Message */}
            {isError && error && (
              <div className="flex items-center gap-2 rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            {/* Download Button */}
            <Button
              onClick={handleDownload}
              disabled={
                status === "checking" ||
                !url.trim() ||
                isCooldown
              }
              className="w-full"
              size="lg"
            >
              {status === "checking" ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  {t("home.download.checking")}
                </>
              ) : isCooldown ? (
                <>
                  <Clock className="h-4 w-4" />
                  {t("home.download.cooldownButtonText", {
                    time: formatCooldownTime(remainingCooldownSeconds),
                  })}
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  {t("home.download.button")}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

