import Link from "next/link";
import type { Drop } from "@/db/schema";

export function AnnouncementBar({ drop }: { drop: Drop }) {
  return (
    <div className="bg-alert text-paper">
      <div className="mx-auto flex max-w-6xl min-w-0 items-center justify-between gap-4 px-4 py-2 sm:px-6">
        <p className="text-micro min-w-0 flex-1 truncate font-mono tracking-[0.14em] uppercase">
          {drop.name} is live
        </p>
        <Link
          href={`/drops/${drop.slug}`}
          className="text-micro hover:text-paper/80 shrink-0 font-mono tracking-[0.14em] uppercase underline underline-offset-4"
        >
          Shop now →
        </Link>
      </div>
    </div>
  );
}
