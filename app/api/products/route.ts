import { NextResponse, type NextRequest } from "next/server";
import { searchProducts, type ProductFilters } from "@/lib/catalog";
import { firstError, productQuerySchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const params = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = productQuerySchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json({ error: firstError(parsed.error) }, { status: 400 });
  }
  const { sort, category, size, collection, drop, page, perPage, min, max, in_stock } = parsed.data;

  const filters: ProductFilters = {
    sort,
    category,
    size,
    collectionId: collection,
    dropId: drop,
    page,
    perPage,
    minPrice: min,
    maxPrice: max,
    inStock: in_stock === "1" ? true : in_stock === "0" ? false : undefined,
  };

  const result = await searchProducts(filters);
  return NextResponse.json(result);
}
