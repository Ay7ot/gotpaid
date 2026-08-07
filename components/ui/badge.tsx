import { cn } from "@/lib/utils";

type BadgeTone = "void" | "alert" | "smoke";

const tones: Record<BadgeTone, string> = {
  void: "border-void text-void",
  alert: "border-alert text-alert",
  smoke: "border-smoke text-smoke",
};

export function Badge({
  tone = "void",
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "text-micro inline-flex items-center border px-2 py-0.5 font-mono tracking-[0.12em] uppercase",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
