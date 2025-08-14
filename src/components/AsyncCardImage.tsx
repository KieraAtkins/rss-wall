"use client";
import React from "react";
import Image from "next/image";

type AsyncCardImageProps = {
  link: string;
  initialSrc?: string;
  alt?: string;
};

export default function AsyncCardImage({ link, initialSrc, alt = "" }: AsyncCardImageProps) {
  const [src, setSrc] = React.useState<string | undefined>(initialSrc);

  React.useEffect(() => {
    if (initialSrc) return; // already have an image, no need to fetch
    let cancelled = false;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 7000);
    (async () => {
      try {
        const res = await fetch(`/api/extract-image?url=${encodeURIComponent(link)}`, {
          signal: ctrl.signal,
          cache: "force-cache",
        });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && data?.image) {
          setSrc(data.image as string);
        }
      } catch {
        // ignore
      } finally {
        clearTimeout(timer);
      }
    })();
    return () => {
      cancelled = true;
      ctrl.abort();
      clearTimeout(timer);
    };
  }, [link, initialSrc]);

  return (
    <div className="h-44 w-full relative overflow-hidden bg-brand-header">
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          unoptimized
          loading="lazy"
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          style={{ objectFit: "cover" }}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/no-image.svg" alt="" aria-hidden="true" className="h-20 w-auto opacity-60" />
        </div>
      )}
    </div>
  );
}
