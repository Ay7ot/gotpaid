import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { db } from "@/db/index";
import { adminUserTable } from "@/db/schema";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/admin/session";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const session = token ? await verifyAdminSessionToken(token) : null;
  if (!session) redirect("/admin/login");

  const admin = await db.query.adminUserTable.findFirst({
    where: eq(adminUserTable.id, session.sub),
  });
  if (!admin) redirect("/admin/login");

  return <AdminShell admin={{ name: admin.name, role: session.role }}>{children}</AdminShell>;
}
