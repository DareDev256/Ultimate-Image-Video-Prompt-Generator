import type { Metadata } from "next";
import "./globals.css";
import { WebsiteJsonLd } from "@/components/seo/JsonLd";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/site-config";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Make the shot. Skip the blank box.`,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    'AI prompt generator',
    'image prompts',
    'video prompts',
    'Nano Banana Pro',
    'GPT-Image-2',
    'Seedance',
    'Veo',
    'Kling',
    'HunyuanVideo',
    'Wan',
    'LTX-Video',
    'Mochi',
    'prompt engineering',
  ],
  authors: [{ name: 'James "DareDev256" Olusoga', url: 'https://tdotssolutionsz.com' }],
  creator: 'DareDev256',
  openGraph: {
    type: 'website',
    locale: 'en_CA',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Make the shot. Skip the blank box.`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <WebsiteJsonLd />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
