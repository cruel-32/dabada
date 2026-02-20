import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import Link from "next/link";
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://dabada.cloudish.cloud";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "privacy" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `/${locale}/privacy`,
    },
  };
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "privacy" });
  const isKo = locale === "ko";

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <Link
          href={`/${locale}`}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← {isKo ? "홈으로" : "Back to Home"}
        </Link>

        <h1 className="mt-6 text-2xl font-semibold text-foreground sm:text-3xl">
          {t("title")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {isKo ? "시행일: 2025년 2월 20일" : "Effective: February 20, 2025"}
        </p>

        <div className="prose prose-sm mt-8 max-w-none prose-p:text-muted-foreground prose-li:text-muted-foreground prose-headings:text-foreground prose-headings:font-medium">
          <section className="mt-6">
            <h2 className="text-lg text-foreground">
              {isKo ? "1. 수집하는 개인정보 항목" : "1. Personal Information We Collect"}
            </h2>
            <p className="mt-2">
              {isKo
                ? "DABADA는 서비스 제공을 위해 아래와 같이 개인정보를 수집·이용합니다."
                : "DABADA collects and uses the following personal information to provide our services."}
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              {isKo ? (
                <>
                  <li>
                    <strong>로그인 시 (Google·Apple 소셜 로그인)</strong>: 이름, 이메일 주소, 프로필 이미지 URL(선택). 제공자(Google/Apple)로부터 전달받습니다.
                  </li>
                  <li>
                    <strong>서버에 저장되는 데이터</strong>: 위 식별자와 연계된 사용자 ID, 이메일 인증 여부, 계정 역할(일반/관리자), 마지막 다운로드 시각. 세션 정보(세션 토큰, 접속 IP, 브라우저/앱 정보(User-Agent))는 로그인 유지 목적으로 저장됩니다.
                  </li>
                  <li>
                    <strong>다운로드 이용 시</strong>: 다운로드한 동영상의 URL·플랫폼(YouTube/Instagram), 다운로드 시각 및 서버 내 파일 경로. 다운로드 이력은 사용자별 쿨다운 적용 및 서비스 운영에 사용됩니다.
                  </li>
                  <li>
                    <strong>쿠키</strong>: 로그인 세션 유지를 위한 세션 쿠키(better-auth.session_token)를 사용합니다.
                  </li>
                  <li>
                    <strong>모바일 앱</strong>: iOS·Android 앱에서는 맞춤형 광고 제공을 위해 Google AdMob이 사용될 수 있으며, iOS의 경우 ‘앱 추적 투명성(ATT)’ 동의 시 식별자가 광고 목적으로 활용될 수 있습니다.
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <strong>At sign-in (Google/Apple social login)</strong>: Name, email address, and profile image URL (optional), received from the provider.
                  </li>
                  <li>
                    <strong>Data stored on our servers</strong>: User ID linked to the above, email verification status, account role (user/admin), last download time. Session data (session token, IP address, browser/app User-Agent) is stored to maintain login state.
                  </li>
                  <li>
                    <strong>When you download</strong>: Video URL, platform (YouTube/Instagram), download time, and server file path. Download history is used for per-user cooldown and service operation.
                  </li>
                  <li>
                    <strong>Cookies</strong>: We use a session cookie (better-auth.session_token) to keep you signed in.
                  </li>
                  <li>
                    <strong>Mobile app</strong>: On iOS and Android, Google AdMob may be used for personalized ads; on iOS, if you consent to App Tracking Transparency (ATT), identifiers may be used for advertising.
                  </li>
                </>
              )}
            </ul>
          </section>

          <section className="mt-6">
            <h2 className="text-lg text-foreground">
              {isKo ? "2. 수집·이용 목적" : "2. Purposes of Collection and Use"}
            </h2>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              {isKo ? (
                <>
                  <li>회원 식별 및 로그인·로그아웃 처리</li>
                  <li>다운로드 횟수 제한(쿨다운) 및 악용 방지</li>
                  <li>서비스 개선 및 오류 해결</li>
                  <li>법령에 따른 기록 보존(해당 시)</li>
                </>
              ) : (
                <>
                  <li>Identifying users and handling sign-in/sign-out</li>
                  <li>Enforcing download cooldowns and preventing abuse</li>
                  <li>Improving the service and resolving errors</li>
                  <li>Retaining records as required by law where applicable</li>
                </>
              )}
            </ul>
          </section>

          <section className="mt-6">
            <h2 className="text-lg text-foreground">
              {isKo ? "3. 보관 기간" : "3. Retention Period"}
            </h2>
            <p className="mt-2">
              {isKo
                ? "회원 정보는 계정 삭제(회원 탈퇴) 시 또는 법령에서 정한 기간이 있는 경우 해당 기간까지 보관 후 파기합니다. 세션 정보는 세션 만료 또는 로그아웃 시 삭제됩니다. 다운로드 이력·동영상 메타데이터는 서비스 운영에 필요한 기간 동안 보관할 수 있으며, 회원 탈퇴 시 연계된 데이터는 삭제됩니다."
                : "We retain your account data until you delete your account (withdraw) or for any period required by law. Session data is removed when the session expires or you sign out. Download history and video metadata may be kept for as long as needed to operate the service; data linked to your account is deleted when you withdraw."}
            </p>
          </section>

          <section className="mt-6">
            <h2 className="text-lg text-foreground">
              {isKo ? "4. 제3자 제공 및 위탁" : "4. Third-Party Sharing and Subcontracting"}
            </h2>
            <p className="mt-2">
              {isKo
                ? "로그인 과정에서 Google·Apple에 해당 제공자가 정한 범위의 정보가 전달됩니다. 모바일 앱 내 광고는 Google AdMob을 통해 제공되며, AdMob의 개인정보 처리 방식은 Google 정책을 따릅니다. 당사는 이용자 식별 정보를 영리 목적으로 제3자에게 판매하지 않습니다."
                : "During sign-in, information is sent to Google or Apple to the extent described in their respective policies. In-app ads are delivered via Google AdMob, whose privacy practices follow Google’s policy. We do not sell your identifying information to third parties for commercial purposes."}
            </p>
          </section>

          <section className="mt-6">
            <h2 className="text-lg text-foreground">
              {isKo ? "5. 이용자 권리" : "5. Your Rights"}
            </h2>
            <p className="mt-2">
              {isKo
                ? "로그아웃 시 세션 정보는 종료됩니다. 계정 삭제(회원 탈퇴)를 원하시면 서비스 내 문의 또는 관리자에게 요청하시면 됩니다. 삭제 시 수집된 개인정보는 파기됩니다. iOS·Android에서는 기기 설정에서 광고 식별자 및 추적 권한을 제한할 수 있습니다."
                : "Signing out ends your session. To delete your account, please contact us or an administrator; we will then delete the collected personal information. On iOS and Android, you can limit ad identifiers and tracking in your device settings."}
            </p>
          </section>

          <section className="mt-6">
            <h2 className="text-lg text-foreground">
              {isKo ? "6. 문의" : "6. Contact"}
            </h2>
            <p className="mt-2">
              {isKo
                ? "개인정보 처리에 관한 문의는 서비스 운영자 또는 웹사이트를 통해 연락해 주세요."
                : "For questions about how we handle personal information, please contact the service operator or reach out via the website."}
            </p>
            <p className="mt-2 text-muted-foreground">
              {baseUrl}
            </p>
          </section>
        </div>

        <p className="mt-10 text-xs text-muted-foreground">
          {isKo
            ? "본 방침은 서비스 변경에 따라 수정될 수 있으며, 변경 시 웹사이트 또는 앱 내 공지를 통해 안내합니다."
            : "This policy may be updated as the service changes; we will notify you via the website or in-app notice when it is updated."}
        </p>
      </div>
    </div>
  );
}
