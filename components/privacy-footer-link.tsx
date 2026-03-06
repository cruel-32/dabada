"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = { locale: string };

export function PrivacyFooterLink({ locale }: Props) {
  const pathname = usePathname();
  const isPrivacyPage = pathname?.endsWith("/privacy") ?? false;
  const isSupportPage = pathname?.endsWith("/support") ?? false;

  if (isPrivacyPage || isSupportPage) {
    return null;
  }

  return (
    <footer className="flex-shrink-0 py-3 text-center">
      <span className="text-xs text-muted-foreground/70">
        <Link
          href={`/${locale}/support`}
          className="hover:text-muted-foreground transition-colors"
        >
          {locale === "ko" ? "고객 지원" : "Support"}
        </Link>
        {" · "}
        <Link
          href={`/${locale}/privacy`}
          className="hover:text-muted-foreground transition-colors"
        >
          {locale === "ko" ? "개인정보 처리방침" : "Privacy Policy"}
        </Link>
      </span>
    </footer>
  );
}
