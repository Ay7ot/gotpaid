"use client";

import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export type GalleryImage = { url: string; alt: string | null; position: number };

export function ProductGallery({ images, name }: { images: GalleryImage[]; name: string }) {
  const items = [...images].sort((a, b) => a.position - b.position);
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const current = items[active];

  const go = useCallback(
    (direction: -1 | 1) => {
      setActive((prev) => (prev + direction + items.length) % items.length);
    },
    [items.length],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
      if (event.key === "ArrowRight") go(1);
      if (event.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, go]);

  if (!items.length) {
    return (
      <div className="border-hairline bg-paper relative aspect-[4/5] border">
        {/* eslint-disable-next-line @next/next/no-img-element -- placeholder */}
        <img
          src="/images/product-placeholder.png"
          alt={`${name} - image pending`}
          className="h-full w-full object-cover"
        />
        <span className="text-micro text-smoke absolute bottom-4 left-4 font-mono tracking-[0.14em] uppercase">
          Shot pending
        </span>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`View ${name} image full screen`}
        className="border-hairline bg-paper relative block aspect-[4/5] w-full cursor-zoom-in border"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- storage images */}
        <img src={current.url} alt={current.alt ?? name} className="h-full w-full object-cover" />
        <span className="bg-paper/80 text-micro text-smoke absolute bottom-4 left-4 px-2 py-1 font-mono tracking-[0.14em] uppercase">
          {active + 1} / {items.length} · Tap to view
        </span>
      </button>

      {items.length > 1 ? (
        <div className="mt-3 flex gap-3">
          {items.map((image, index) => (
            <button
              key={image.url + index}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`${name} image ${index + 1}`}
              className={cn(
                "border-hairline relative h-20 w-16 border transition-colors",
                active === index && "border-void",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- storage images */}
              <img src={image.url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}

      {open ? (
        <div
          className="bg-void/95 fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`${name} image viewer`}
          onClick={() => setOpen(false)}
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close image viewer"
            className="text-lead text-paper hover:text-paper/60 absolute top-4 right-4 flex h-11 w-11 items-center justify-center font-mono"
          >
            ✕
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              go(-1);
            }}
            aria-label="Previous image"
            className="text-display-sm text-paper/70 hover:text-paper absolute left-2 flex h-12 w-12 items-center justify-center font-mono sm:left-6"
          >
            ←
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element -- storage images */}
          <img
            src={current.url}
            alt={current.alt ?? name}
            onClick={(event) => event.stopPropagation()}
            className="max-h-full max-w-full object-contain"
          />
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              go(1);
            }}
            aria-label="Next image"
            className="text-display-sm text-paper/70 hover:text-paper absolute right-2 flex h-12 w-12 items-center justify-center font-mono sm:right-6"
          >
            →
          </button>
          <p className="text-micro text-paper/60 absolute bottom-6 left-1/2 -translate-x-1/2 font-mono tracking-[0.2em] uppercase">
            {active + 1} / {items.length}
          </p>
        </div>
      ) : null}
    </div>
  );
}
