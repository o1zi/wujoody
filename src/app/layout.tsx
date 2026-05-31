import type { Metadata } from "next";
import { Readex_Pro, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const readex = Readex_Pro({
  variable: "--font-readex",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-mono-ar",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "رِواق · منصة المكاتب الهندسية",
  description: "رِواق — أنشئ موقعاً احترافياً لمكتبك الهندسي بنطاق فرعي خاص خلال دقائق.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" className={`${readex.variable} ${mono.variable} h-full`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
