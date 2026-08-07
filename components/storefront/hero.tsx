import { existsSync } from "node:fs";
import { join } from "node:path";
import type { Drop } from "@/db/schema";
import { HeroClient } from "@/components/storefront/hero-client";

const VIDEO_PATH = join(process.cwd(), "public", "videos", "hero.mp4");
const POSTER_PATH = join(process.cwd(), "public", "videos", "hero-poster.jpg");

export function Hero({
  drop,
  dropHref,
  headline,
  tagline,
  ctaLabel = "SHOP NOW",
  ctaHref = "/shop",
}: {
  drop: Drop;
  dropHref?: string;
  headline: string;
  tagline?: string;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  const hasVideo = existsSync(VIDEO_PATH);
  const hasPoster = existsSync(POSTER_PATH);

  return (
    <HeroClient
      drop={drop}
      hasVideo={hasVideo}
      hasPoster={hasPoster}
      dropHref={dropHref}
      headline={headline}
      tagline={tagline}
      ctaLabel={ctaLabel}
      ctaHref={ctaHref}
    />
  );
}
