import { existsSync } from "node:fs";
import { join } from "node:path";

const VIDEO_PATH = join(process.cwd(), "public", "videos", "hero.mp4");
const POSTER_PATH = join(process.cwd(), "public", "videos", "hero-poster.jpg");

export function HeroVideo() {
  const hasVideo = existsSync(VIDEO_PATH);
  const hasPoster = existsSync(POSTER_PATH);

  return (
    <>
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
        <div className="absolute inset-0 bg-void" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-void via-void/50 to-void/10" />
    </>
  );
}
