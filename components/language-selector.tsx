"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { locales, type Locale } from "@/i18n";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Languages } from "lucide-react";

const languageNames: Record<Locale, string> = {
  ko: "한국어",
  en: "English",
};

export function LanguageSelector() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (newLocale: Locale) => {
    const segments = pathname.split('/');
    if (segments.length > 1 && locales.includes(segments[1] as Locale)) {
        segments[1] = newLocale;
        router.push(segments.join('/'));
    } else {
        // Fallback or handle cases where locale might not be in path (though middleware ensures it usually)
         router.push(`/${newLocale}${pathname}`);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 gap-2">
          <Languages className="h-4 w-4" />
          <span className="hidden sm:inline">{languageNames[locale]}</span>
          <span className="sm:hidden">{locale.toUpperCase()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => handleLanguageChange(loc)}
            className={locale === loc ? "bg-accent" : ""}
          >
            {languageNames[loc]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
