import { and, desc, eq, ilike, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/db/index";
import { customerTable, orderStatusEnum, orderTable } from "@/db/schema";

export type OrderStatus = (typeof orderStatusEnum.enumValues)[number];

export type AdminOrderFilters = { status?: OrderStatus; q?: string; page?: number };

function buildWhere(filters: AdminOrderFilters): SQL | undefined {
  const where: SQL[] = [];
  if (filters.status) where.push(eq(orderTable.status, filters.status));
  if (filters.q) {
    const search = or(
      ilike(orderTable.orderNumber, `%${filters.q}%`),
      sql`exists (
        select 1 from ${customerTable} c
        where c.id = ${orderTable.customerId}
          and (
            c.email ilike ${`%${filters.q}%`}
            or c.phone ilike ${`%${filters.q}%`}
            or c.name ilike ${`%${filters.q}%`}
          )
      )`,
    );
    if (search) where.push(search);
  }
  return and(...where);
}

export async function getAdminOrders(filters: AdminOrderFilters = {}) {
  const page = Math.max(1, filters.page ?? 1);
  const perPage = 20;
  const where = buildWhere(filters);

  const [rows, count] = await Promise.all([
    db.query.orderTable.findMany({
      where,
      with: { customer: true, items: true },
      orderBy: desc(orderTable.createdAt),
      offset: (page - 1) * perPage,
      limit: perPage,
    }),
    db
      .select({ count: sql<number>`count(*)` })
      .from(orderTable)
      .where(where),
  ]);

  return { orders: rows, total: Number(count[0]?.count ?? 0), page, perPage };
}

export function getOrdersForExport(filters: AdminOrderFilters = {}) {
  return db.query.orderTable.findMany({
    where: buildWhere(filters),
    with: { customer: true, items: true, shippingAddress: true },
    orderBy: desc(orderTable.createdAt),
    limit: 2000,
  });
}

export function getOrderById(id: string) {
  return db.query.orderTable.findFirst({
    where: eq(orderTable.id, id),
    with: { customer: true, items: true, shippingAddress: true },
  });
}
