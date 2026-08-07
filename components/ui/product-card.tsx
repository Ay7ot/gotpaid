import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatNaira } from "@/lib/format";
import { cn } from "@/lib/utils";

type ProductCardProps = {
  name: string;
  price: number;
  imageSrc?: string | null;
  alt?: string;
  badge?: string;
  badgeTone?: "void" | "alert" | "smoke";
  href?: string;
  className?: string;
};

export function ProductCard({
  name,
  price,
  imageSrc,
  alt,
  badge,
  badgeTone = "void",
  href = "#",
  className,
}: ProductCardProps) {
  return (
    <Link href={href} className={cn("group block", className)}>
      <div className="border-hairline relative aspect-[4/5] overflow-hidden border">
        {/* eslint-disable-next-line @next/next/no-img-element -- remote/placeholder images */}
        <img
          src={imageSrc ?? "/images/product-placeholder.png"}
          alt={alt ?? name}
          className="h-full w-full object-cover"
        />
        {badge ? (
          <Badge tone={badgeTone} className="bg-paper absolute top-3 left-3">
            {badge}
          </Badge>
        ) : null}
      </div>
      <div className="border-hairline flex items-baseline justify-between gap-4 border-b py-2">
        <h3 className="text-caption font-mono tracking-[0.04em] uppercase group-hover:underline">
          {name}
        </h3>
        <p className="text-caption shrink-0 font-mono">{formatNaira(price)}</p>
      </div>
    </Link>
  );
}
