import { cn } from "@/lib/utils";

export function Wordmark({ className }: { className?: string }) {
  return <span className={cn("font-display text-title tracking-display", className)}>GOTPAID</span>;
}
