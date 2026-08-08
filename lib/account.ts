import { desc, eq } from "drizzle-orm";
import { db } from "@/db/index";
import { customerTable, orderTable } from "@/db/schema";

export function getCustomerAccount(email: string) {
  return db.query.customerTable.findFirst({
    where: eq(customerTable.email, email),
    with: {
      orders: {
        orderBy: desc(orderTable.createdAt),
        with: { items: true, shippingAddress: true },
      },
      addresses: true,
    },
  });
}
