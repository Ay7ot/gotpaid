import { Hero } from "@/components/storefront/hero";
import { ProductCard } from "@/components/ui/product-card";

const placeholderProducts = [
  { name: "VARSITY JACKET", price: 68000 },
  { name: "HEAVYWEIGHT TEE", price: 18000 },
  { name: "CARGO PANT", price: 42000 },
  { name: "BEANIE", price: 9500 },
];

export default function HomePage() {
  return (
    <>
      <Hero dropName="DROP 004 — OKRIKA" description="Inspired by the streets of Port Harcourt." />

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="border-hairline flex items-center justify-between border-b pb-3">
          <h2 className="text-micro text-smoke font-mono tracking-[0.12em] uppercase">FEATURED</h2>
          <a
            href="/shop"
            className="text-micro font-mono tracking-[0.12em] uppercase hover:underline"
          >
            VIEW ALL
          </a>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-4">
          {placeholderProducts.map((product) => (
            <ProductCard
              key={product.name}
              name={product.name}
              price={product.price}
              href={`/products/${product.name.toLowerCase().replace(/\s+/g, "-")}`}
            />
          ))}
        </div>
      </section>
    </>
  );
}
