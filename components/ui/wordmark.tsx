import Image from "next/image";
import { cn } from "@/lib/utils";

export function Wordmark({ className }: { className?: string }) {
  return (
    <Image
      src="/logo-wordmark.png"
      alt="GOTPAID"
      width={170}
      height={80}
      priority
      className={cn("h-8 w-auto", className)}
    />
  );
}
