import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/index";

export const runtime = "nodejs";

export async function GET() {
  try {
    await db.execute(sql`select 1 as ok`);
    return NextResponse.json({ status: "ok", db: "connected" });
  } catch (error) {
    return NextResponse.json(
      { status: "error", db: "unreachable", message: (error as Error).message },
      { status: 500 },
    );
  }
}
