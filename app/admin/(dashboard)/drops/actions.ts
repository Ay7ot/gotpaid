"use server";

import { eq, inArray } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { db } from "@/db/index";
import { dropTable, productTable } from "@/db/schema";
import { getAdminSession } from "@/lib/admin/session";
import { slugify } from "@/lib/utils";
import { z } from "zod";

export type DropResult = { error?: string; ok?: boolean };

type DropStatus = "draft" | "scheduled" | "live" | "ended";

export async function saveDrop(formData: FormData): Promise<DropResult> {
  const session = await getAdminSession();
  if (!session) return { error: "Not authorized." };

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  let slug = String(formData.get("slug") ?? "")
    .trim()
    .toLowerCase();
  const description = String(formData.get("description") ?? "").trim() || null;
  const releaseAtRaw = String(formData.get("releaseAt") ?? "");
  const endAtRaw = String(formData.get("endAt") ?? "");
  const statusRaw = String(formData.get("status") ?? "draft");
  const productIds = formData.getAll("productIds").map(String).filter(Boolean);

  const idsParsed = z.array(z.string().uuid()).safeParse(productIds);
  if (!idsParsed.success) return { error: "Invalid product selection." };

  if (!name) return { error: "Name is required." };
  if (!slug) slug = slugify(name);

  const releaseAt = new Date(releaseAtRaw);
  if (Number.isNaN(releaseAt.getTime())) {
    return { error: "Pick a valid release date." };
  }
  let endAt: Date | null = null;
  if (endAtRaw) {
    endAt = new Date(endAtRaw);
    if (Number.isNaN(endAt.getTime())) return { error: "Invalid end date." };
  }
  if (!["draft", "scheduled", "live", "ended"].includes(statusRaw)) {
    return { error: "Invalid status." };
  }
  const status = statusRaw as DropStatus;

  const existing = await db.query.dropTable.findFirst({ where: eq(dropTable.slug, slug) });
  if (existing && existing.id !== id) return { error: "That slug is already in use." };

  try {
    let dropId = id;
    if (id) {
      await db
        .update(dropTable)
        .set({ name, slug, description, releaseAt, endAt, status })
        .where(eq(dropTable.id, id));
    } else {
      const [created] = await db
        .insert(dropTable)
        .values({ name, slug, description, releaseAt, endAt, status })
        .returning();
      dropId = created.id;
    }

    await db.update(productTable).set({ dropId: null }).where(eq(productTable.dropId, dropId));
    if (productIds.length) {
      await db.update(productTable).set({ dropId }).where(inArray(productTable.id, productIds));
    }

    revalidatePath("/");
    revalidatePath("/drops");
    revalidatePath(`/drops/${slug}`);
    revalidatePath("/admin/drops");
    updateTag("catalog");
    return { ok: true };
  } catch (error) {
    return { error: (error as Error).message };
  }
}

export async function deleteDrop(formData: FormData): Promise<DropResult> {
  const session = await getAdminSession();
  if (!session) return { error: "Not authorized." };

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing drop id." };

  try {
    await db.delete(dropTable).where(eq(dropTable.id, id));
    revalidatePath("/");
    revalidatePath("/admin/drops");
    updateTag("catalog");
    return { ok: true };
  } catch (error) {
    return { error: (error as Error).message };
  }
}
