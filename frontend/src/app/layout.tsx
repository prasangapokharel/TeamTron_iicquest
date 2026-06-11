import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import {
  PLATFORM_DESCRIPTION,
  PLATFORM_NAME,
  PLATFORM_TAGLINE,
} from "@/lib/brand";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${PLATFORM_NAME} | ${PLATFORM_TAGLINE}`,
  description: PLATFORM_DESCRIPTION,
  keywords: [
    "document verification",
    "KYC",
    "blockchain",
    "Tron",
    "fraud detection",
    PLATFORM_NAME,
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className={`${inter.className} min-h-screen w-full antialiased`}>
        {children}
      </body>
    </html>
  );
}
