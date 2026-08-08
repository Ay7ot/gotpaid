import { sql } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db/index";
import { rateLimitTable } from "@/db/schema";

export async function getClientIp(): Promise<string> {
  try {
    const headerList = await headers();
    const forwarded = headerList.get("x-forwarded-for");
    if (forwarded) return forwarded.split(",")[0].trim();
    const realIp = headerList.get("x-real-ip");
    if (realIp) return realIp;
  } catch {
    // headers() not available (e.g. non-request context)
  }
  return "unknown";
}

export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<{ ok: boolean; retryAfterSeconds?: number }> {
  const windowMs = windowSeconds * 1000;
  const windowStart = new Date(Math.floor(Date.now() / windowMs) * windowMs);

  const [row] = await db
    .insert(rateLimitTable)
    .values({ key, windowStart, count: 1 })
    .onConflictDoUpdate({
      target: [rateLimitTable.key, rateLimitTable.windowStart],
      set: { count: sql`${rateLimitTable.count} + 1` },
    })
    .returning({ count: rateLimitTable.count });

  const count = row?.count ?? 1;
  if (count > limit) {
    return { ok: false, retryAfterSeconds: windowSeconds };
  }
  return { ok: true };
}
