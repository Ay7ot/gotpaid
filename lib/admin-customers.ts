import { and, desc, eq, ilike, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/db/index";
import { customerTable, orderTable } from "@/db/schema";

export type CustomerFilters = { q?: string; page?: number };

const ltvSql = sql<number>`coalesce(sum(case when ${orderTable.status} in ('paid','fulfilled','shipped','delivered') then ${orderTable.total} else 0 end), 0)`;

export async function getAdminCustomers(filters: CustomerFilters = {}) {
  const page = Math.max(1, filters.page ?? 1);
  const perPage = 20;

  const where: SQL[] = [];
  if (filters.q) {
    const search = or(
      ilike(customerTable.name, `%${filters.q}%`),
      ilike(customerTable.email, `%${filters.q}%`),
      ilike(customerTable.phone, `%${filters.q}%`),
    );
    if (search) where.push(search);
  }
  const whereClause = and(...where);

  const [rows, count] = await Promise.all([
    db
      .select({
        id: customerTable.id,
        name: customerTable.name,
        email: customerTable.email,
        phone: customerTable.phone,
        whatsappNumber: customerTable.whatsappNumber,
        orderCount: sql<number>`count(${orderTable.id})`,
        lifetimeValue: ltvSql,
      })
      .from(customerTable)
      .leftJoin(orderTable, eq(orderTable.customerId, customerTable.id))
      .where(whereClause)
      .groupBy(customerTable.id)
      .orderBy(desc(ltvSql), desc(customerTable.createdAt))
      .offset((page - 1) * perPage)
      .limit(perPage),
    db
      .select({ count: sql<number>`count(*)` })
      .from(customerTable)
      .where(whereClause),
  ]);

  return { customers: rows, total: Number(count[0]?.count ?? 0), page, perPage };
}

export function getCustomerDetail(id: string) {
  return db.query.customerTable.findFirst({
    where: eq(customerTable.id, id),
    with: {
      addresses: true,
      orders: {
        orderBy: desc(orderTable.createdAt),
        with: { items: true, shippingAddress: true },
      },
    },
  });
}
