import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
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
  title: "VivadX | Smart Document Reconciliation & Verification",
  description:
    "Upload documents, AI flags risks in seconds, and anchor verified fields on Tron blockchain. Built for banks, manpower agencies, and consultancies.",
  keywords: [
    "document verification",
    "KYC",
    "blockchain",
    "Tron",
    "fraud detection",
    "VivadX",
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
