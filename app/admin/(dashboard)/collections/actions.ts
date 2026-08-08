"use server";

import { eq } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { db } from "@/db/index";
import { collectionTable } from "@/db/schema";
import { getAdminSession } from "@/lib/admin/session";
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

  if (!name) return { error: "Name is required." };
  if (!slug) slug = slugify(name);

  const existing = await db.query.collectionTable.findFirst({
    where: eq(collectionTable.slug, slug),
  });
  if (existing) return { error: "That slug is already in use." };

  try {
    await db.insert(collectionTable).values({ name, slug, description });
    revalidatePath("/");
    revalidatePath("/admin/products");
    revalidatePath("/admin/collections");
    updateTag("catalog");
    return { ok: true };
  } catch (error) {
    return { error: (error as Error).message };
  }
}
