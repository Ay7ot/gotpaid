import { hash } from "bcryptjs";
import { db } from "@/db/index";
import {
  adminUserTable,
  addressTable,
  collectionTable,
  customerTable,
  discountCodeTable,
  dropTable,
  orderItemTable,
  orderTable,
  productTable,
  variantTable,
} from "@/db/schema";

function loadEnv() {
  try {
    process.loadEnvFile(".env.local");
  } catch {
    try {
      process.loadEnvFile(".env");
    } catch {
      // no env file found
    }
  }
}

loadEnv();

async function main() {
  await db.delete(orderItemTable);
  await db.delete(orderTable);
  await db.delete(addressTable);
  await db.delete(customerTable);
  await db.delete(variantTable);
  await db.delete(productTable);
  await db.delete(dropTable);
  await db.delete(collectionTable);
  await db.delete(discountCodeTable);
  await db.delete(adminUserTable);

  const [core] = await db
    .insert(collectionTable)
    .values({ name: "Core", slug: "core", description: "The Godpaid foundation pieces." })
    .returning();

  const [okrika] = await db
    .insert(dropTable)
    .values({
      name: "DROP 004 - OKRIKA",
      slug: "drop-004-okrika",
      description: "Inspired by the streets of Port Harcourt.",
      releaseAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      status: "live",
    })
    .returning();

  const [bolt] = await db
    .insert(dropTable)
    .values({
      name: "DROP 005 - BOLT",
      slug: "drop-005-bolt",
      description: "Fast. On time. Gone.",
      releaseAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      status: "scheduled",
    })
    .returning();

  const products = [
    {
      name: "Varsity Jacket",
      slug: "varsity-jacket",
      description: "Heavyweight varsity with embroidered wordmark.",
      category: "Outerwear",
      dropId: okrika.id,
      variants: [
        { size: "S", stock: 0 },
        { size: "M", stock: 0 },
        { size: "L", stock: 0 },
        { size: "XL", stock: 0 },
      ],
    },
    {
      name: "Heavyweight Tee",
      slug: "heavyweight-tee",
      description: "240gsm boxy tee. Pre-shrunk.",
      category: "Tops",
      dropId: okrika.id,
      variants: [
        { size: "S", stock: 20 },
        { size: "M", stock: 15 },
        { size: "L", stock: 10 },
        { size: "XL", stock: 5 },
      ],
    },
    {
      name: "Cargo Pant",
      slug: "cargo-pant",
      description: "Tapered cargo, six pockets.",
      category: "Bottoms",
      dropId: okrika.id,
      variants: [
        { size: "30", stock: 0 },
        { size: "32", stock: 0 },
        { size: "34", stock: 0 },
      ],
    },
    {
      name: "Beanie",
      slug: "beanie",
      description: "Ribbed knit, embroidered logo.",
      category: "Accessories",
      dropId: bolt.id,
      variants: [{ size: "OS", stock: 30 }],
    },
    {
      name: "Long Sleeve",
      slug: "long-sleeve",
      description: "Midweight long sleeve, printed chest.",
      category: "Tops",
      dropId: bolt.id,
      variants: [
        { size: "M", stock: 12 },
        { size: "L", stock: 9 },
      ],
    },
  ];

  const basePrices: Record<string, number> = {
    "varsity-jacket": 68000,
    "heavyweight-tee": 18000,
    "cargo-pant": 42000,
    beanie: 9500,
    "long-sleeve": 22000,
  };

  for (const product of products) {
    const [inserted] = await db
      .insert(productTable)
      .values({
        name: product.name,
        slug: product.slug,
        description: product.description,
        category: product.category,
        dropId: product.dropId,
        collectionId: core.id,
        status: "published",
      })
      .returning();

    await db.insert(variantTable).values(
      product.variants.map((variant) => ({
        productId: inserted.id,
        size: variant.size,
        sku: `${product.slug.toUpperCase()}-${variant.size}`,
        priceOverride: basePrices[product.slug] * 100,
        stockQuantity: variant.stock,
        reservedQuantity: 0,
      })),
    );
  }

  const adminPassword = process.env.ADMIN_SEED_PASSWORD ?? "gotpaid-admin-dev";
  await db.insert(adminUserTable).values({
    name: "Ayomide",
    email: "admin@gotpaid.ng",
    role: "owner",
    passwordHash: await hash(adminPassword, 12),
  });

  console.log("Seed complete.");
  console.log("  Collections:", 1);
  console.log("  Drops:", 2);
  console.log("  Products:", products.length);
  console.log("  Admin user: admin@gotpaid.ng");
  console.log(`  Admin password: ${adminPassword} (override with ADMIN_SEED_PASSWORD)`);
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
