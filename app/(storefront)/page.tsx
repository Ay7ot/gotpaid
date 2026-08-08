import type { Metadata } from "next";
import Link from "next/link";
import { Hero } from "@/components/storefront/hero";
import { Marquee } from "@/components/storefront/marquee";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ui/product-card";
import { getCollections, getFeaturedProducts, getPrimaryDrop } from "@/lib/catalog";
import { formatDate } from "@/lib/format";
import type { CatalogProduct, DropState } from "@/lib/catalog";
import type { Drop } from "@/db/schema";

export const metadata: Metadata = {
  title: "GOTPAID - Nigerian Streetwear",
  description:
    "GOTPAID is Nigerian streetwear cut in small runs. Limited drops, no restocks. Pay, get the alert, wear it first.",
};

export const revalidate = 60;

export default async function HomePage() {
  const [{ drop, state }, featured, collections] = await Promise.all([
    getPrimaryDrop(),
    getFeaturedProducts(4),
    getCollections(),
  ]);

  return (
    <>
      {drop ? (
        <Hero
          drop={drop}
          dropHref={`/drops/${drop.slug}`}
          headline={drop.name}
          tagline={drop.description ?? undefined}
        />
      ) : (
        <HeroStateNone />
      )}

      {drop ? <DropStrip drop={drop} state={state} /> : null}

      <Marquee />

      <FeaturedSection products={featured} />
      <CollectionsSection collections={collections} />
      <BrandTeaser />
    </>
  );
}

function DropStrip({ drop, state }: { drop: Drop; state: DropState }) {
  const isLive = state === "live";
  return (
    <section className="bg-void text-paper">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <Badge
            tone={isLive ? "alert" : "void"}
            className={isLive ? undefined : "border-paper text-paper"}
          >
            {isLive ? "LIVE" : "COUNTING DOWN"}
          </Badge>
          <p className="text-caption font-mono tracking-[0.08em] uppercase">{drop.name}</p>
        </div>
        <p className="text-micro text-paper/50 font-mono tracking-[0.16em] uppercase">
          {isLive ? "Shop the drop below" : `Releases ${formatDate(drop.releaseAt)}`}
        </p>
        <Link
          href={`/drops/${drop.slug}`}
          className="text-micro text-paper hover:text-paper/60 font-mono tracking-[0.16em] uppercase underline underline-offset-4"
        >
          View drop
        </Link>
      </div>
    </section>
  );
}

function FeaturedSection({ products }: { products: CatalogProduct[] }) {
  if (!products.length) return null;
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="border-hairline flex items-center justify-between border-b pb-3">
        <h2 className="text-micro text-smoke font-mono tracking-[0.18em] uppercase">Featured</h2>
        <Link
          href="/shop"
          className="text-micro font-mono tracking-[0.18em] uppercase hover:underline"
        >
          View all
        </Link>
      </div>
      <div className="mt-7 grid grid-cols-2 gap-x-4 gap-y-12 sm:grid-cols-4">
        {products.map(({ product, price, soldOut }) => (
          <ProductCard
            key={product.id}
            name={product.name}
            price={price}
            href={`/products/${product.slug}`}
            badge={soldOut ? "SOLD OUT" : undefined}
            badgeTone="alert"
          />
        ))}
      </div>
    </section>
  );
}

function CollectionsSection({
  collections,
}: {
  collections: Awaited<ReturnType<typeof getCollections>>;
}) {
  if (!collections.length) return null;
  return (
    <section className="border-hairline bg-paper border-y">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="border-hairline flex items-center justify-between border-b pb-3">
          <h2 className="text-micro text-smoke font-mono tracking-[0.18em] uppercase">
            Collections
          </h2>
        </div>
        <div className="mt-7 grid gap-6 sm:grid-cols-2">
          {collections.map((collection) => (
            <Link
              key={collection.id}
              href={`/collections/${collection.slug}`}
              className="group block"
            >
              <div className="border-hairline bg-void relative aspect-[4/3] overflow-hidden border">
                {collection.image ? (
                  // eslint-disable-next-line @next/next/no-img-element -- storage images
                  <img
                    src={collection.image}
                    alt={collection.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="text-micro text-paper/40 font-mono tracking-[0.22em] uppercase">
                      {collection.name}
                    </span>
                  </div>
                )}
              </div>
              <div className="border-hairline flex items-baseline justify-between gap-4 border-b py-2">
                <h3 className="font-display text-title tracking-display uppercase group-hover:underline">
                  {collection.name}
                </h3>
                <span className="text-micro text-smoke shrink-0 font-mono tracking-[0.14em] uppercase">
                  {collection.products.length}{" "}
                  {collection.products.length === 1 ? "piece" : "pieces"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function BrandTeaser() {
  return (
    <section className="bg-void text-paper">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:grid-cols-2 sm:px-6">
        <h2 className="font-display text-display-sm tracking-display sm:text-display leading-[0.95] uppercase">
          Pay. Get the alert. Wear it first.
        </h2>
        <div className="text-caption text-paper/70 space-y-4">
          <p>
            GOTPAID is Nigerian streetwear cut in small runs. No restocks, no second chances - when
            a drop sells out, it&rsquo;s gone. Like a message from your bank.
          </p>
          <p>
            Follow the drop schedule, set your alert, and shop on release day. That&rsquo;s the
            whole point.
          </p>
        </div>
      </div>
    </section>
  );
}

function HeroStateNone() {
  return (
    <section className="border-hairline bg-void relative w-full overflow-hidden border-b">
      <div className="mx-auto flex min-h-[75vh] w-full max-w-6xl flex-col justify-end px-4 pt-24 pb-12 sm:px-6">
        <p className="text-micro text-paper/60 font-mono tracking-[0.2em] uppercase">
          New arrivals
        </p>
        <h1 className="font-display text-display tracking-display text-paper sm:text-display-lg mt-4 leading-[0.92] uppercase">
          The shop is open
        </h1>
        <p className="text-caption text-paper/80 mt-5 max-w-md">
          Browse the archive while the next drop is being prepared.
        </p>
        <div className="mt-8">
          <Button href="/shop" variant="solid">
            Shop now
          </Button>
        </div>
        <p className="text-micro text-paper/40 mt-10 font-mono tracking-[0.2em] uppercase">
          Pay, get the alert.
        </p>
      </div>
    </section>
  );
}
