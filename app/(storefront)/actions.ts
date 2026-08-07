"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db/index";
import { dropNotificationTable } from "@/db/schema";

export type NotifyState = { error?: string; success?: boolean } | undefined;

const EMAIL_RE = /^\S+@\S+\.\S+$/;

export async function notifyMe(dropId: string, _prevState: NotifyState, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const whatsapp = String(formData.get("whatsapp") ?? "").trim();

  if (!email && !whatsapp) {
    return { error: "Add an email or WhatsApp number." };
  }
  if (email && !EMAIL_RE.test(email)) {
    return { error: "That email doesn't look right." };
  }

  await db.insert(dropNotificationTable).values({
    dropId,
    email: email || null,
    whatsappNumber: whatsapp || null,
  });

  revalidatePath("/");
  return { success: true };
}
