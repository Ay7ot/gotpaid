"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin/session";

export async function signOutAdmin() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, "", {
    path: "/admin",
    maxAge: 0,
    httpOnly: true,
    sameSite: "lax",
  });
  redirect("/admin/login");
}
