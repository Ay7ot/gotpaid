import { existsSync } from "node:fs";
import { join } from "node:path";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const VIDEO_DIR = join(process.cwd(), "public", "videos");

export function Hero({
  dropName,
  description,
  status = "live",
}: {
  dropName: string;
  description?: string;
  status?: "scheduled" | "live" | "none";
}) {
  const videoPath = join(VIDEO_DIR, "hero.mp4");
  const posterPath = join(VIDEO_DIR, "hero-poster.jpg");
  const hasVideo = existsSync(videoPath);

  return (
    <section className="border-hairline bg-void relative w-full border-b">
      {hasVideo ? (
        <video
          autoPlay
          muted
          loop
          playsInline
          poster={existsSync(posterPath) ? "/videos/hero-poster.jpg" : undefined}
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>
      ) : (
        <div className="bg-void absolute inset-0 flex items-center justify-center">
          <p className="text-micro text-paper/40 px-4 text-center font-mono tracking-[0.16em] uppercase">
            DROP FILM — VIDEO SLOT
          </p>
        </div>
      )}

      <div className="relative z-10 flex min-h-[72vh] flex-col justify-end p-4 sm:p-8">
        <div className="bg-void/70 max-w-xl p-5 backdrop-blur-sm sm:p-6">
          <Badge tone="alert" className="bg-void">
            {status === "live" ? "LIVE" : "COMING SOON"}
          </Badge>
          <h1 className="font-display text-display-sm tracking-display text-paper sm:text-display mt-3 leading-none uppercase">
            {dropName}
          </h1>
          {description ? <p className="text-caption text-paper/80 mt-3">{description}</p> : null}
          <p className="text-caption text-paper/80 mt-4 font-mono">RELEASES IN 02:14:36:09</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button href="/drops" variant="solid">
              {status === "live" ? "SHOP NOW" : "NOTIFY ME"}
            </Button>
            <Button
              href="#notify"
              variant="outline"
              className="border-paper text-paper hover:bg-paper hover:text-void"
            >
              NOTIFY ME
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
