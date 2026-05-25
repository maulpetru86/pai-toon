import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "PAI-Toon — Komik Pendidikan Agama Islam",
    template: "%s | PAI-Toon",
  },
  description:
    "Platform komik pendidikan agama Islam untuk siswa SMA. Belajar PAI jadi lebih seru, visual, dan mudah dipahami!",
  keywords: [
    "PAI",
    "komik pendidikan",
    "agama Islam",
    "SMA",
    "webtoon",
    "belajar",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
