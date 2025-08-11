import type { Metadata } from "next";
import Link from "next/link";
import { Bungee } from "next/font/google";
import Header from "@/components/Header";
import { Geist, Geist_Mono, Montserrat } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

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

              <div className="mt-6 flex items-center justify-between">
                <nav className="site-nav">
                  <ul className="flex flex-wrap items-center gap-8 text-sm">
                    <li><Link href="https://www.swacdc.org">Home</Link></li>
                    <li><a href="https://www.swacdc.org/history">About</a></li>
                    <li><a href="https://www.swacdc.org/s/stories">Stories</a></li>
                    <li><Link href="/">News</Link></li>
                    <li><a href="https://www.swacdc.org/gallery">Gallery</a></li>
                  </ul>
                </nav>
                <div className="flex items-center gap-4">
                  <a
                    href="https://www.instagram.com/swac_dc"
                    className="social-btn social-ig"
                    aria-label="SWAC DC on Instagram"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {/* Instagram icon */}
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="3" width="18" height="18" rx="4.5" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.2"/>
                      <path d="M12 8.75a3.25 3.25 0 1 0 0 6.5 3.25 3.25 0 0 0 0-6.5Z" stroke="currentColor" strokeWidth="1.5"/>
                      <circle cx="16.5" cy="7.5" r="1.25" fill="currentColor"/>
                    </svg>
                  </a>
                  <a
                    href="https://twitter.com/SWAC_DC"
                    className="social-btn social-x"
                    aria-label="SWAC DC on X (Twitter)"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {/* X (Twitter) icon */}
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18.244 3.515h2.522l-5.51 6.297 6.48 8.673h-5.072l-3.969-5.2-4.541 5.2H5.631l5.892-6.75L5.25 3.515h5.212l3.593 4.79 4.189-4.79Zm-.885 13.292.698.915h1.395l-4.63-6.09-1.06 1.214 3.597 3.961Z"/>
                    </svg>
                  </a>
                </div>
              </div>

              <div className="mt-10 h-px w-full border-t border-white/15" />
            </div>
          </div>
        </footer>
         <Analytics />
         <SpeedInsights />
      </body>
    </html>
  );
}
 