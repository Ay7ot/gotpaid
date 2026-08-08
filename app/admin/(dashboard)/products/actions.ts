"use server";

import { and, eq, notInArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db/index";
import { productImageTable, productTable, variantTable } from "@/db/schema";
import { getAdminSession } from "@/lib/admin/session";
import { PRODUCT_IMAGES_BUCKET, uploadToStorage } from "@/lib/supabase/storage";
import { slugify } from "@/lib/utils";

export type SaveResult = { error?: string; ok?: boolean };

export async function saveProduct(formData: FormData): Promise<SaveResult> {
  const session = await getAdminSession();
  if (!session) return { error: "Not authorized." };

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  let slug = String(formData.get("slug") ?? "")
    .trim()
    .toLowerCase();
  const description = String(formData.get("description") ?? "").trim() || null;
  const category = String(formData.get("category") ?? "").trim() || null;
  const collectionId = String(formData.get("collection") ?? "").trim() || null;
  const dropId = String(formData.get("drop") ?? "").trim() || null;
  const statusRaw = String(formData.get("status") ?? "draft");
  if (!["draft", "published", "archived"].includes(statusRaw)) {
    return { error: "Invalid status." };
  }
  const status = statusRaw as "draft" | "published" | "archived";

  let variants: {
    id?: string;
    size?: string;
    color?: string;
    sku?: string;
    price?: string;
    stock?: string;
  }[] = [];
  let images: { id?: string; url: string; alt?: string }[] = [];

  try {
    variants = JSON.parse(String(formData.get("variants") ?? "[]"));
    images = JSON.parse(String(formData.get("images") ?? "[]"));
  } catch {
    return { error: "Invalid variant or image data." };
  }

  if (!name) return { error: "Name is required." };
  if (!slug) slug = slugify(name);
  if (!["draft", "published", "archived"].includes(status)) {
    return { error: "Invalid status." };
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return { error: "Slug can only contain lowercase letters, numbers, and hyphens." };
  }

  const existing = await db.query.productTable.findFirst({
    where: eq(productTable.slug, slug),
  });
  if (existing && existing.id !== id) return { error: "That slug is already in use." };

  try {
    let productId = id;
    if (id) {
      await db
        .update(productTable)
        .set({ name, slug, description, category, collectionId, dropId, status })
        .where(eq(productTable.id, id));
    } else {
      const [created] = await db
        .insert(productTable)
        .values({ name, slug, description, category, collectionId, dropId, status })
        .returning();
      productId = created.id;
    }

    const submittedVariantIds = variants.map((v) => v.id).filter((x): x is string => Boolean(x));
    await db
      .delete(variantTable)
      .where(
        and(
          eq(variantTable.productId, productId),
          submittedVariantIds.length ? notInArray(variantTable.id, submittedVariantIds) : undefined,
        ),
      );
    for (const v of variants) {
      const values = {
        size: v.size?.trim() || null,
        color: v.color?.trim() || null,
        sku: v.sku?.trim() || null,
        priceOverride: v.price ? Math.round(Number(v.price) * 100) : null,
        stockQuantity: Math.max(0, Number(v.stock) || 0),
      };
      if (v.id) {
        await db.update(variantTable).set(values).where(eq(variantTable.id, v.id));
      } else {
        await db.insert(variantTable).values({ productId, ...values });
      }
    }

    const submittedImageIds = images.map((i) => i.id).filter((x): x is string => Boolean(x));
    await db
      .delete(productImageTable)
      .where(
        and(
          eq(productImageTable.productId, productId),
          submittedImageIds.length
            ? notInArray(productImageTable.id, submittedImageIds)
            : undefined,
        ),
      );
    for (const [index, image] of images.entries()) {
      const values = {
        url: image.url,
        alt: image.alt?.trim() || null,
        position: index,
      };
      if (image.id) {
        await db.update(productImageTable).set(values).where(eq(productImageTable.id, image.id));
      } else {
        await db.insert(productImageTable).values({ productId, ...values });
      }
    }

    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath(`/products/${slug}`);
    revalidatePath("/admin/products");
    return { ok: true };
  } catch (error) {
    return { error: (error as Error).message };
  }
}

export async function uploadProductImage(
  formData: FormData,
): Promise<{ url?: string; error?: string }> {
  const session = await getAdminSession();
  if (!session) return { error: "Not authorized." };

  const file = formData.get("file");
  if (!(file instanceof File)) return { error: "No file provided." };
  if (file.size > 10 * 1024 * 1024) return { error: "Image must be under 10MB." };

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `products/${crypto.randomUUID()}.${ext}`;

  try {
    const url = await uploadToStorage(PRODUCT_IMAGES_BUCKET, path, file, file.type);
    return { url };
  } catch (error) {
    return { error: (error as Error).message };
  }
}
