import { NextResponse, type NextRequest } from "next/server";
import { searchProducts, type ProductFilters, type ProductSort } from "@/lib/catalog";

const SORTS: ProductSort[] = ["newest", "price-asc", "price-desc"];

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const sortParam = params.get("sort") as ProductSort | null;

  const filters: ProductFilters = {
    sort: sortParam && SORTS.includes(sortParam) ? sortParam : undefined,
    category: params.get("category") ?? undefined,
    size: params.get("size") ?? undefined,
    collectionId: params.get("collection") ?? undefined,
    dropId: params.get("drop") ?? undefined,
    page: params.get("page") ? Math.max(1, Number(params.get("page"))) : 1,
    perPage: params.get("perPage")
      ? Math.min(48, Math.max(1, Number(params.get("perPage"))))
      : undefined,
  };

  const min = params.get("min");
  const max = params.get("max");
  if (min && !Number.isNaN(Number(min))) filters.minPrice = Number(min);
  if (max && !Number.isNaN(Number(max))) filters.maxPrice = Number(max);
  if (params.get("in_stock") === "1") filters.inStock = true;
  if (params.get("in_stock") === "0") filters.inStock = false;

  const result = await searchProducts(filters);
  return NextResponse.json(result);
}
