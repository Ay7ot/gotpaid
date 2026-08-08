"use server";

import { compare, hashSync } from "bcryptjs";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db/index";
import { adminUserTable } from "@/db/schema";
import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_MAX_AGE, signAdminSession } from "@/lib/admin/session";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { firstError, loginSchema } from "@/lib/validators";

const DUMMY_HASH = hashSync("gotpaid-dummy-password", 12);

export type LoginState = { error?: string } | undefined;

export async function login(_prevState: LoginState, formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  const parsed = loginSchema.safeParse({ email, password });
  if (!parsed.success) return { error: firstError(parsed.error) };

  const ip = await getClientIp();
  const limited = await checkRateLimit(`login:${email}:${ip}`, 5, 900);
  if (!limited.ok) {
    return { error: "Too many attempts. Try again in 15 minutes." };
  }

  const admin = await db.query.adminUserTable.findFirst({
    where: eq(adminUserTable.email, email),
  });

  const valid = admin
    ? await compare(password, admin.passwordHash)
    : await compare(password, DUMMY_HASH);
  if (!admin || !valid) {
    return { error: "Invalid email or password." };
  }

  const token = await signAdminSession({ sub: admin.id, role: admin.role });

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    maxAge: ADMIN_SESSION_MAX_AGE,
  });

  redirect("/admin");
}
