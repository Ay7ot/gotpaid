import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { PdpBuyBox } from "@/components/storefront/pdp-buy-box";
import { ProductGallery } from "@/components/storefront/product-gallery";
import { ProductCard } from "@/components/ui/product-card";
import { db } from "@/db/index";
import { productTable } from "@/db/schema";
import { getRelatedProducts, productPrice, productSoldOut } from "@/lib/catalog";
import { formatDate, isInFuture } from "@/lib/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await db.query.productTable.findFirst({
    where: eq(productTable.slug, slug),
  });
  if (!product) return { title: "Product not found - GOTPAID" };
  return {
    title: `${product.name} - GOTPAID`,
    description: product.description ?? `Shop ${product.name} at GOTPAID.`,
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await db.query.productTable.findFirst({
    where: eq(productTable.slug, slug),
    with: { variants: true, images: true, collection: true, drop: true },
  });
  if (!product) notFound();

  const price = productPrice(product.variants);
  const soldOut = productSoldOut(product.variants);
  const related = await getRelatedProducts(product);
  const upcoming = Boolean(product.drop && isInFuture(product.drop.releaseAt));

  const parentHref = product.collection
    ? `/collections/${product.collection.slug}`
    : product.drop
      ? `/drops/${product.drop.slug}`
      : "/shop";
  const parentName = product.collection?.name ?? product.drop?.name ?? "Shop";

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <p className="text-micro text-smoke font-mono tracking-[0.14em] uppercase">
        <Link href="/shop" className="hover:underline">
          Shop
        </Link>
        <span className="mx-2">/</span>
        <Link href={parentHref} className="hover:underline">
          {parentName}
        </Link>
      </p>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images} name={product.name} />

        <div className="flex flex-col">
          <p className="text-micro text-smoke font-mono tracking-[0.18em] uppercase">
            {product.category ?? "GOTPAID"}
          </p>
          <h1 className="font-display text-display-sm tracking-display sm:text-display mt-2 leading-[0.95] uppercase">
            {product.name}
          </h1>
          {product.description ? (
            <p className="text-caption text-smoke mt-4 max-w-md">{product.description}</p>
          ) : null}

          {upcoming ? (
            <div className="border-hairline mt-7 border p-5">
              <p className="text-micro text-alert font-mono tracking-[0.18em] uppercase">
                Coming soon
              </p>
              <p className="text-caption mt-3 font-mono">
                Releases {formatDate(product.drop!.releaseAt)}
              </p>
              <p className="text-caption text-smoke mt-2">
                Purchase opens the moment the drop goes live.
              </p>
            </div>
          ) : (
            <PdpBuyBox
              productId={product.id}
              slug={product.slug}
              name={product.name}
              basePrice={price}
              variants={product.variants.map((variant) => ({
                id: variant.id,
                size: variant.size,
                color: variant.color,
                priceOverride: variant.priceOverride,
                stockQuantity: variant.stockQuantity,
                reservedQuantity: variant.reservedQuantity,
              }))}
            />
          )}

          <dl className="border-hairline text-caption mt-8 space-y-2 border-t pt-5 font-mono">
            {product.category ? (
              <div className="flex justify-between gap-4">
                <dt className="text-smoke">Category</dt>
                <dd>{product.category}</dd>
              </div>
            ) : null}
            <div className="flex justify-between gap-4">
              <dt className="text-smoke">SKU</dt>
              <dd>{product.variants[0]?.sku ?? "-"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-smoke">Status</dt>
              <dd className={soldOut ? "text-alert" : undefined}>
                {soldOut ? "Sold out" : "In stock"}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {related.length ? (
        <section className="mt-20">
          <h2 className="text-micro text-smoke font-mono tracking-[0.18em] uppercase">Related</h2>
          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-12 sm:grid-cols-4">
            {related.map(
              ({ product: item, price: itemPrice, soldOut: itemSoldOut, image: itemImage }) => (
                <ProductCard
                  key={item.id}
                  name={item.name}
                  price={itemPrice}
                  href={`/products/${item.slug}`}
                  imageSrc={itemImage}
                  badge={itemSoldOut ? "SOLD OUT" : undefined}
                  badgeTone="alert"
                />
              ),
            )}
          </div>
        </section>
      ) : null}
    </div>
  );
}
