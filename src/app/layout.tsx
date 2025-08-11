import type { Metadata } from "next";
import Link from "next/link";
import { Bungee } from "next/font/google";
import Header from "@/components/Header";
import { Geist, Geist_Mono, Montserrat } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-brand",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const logoFont = Bungee({
  variable: "--font-logo",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: "News | SWAC DC",
  description: "Latest news curated by SWAC DC",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${montserrat.variable} ${geistSans.variable} ${geistMono.variable} ${logoFont.variable} bg-brand-bg text-brand-text min-h-dvh flex flex-col`}>
  <Header />

        <main className="flex-1">{children}</main>

        <footer className="bg-brand-header">
          <div className="mx-auto max-w-6xl px-4 py-10">
            <div className="align-with-nav">
              <div className="flex items-center">
                <Link href="https://www.swacdc.org" className="font-logo text-white text-xl select-none">SWAC DC</Link>
              </div>

              <nav className="site-nav mt-6">
                <ul className="flex flex-wrap items-center gap-8 text-sm">
                  <li><Link href="https://www.swacdc.org">Home</Link></li>
                  <li><a href="https://www.swacdc.org/history">About</a></li>
                  <li><a href="https://www.swacdc.org/s/stories">Stories</a></li>
                  <li><Link href="/">News</Link></li>
                  <li><a href="https://www.swacdc.org/gallery">Gallery</a></li>
                </ul>
              </nav>

              <div className="mt-10 h-px w-full border-t border-white/15" />
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
 