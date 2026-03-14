"use client";

import { useState, useRef, useCallback } from "react";

interface Props {
  images: string[];
  alt: string;
}

export default function ImageGallery({ images, alt }: Props) {
  const [active, setActive] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const prev = useCallback(() => setActive((i) => (i === 0 ? images.length - 1 : i - 1)), [images.length]);
  const next = useCallback(() => setActive((i) => (i === images.length - 1 ? 0 : i + 1)), [images.length]);

  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd   = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (delta < -40) next(); else if (delta > 40) prev();
    touchStartX.current = null;
  };

  if (images.length === 0) {
    return (
      <div className="relative aspect-[4/5] bg-[#EDE8DC] flex items-center justify-center">
        <p className="text-[9px] uppercase tracking-[0.4em] text-[#C4C4C4]">No Image</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div
        className="relative aspect-[4/5] overflow-hidden bg-[#EDE8DC] select-none"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={active}
          src={images[active]}
          alt={`${alt} — ${active + 1}`}
          className="h-full w-full object-cover transition-opacity duration-200"
        />

        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Previous"
              className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center bg-[#F6F1E6]/90 text-[#050608] transition hover:bg-[#F6F1E6] hover:shadow-sm"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button
              onClick={next}
              aria-label="Next"
              className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center bg-[#F6F1E6]/90 text-[#050608] transition hover:bg-[#F6F1E6] hover:shadow-sm"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <div className="absolute bottom-2 right-2 bg-[#F6F1E6]/90 px-2 py-0.5 font-mono text-[9px] text-[#050608]">
              {active + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`View ${i + 1}`}
              className={[
                "relative h-16 w-14 shrink-0 overflow-hidden transition-all duration-150",
                i === active
                  ? "ring-1 ring-[#050608] ring-offset-1 ring-offset-[#F6F1E6]"
                  : "opacity-40 hover:opacity-80",
              ].join(" ")}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`${alt} ${i + 1}`} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
