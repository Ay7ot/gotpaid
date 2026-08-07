"use client";

import { useEffect, useMemo, useState } from "react";

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function Countdown({
  releaseAt,
  onLive,
}: {
  releaseAt: string | Date;
  onLive?: () => void;
}) {
  const target = useMemo(() => new Date(releaseAt).getTime(), [releaseAt]);
  const [now, setNow] = useState(() => Date.now());
  const diff = Math.max(0, target - now);
  const live = diff <= 0;

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (live) onLive?.();
  }, [live, onLive]);

  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor(diff / 3_600_000) % 24;
  const minutes = Math.floor(diff / 60_000) % 60;
  const seconds = Math.floor(diff / 1000) % 60;

  const cells = [
    { value: pad(days), label: "DAYS" },
    { value: pad(hours), label: "HRS" },
    { value: pad(minutes), label: "MIN" },
    { value: pad(seconds), label: "SEC" },
  ];

  return (
    <div className="border-paper/30 bg-void/60 mt-7 w-full max-w-md border p-4 backdrop-blur-sm sm:p-5">
      <p className="text-micro text-paper/60 font-mono tracking-[0.18em] uppercase">RELEASES IN</p>
      <div className="mt-3 flex items-stretch gap-1.5">
        {cells.map((cell, index) => (
          <div key={cell.label} className="flex flex-1 items-stretch gap-1.5">
            <div className="border-paper/25 flex min-w-0 flex-1 flex-col items-center justify-center border px-1 py-2 sm:px-2">
              <span className="text-display-sm text-paper sm:text-display font-mono leading-none">
                {cell.value}
              </span>
              <span className="text-micro text-paper/50 mt-1.5 font-mono tracking-[0.14em] uppercase">
                {cell.label}
              </span>
            </div>
            {index < cells.length - 1 ? (
              <span className="text-lead text-alert w-2 shrink-0 self-center font-mono">:</span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
