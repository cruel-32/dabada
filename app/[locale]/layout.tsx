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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://dabada.io"),
  title: {
    default: "DABADA - Video Downloader",
    template: "%s | DABADA",
  },
  description: "Download videos from YouTube and Instagram easily and quickly. High quality video downloader.",
  keywords: ["video downloader", "youtube downloader", "instagram downloader", "mp4", "download video", "dabada"],
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
    locale: "en_US",
    url: "/",
    title: "DABADA - Video Downloader",
    description: "Download videos from YouTube and Instagram easily and quickly.",
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
    title: "DABADA - Video Downloader",
    description: "Download videos from YouTube and Instagram easily and quickly.",
    images: ["/opengraph-image"],
    creator: "@dabada",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

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
    "url": process.env.NEXT_PUBLIC_APP_URL || "https://dabada.io",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${process.env.NEXT_PUBLIC_APP_URL || "https://dabada.io"}/search?q={search_term_string}`
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


