"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) document.documentElement.classList.add("overflow-hidden");
    else document.documentElement.classList.remove("overflow-hidden");
    return () => document.documentElement.classList.remove("overflow-hidden");
  }, [open]);

  return (
  <header className="bg-brand-header min-h-[64px] pt-[10px]">
      <div className="mx-auto max-w-6xl px-4 py-4 grid grid-cols-3 items-center">
  {/* Left column: keep present at all sizes to maintain 3-col grid */}
        <div className="flex items-center">
          <button
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="site-menu"
            onClick={() => setOpen((v) => !v)}
            className="hide-above-800 inline-flex flex-col justify-center gap-1 p-1.5 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
          >
            <span className={`block h-0.5 w-5 rounded bg-white transition-transform ${open ? "translate-y-1.5 rotate-45" : ""}`} />
            <span className={`block h-0.5 w-5 rounded bg-white transition-opacity ${open ? "opacity-0" : "opacity-100"}`} />
            <span className={`block h-0.5 w-5 rounded bg-white transition-transform ${open ? "-translate-y-1.5 -rotate-45" : ""}`} />
            
          </button>

          {/* Inline nav (≥800px) */}
          <nav className="site-nav show-above-800 nav-offset text-sm relative z-10">
            <ul className="flex items-center gap-8">
              <li><Link href="https://www.swacdc.org">Home</Link></li>
              <li><a href="https://www.swacdc.org/about">About</a></li>
              <li><a href="https://www.swacdc.org/s/stories">Stories</a></li>
              <li><Link href="/">News</Link></li>
              <li><a href="https://www.swacdc.org/gallery">Gallery</a></li>
            </ul>
          </nav>
        </div>

        {/* Center logo */}
        <div className="flex justify-center pointer-events-none">
          <Link href="https://www.swacdc.org" className="inline-flex items-center gap-2 select-none pointer-events-auto">
            <span className="font-logo text-lg tracking-[0.05em] text-white">SWAC DC</span>
          </Link>
        </div>

  {/* Right column reserved for future icons */}
  <div />
      </div>


      {/* Overlay menu */}
      <div
        id="site-menu"
        className={`fixed inset-0 z-50 transition-opacity ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      >
        {/* Backdrop */}
        <button
          aria-label="Close menu"
          onClick={() => setOpen(false)}
          className="absolute inset-0 h-full w-full bg-black/60"
        />
        {/* Panel */}
  <nav className="site-nav absolute left-0 top-0 h-full w-72 max-w-[80vw] bg-brand-header border-r border-brand-border shadow-brand p-4 text-sm">
          <ul className="flex flex-col divide-y divide-white/10">
            <li>
              <a href="https://www.swacdc.org" className="block px-2 py-3 text-white" onClick={() => setOpen(false)}>
                Home
              </a>
            </li>
            <li>
              <a href="https://www.swacdc.org/about" className="block px-2 py-3 text-white" onClick={() => setOpen(false)}>
                About
              </a>
            </li>
            <li>
              <a href="https://www.swacdc.org/s/stories" className="block px-2 py-3 text-white" onClick={() => setOpen(false)}>
                Stories
              </a>
            </li>
            <li>
              <Link href="/" className="block px-2 py-3 text-white" onClick={() => setOpen(false)}>
                News
              </Link>
            </li>
            <li>
              <a href="https://www.swacdc.org/gallery" className="block px-2 py-3 text-white" onClick={() => setOpen(false)}>
                Gallery
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
