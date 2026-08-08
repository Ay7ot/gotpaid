"use server";

import { eq } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { db } from "@/db/index";
import { collectionTable } from "@/db/schema";
import { getAdminSession } from "@/lib/admin/session";
import { PRODUCT_IMAGES_BUCKET, uploadToStorage } from "@/lib/supabase/storage";
import { slugify } from "@/lib/utils";

export type CollectionResult = { error?: string; ok?: boolean };

export async function createCollection(formData: FormData): Promise<CollectionResult> {
  const session = await getAdminSession();
  if (!session) return { error: "Not authorized." };

  const name = String(formData.get("name") ?? "").trim();
  let slug = String(formData.get("slug") ?? "")
    .trim()
    .toLowerCase();
  const description = String(formData.get("description") ?? "").trim() || null;
  const image = String(formData.get("image") ?? "").trim() || null;

  if (!name) return { error: "Name is required." };
  if (!slug) slug = slugify(name);

  const existing = await db.query.collectionTable.findFirst({
    where: eq(collectionTable.slug, slug),
  });
  if (existing) return { error: "That slug is already in use." };

  try {
    await db.insert(collectionTable).values({ name, slug, description, image });
    revalidatePath("/");
    revalidatePath("/admin/products");
    revalidatePath("/admin/collections");
    updateTag("catalog");
    return { ok: true };
  } catch (error) {
    return { error: (error as Error).message };
  }
}

export async function uploadCollectionImage(
  formData: FormData,
): Promise<{ url?: string; error?: string }> {
  const session = await getAdminSession();
  if (!session) return { error: "Not authorized." };

  const file = formData.get("file");
  if (!(file instanceof File)) return { error: "No file provided." };
  if (file.size > 10 * 1024 * 1024) return { error: "Image must be under 10MB." };

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `collections/${crypto.randomUUID()}.${ext}`;

  try {
    const url = await uploadToStorage(PRODUCT_IMAGES_BUCKET, path, file, file.type);
    return { url };
  } catch (error) {
    return { error: (error as Error).message };
  }
}

export async function deleteCollection(formData: FormData): Promise<CollectionResult> {
  const session = await getAdminSession();
  if (!session) return { error: "Not authorized." };

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing collection id." };

  try {
    await db.delete(collectionTable).where(eq(collectionTable.id, id));
    revalidatePath("/");
    revalidatePath("/admin/products");
    revalidatePath("/admin/collections");
    updateTag("catalog");
    return { ok: true };
  } catch (error) {
    return { error: (error as Error).message };
  }
}
