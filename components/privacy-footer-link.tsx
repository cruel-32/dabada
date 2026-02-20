"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = { locale: string };

export function PrivacyFooterLink({ locale }: Props) {
  const pathname = usePathname();
  const isPrivacyPage = pathname?.endsWith("/privacy") ?? false;

  if (isPrivacyPage) {
    return null;
  }

  return (
    <footer className="flex-shrink-0 py-3 text-center">
      <Link
        href={`/${locale}/privacy`}
        className="text-xs text-muted-foreground/70 hover:text-muted-foreground transition-colors"
      >
        {locale === "ko" ? "개인정보 처리방침" : "Privacy Policy"}
      </Link>
    </footer>
  );
}
