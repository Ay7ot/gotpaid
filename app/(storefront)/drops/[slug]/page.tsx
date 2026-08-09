import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/ui/product-card";
import { getDropBySlug, getDropProducts } from "@/lib/catalog";
import { formatDate } from "@/lib/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const drop = await getDropBySlug(slug);
  if (!drop) return { title: "Drop not found - GOTPAID" };
  return {
    title: `${drop.name} - GOTPAID`,
    description: drop.description ?? `Shop ${drop.name}.`,
  };
}

export default async function DropPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const drop = await getDropBySlug(slug);
  if (!drop) notFound();

  const products = await getDropProducts(drop.id);
  const isLive = drop.status === "live";

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <header className="border-hairline border-b pb-8">
        <p className="text-micro text-smoke font-mono tracking-[0.2em] uppercase">
          {isLive ? "Live now" : "Next drop"}
        </p>
        <h1 className="font-display text-display tracking-display mt-3 leading-[0.95] uppercase">
          {drop.name}
        </h1>
        {drop.description ? (
          <p className="text-caption text-smoke mt-4 max-w-md">{drop.description}</p>
        ) : null}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Badge tone={isLive ? "alert" : "void"}>{isLive ? "LIVE" : "COMING SOON"}</Badge>
          <span className="text-micro text-smoke font-mono tracking-[0.14em] uppercase">
            {formatDate(drop.releaseAt)}
          </span>
        </div>
      </header>

      <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-12 sm:grid-cols-3 lg:grid-cols-4">
        {products.map(({ product, price, soldOut, image }) => (
          <ProductCard
            key={product.id}
            name={product.name}
            price={price}
            href={`/products/${product.slug}`}
            imageSrc={image}
            badge={soldOut ? "SOLD OUT" : undefined}
            badgeTone="alert"
          />
        ))}
      </div>

      {products.length === 0 ? (
        <p className="text-caption text-smoke py-20 text-center font-mono tracking-[0.14em] uppercase">
          Nothing here yet - check back at release.
        </p>
      ) : null}
    </div>
  );
}
