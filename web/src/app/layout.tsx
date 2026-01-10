import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ultimate Image Generator | Dream Machine",
  description: "Image of your dreams, we walk you through it. Create stunning AI images and videos with Nano Banana, DALL-E, and Kling.",
  keywords: ["AI", "image generator", "DALL-E", "Kling", "Nano Banana", "prompt builder"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
