import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales, type Locale } from "@/i18n";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const metadata = {
    ko: {
      title: "DABADA - 유튜브 인스타그램 동영상 다운로드",
      description: "유튜브(YouTube)와 인스타그램(Instagram) 동영상을 무료로 빠르게 다운로드하세요. 로그인만으로 고화질 MP4 영상 저장이 가능합니다.",
      keywords: [
        "유튜브 다운로드", "유튜브 영상 다운로드", "유튜브 동영상 저장",
        "인스타그램 영상 다운로드", "인스타 릴스 다운로드", "인스타 동영상 저장",
        "무료 동영상 다운로드", "유튜브 mp4 다운로드", "고화질 영상 다운로드",
        "유튜브 다운로더", "인스타 다운로더", "영상 저장 사이트",
        "youtube downloader", "instagram downloader", "video downloader",
      ],
      ogLocale: "ko_KR",
    },
    en: {
      title: "DABADA - YouTube Instagram Video Downloader",
      description: "Download YouTube and Instagram videos for free. Save high-quality MP4 videos with just a login. Fast and easy online video downloader.",
      keywords: [
        "youtube video downloader", "instagram video downloader",
        "download youtube videos", "download instagram reels",
        "youtube to mp4", "instagram to mp4", "free video downloader",
        "youtube downloader online", "instagram downloader online",
        "save youtube videos", "save instagram videos",
        "online video downloader", "video downloader", "mp4 downloader",
      ],
      ogLocale: "en_US",
    },
  };

  const current = metadata[locale as keyof typeof metadata] || metadata.en;

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://dabada.cloudish.cloud"),
    title: {
      default: current.title,
      template: "%s | DABADA",
    },
    description: current.description,
    keywords: current.keywords,
    authors: [{ name: "DABADA Team" }],
    creator: "DABADA",
    publisher: "DABADA",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
    openGraph: {
      type: "website",
      locale: current.ogLocale,
      url: `/${locale}`,
      title: current.title,
      description: current.description,
      siteName: "DABADA",
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: "DABADA Video Downloader",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: current.title,
      description: current.description,
      images: ["/opengraph-image"],
      creator: "@dabada",
    },
    alternates: {
      canonical: `/${locale}`,
      languages: {
        'ko': '/ko',
        'en': '/en',
        'x-default': '/en',
      },
    },
    icons: {
      icon: "/favicon.ico",
    },
  };
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  const messages = await getMessages();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "DABADA",
    "url": process.env.NEXT_PUBLIC_APP_URL || "https://dabada.cloudish.cloud",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${process.env.NEXT_PUBLIC_APP_URL || "https://dabada.cloudish.cloud"}/${locale}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}


