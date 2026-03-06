import type { Metadata } from "next";
import Link from "next/link";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKo = locale === "ko";
  return {
    title: isKo ? "고객 지원" : "Customer Support",
    description: isKo
      ? "DABADA 앱 사용에 관한 문의 및 지원 안내"
      : "Contact and support information for DABADA app",
    alternates: {
      canonical: `/${locale}/support`,
    },
  };
}

const SUPPORT_EMAIL = "support@dabada.cloudish.cloud";

export default async function SupportPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
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
          {isKo ? "고객 지원" : "Customer Support"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {isKo
            ? "DABADA 앱 관련 문의사항이 있으시면 아래 방법으로 연락해 주세요."
            : "For questions or support regarding the DABADA app, please contact us using the information below."}
        </p>

        <section className="mt-8 space-y-6">
          <div>
            <h2 className="text-lg font-medium text-foreground">
              {isKo ? "이메일 문의" : "Email Support"}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {isKo
                ? "앱 사용, 기술 문의, 계정 관련 질문 등은 이메일로 보내 주세요. 가능한 한 빠르게 답변해 드리겠습니다."
                : "For app usage, technical questions, or account-related inquiries, please email us. We will respond as soon as possible."}
            </p>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="mt-2 inline-block font-medium text-primary hover:underline"
            >
              {SUPPORT_EMAIL}
            </a>
          </div>

          <div>
            <h2 className="text-lg font-medium text-foreground">
              {isKo ? "자주 묻는 질문" : "Frequently Asked Questions"}
            </h2>
            <ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
              {isKo ? (
                <>
                  <li>앱이 정상 작동하지 않을 때: 이메일로 증상과 기기 정보를 알려주세요.</li>
                  <li>계정 삭제 요청: 동일 이메일로 요청해 주시면 처리해 드립니다.</li>
                  <li>개인정보 처리: <Link href={`/${locale}/privacy`} className="text-primary hover:underline">개인정보 처리방침</Link>을 참고해 주세요.</li>
                </>
              ) : (
                <>
                  <li>App not working: Please email us with the symptoms and your device information.</li>
                  <li>Account deletion: Request via email and we will process it.</li>
                  <li>Privacy: See our <Link href={`/${locale}/privacy`} className="text-primary hover:underline">Privacy Policy</Link> for details.</li>
                </>
              )}
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-medium text-foreground">
              {isKo ? "응답 시간" : "Response Time"}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {isKo
                ? "보통 1~3 영업일 이내에 답변해 드립니다. 긴급한 경우 이메일 제목에 [긴급]을 포함해 주세요."
                : "We typically respond within 1–3 business days. For urgent matters, please include [Urgent] in the email subject."}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
