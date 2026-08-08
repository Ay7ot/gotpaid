"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export type GalleryImage = { url: string; alt: string | null; position: number };

export function ProductGallery({ images, name }: { images: GalleryImage[]; name: string }) {
  const items = [...images].sort((a, b) => a.position - b.position);
  const [active, setActive] = useState(0);
  const current = items[active];

  return (
    <div>
      <div className="border-hairline bg-paper relative aspect-[4/5] border">
        {/* eslint-disable-next-line @next/next/no-img-element -- remote/placeholder images */}
        <img
          src={current?.url ?? "/images/product-placeholder.png"}
          alt={current?.alt ?? `${name} - image pending`}
          className="h-full w-full object-cover"
        />
        {!current ? (
          <span className="text-micro text-smoke absolute bottom-4 left-4 font-mono tracking-[0.14em] uppercase">
            Shot pending
          </span>
        ) : null}
      </div>
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
              {/* eslint-disable-next-line @next/next/no-img-element -- remote images */}
              <img src={image.url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
