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
    const rawCallbackURL = searchParams.get("callbackURL");
    
    // 로그: 파라미터 확인
    console.log("📱 [MobileLogin] Page loaded with params:", { 
      provider, 
      rawCallbackURL,
      fullUrl: window.location.href 
    });

    if (provider && (provider === "google" || provider === "apple")) {
      const callbackURL = rawCallbackURL || "/auth/mobile-callback";
      console.log("📱 [MobileLogin] Using callbackURL:", callbackURL);

      // 약간의 지연을 주어 UI가 렌더링된 후 실행되도록 함
      const timer = setTimeout(async () => {
        console.log(`📱 [MobileLogin] Initiating ${provider} sign-in...`);
        
        try {
          await authClient.signIn.social({
            provider: provider,
            callbackURL: callbackURL,
            onError: (ctx) => {
               console.error("📱 [MobileLogin] Sign-in error:", ctx.error);
               alert(`로그인 오류: ${ctx.error.message}`);
            },
            onSuccess: () => {
               console.log("📱 [MobileLogin] Sign-in success (redirect pending)");
            }
          });
          console.log("📱 [MobileLogin] Sign-in function called");
        } catch (err) {
          console.error("📱 [MobileLogin] Exception during sign-in:", err);
        }
      }, 500);

      return () => clearTimeout(timer);
    } else {
      console.warn("📱 [MobileLogin] Missing or invalid provider:", provider);
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
