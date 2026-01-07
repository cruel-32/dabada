"use client";

import { useState } from "react";
import Image from "next/image";
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
import { ThemeToggle } from "@/components/theme-toggle";
import { authClient } from "@/lib/auth-client";
import { Download, Youtube, Instagram, LogIn, LogOut, User } from "lucide-react";

type Platform = "youtube" | "instagram";

export default function Home() {
  const [platform, setPlatform] = useState<Platform>("youtube");
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { data: session, isPending } = authClient.useSession();

  const handleDownload = async () => {
    if (!url.trim()) {
      alert("URL을 입력해주세요.");
      return;
    }

    if (!session?.user) {
      alert("로그인이 필요합니다.");
      setIsLoginOpen(true);
      return;
    }

    setIsLoading(true);
    // TODO: API 호출 구현
    console.log("Download:", platform, url);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const handleGoogleLogin = async () => {
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });
    } catch (error) {
      console.error("Google login error:", error);
      alert("Google 로그인에 실패했습니다.");
    }
  };

  const handleAppleLogin = async () => {
    try {
      await authClient.signIn.social({
        provider: "apple",
        callbackURL: "/",
      });
    } catch (error) {
      console.error("Apple login error:", error);
      alert("Apple 로그인에 실패했습니다.");
    }
  };

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      {/* Header */}
      <div className="fixed top-4 right-4 flex items-center gap-3">
        {isPending ? (
          <div className="h-9 w-20 animate-pulse rounded-md bg-muted" />
        ) : session?.user ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-md border bg-card px-3 py-2">
              {session.user.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  width={24}
                  height={24}
                  className="h-6 w-6 rounded-full"
                />
              ) : (
                <User className="h-4 w-4" />
              )}
              <span className="text-sm font-medium">
                {session.user.name || session.user.email}
              </span>
            </div>
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            onClick={() => setIsLoginOpen(true)}
            className="flex items-center gap-2"
          >
            <LogIn className="h-4 w-4" />
            Sign In
          </Button>
        )}
        <ThemeToggle />
      </div>

      {/* Login Dialog */}
      <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>로그인</DialogTitle>
            <DialogDescription>
              Google 또는 Apple 계정으로 로그인하세요
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
              Google로 로그인
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
              Apple로 로그인
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="w-full max-w-2xl space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center space-y-4">
          <h1 className="text-5xl font-bold tracking-tight text-foreground">
            DABADA
          </h1>
          <p className="text-muted-foreground">
            YouTube와 Instagram 동영상을 다운로드하세요
          </p>
        </div>

        {/* Main Card */}
        <div className="rounded-lg border bg-card p-6 shadow-lg">
          <div className="space-y-6">
            {/* Platform Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">
                플랫폼 선택
              </label>
              <RadioGroup
                value={platform}
                onValueChange={(value) => setPlatform(value as Platform)}
                className="grid grid-cols-2 gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="youtube" id="youtube" />
                  <label
                    htmlFor="youtube"
                    className="flex cursor-pointer items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    <Youtube className="h-4 w-4" />
                    YouTube
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="instagram" id="instagram" />
                  <label
                    htmlFor="instagram"
                    className="flex cursor-pointer items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    <Instagram className="h-4 w-4" />
                    Instagram
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
                동영상 URL
              </label>
              <Input
                id="url"
                type="url"
                placeholder={
                  platform === "youtube"
                    ? "https://www.youtube.com/watch?v=..."
                    : "https://www.instagram.com/p/..."
                }
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleDownload();
                  }
                }}
                className="w-full"
              />
            </div>

            {/* Download Button */}
            <Button
              onClick={handleDownload}
              disabled={isLoading || !url.trim()}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  다운로드 중...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  다운로드
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
