import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { ProductForm } from "@/components/admin/product-form";
import { db } from "@/db/index";
import { productTable } from "@/db/schema";

export default async function EditProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await db.query.productTable.findFirst({
    where: eq(productTable.slug, slug),
    with: { variants: true, images: true },
  });
  if (!product) notFound();

  const [collections, drops] = await Promise.all([
    db.query.collectionTable.findMany({ orderBy: (t, { asc }) => [asc(t.name)] }),
    db.query.dropTable.findMany({ orderBy: (t, { desc }) => [desc(t.releaseAt)] }),
  ]);

  return (
    <div className="max-w-3xl">
      <p className="text-micro text-smoke font-mono tracking-[0.16em] uppercase">
        <Link href="/admin/products" className="hover:underline">
          Catalog
        </Link>{" "}
        / {product.name}
      </p>
      <h1 className="font-display text-display-sm tracking-display mt-2 leading-[0.95] uppercase">
        Edit product
      </h1>
      <div className="mt-8">
        <ProductForm
          initial={{
            id: product.id,
            name: product.name,
            slug: product.slug,
            description: product.description,
            category: product.category,
            collectionId: product.collectionId,
            dropId: product.dropId,
            status: product.status,
            variants: product.variants.map((v) => ({
              id: v.id,
              size: v.size,
              color: v.color,
              sku: v.sku,
              priceOverride: v.priceOverride,
              stockQuantity: v.stockQuantity,
            })),
            images: product.images.map((i) => ({
              id: i.id,
              url: i.url,
              alt: i.alt,
            })),
          }}
          collections={collections}
          drops={drops}
        />
      </div>
    </div>
  );
}
