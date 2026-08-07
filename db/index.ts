import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as relations from "@/db/relations";
import * as schema from "@/db/schema";

let database: ReturnType<typeof createDrizzle> | null = null;

function createDrizzle() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }
  const client = postgres(process.env.DATABASE_URL, { prepare: false });
  return drizzle(client, { schema: { ...schema, ...relations } });
}

export function getDb() {
  if (!database) {
    database = createDrizzle();
  }
  return database;
}

export type Db = ReturnType<typeof getDb>;

export const db = new Proxy({} as Db, {
  get(_target, prop: string) {
    return getDb()[prop as keyof Db];
  },
});
