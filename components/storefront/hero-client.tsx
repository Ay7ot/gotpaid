"use client";

import { useState } from "react";
import { Countdown } from "@/components/storefront/countdown";
import { NotifyMe } from "@/components/storefront/notify-me";
import { Button } from "@/components/ui/button";
import type { Drop } from "@/db/schema";

export function HeroClient({
  drop,
  hasVideo,
  hasPoster,
  dropHref,
  headline,
  tagline,
  ctaLabel,
  ctaHref,
}: {
  drop: Drop;
  hasVideo: boolean;
  hasPoster: boolean;
  dropHref?: string;
  headline: string;
  tagline?: string;
  ctaLabel: string;
  ctaHref: string;
}) {
  const [isLive, setIsLive] = useState(drop.status === "live");

  return (
    <section className="border-hairline bg-void relative w-full overflow-hidden border-b">
      {hasVideo ? (
        <video
          autoPlay
          muted
          loop
          playsInline
          poster={hasPoster ? "/videos/hero-poster.jpg" : undefined}
          className="absolute inset-0 h-full w-full object-cover opacity-70"
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>
      ) : (
        <div className="bg-void absolute inset-0" />
      )}
      <div className="from-void via-void/50 to-void/10 absolute inset-0 bg-gradient-to-t" />

      <div className="relative z-10 mx-auto flex min-h-[80vh] w-full max-w-6xl flex-col justify-end px-4 pt-24 pb-12 sm:px-6 sm:pb-16">
        <p className="text-micro text-paper/60 font-mono tracking-[0.2em] uppercase">
          {isLive ? "LIVE NOW" : "NEXT DROP"}
        </p>
        <h1 className="font-display text-display tracking-display text-paper sm:text-display-lg mt-4 leading-[0.92] uppercase">
          {headline}
        </h1>
        {tagline ? <p className="text-caption text-paper/80 mt-5 max-w-md">{tagline}</p> : null}

        {isLive ? (
          <div className="mt-8">
            <Button href={dropHref ?? ctaHref} variant="solid">
              {ctaLabel}
            </Button>
            <span className="text-micro text-paper/50 ml-4 hidden font-mono tracking-[0.14em] uppercase sm:inline">
              {drop.name}
            </span>
          </div>
        ) : (
          <>
            <Countdown releaseAt={drop.releaseAt} onLive={() => setIsLive(true)} />
            <NotifyMe dropId={drop.id} />
          </>
        )}

        <p className="text-micro text-paper/40 mt-10 font-mono tracking-[0.2em] uppercase">
          Pay, get the alert.
        </p>
      </div>
    </section>
  );
}
