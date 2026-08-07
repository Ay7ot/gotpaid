import type { ProductFilters } from "@/lib/catalog";

export type SearchParamValue = string | string[] | undefined;

function single(params: Record<string, SearchParamValue>, key: string): string | undefined {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export function parseShopParams(params: Record<string, SearchParamValue>): ProductFilters {
  const filters: ProductFilters = {};

  const sort = single(params, "sort");
  if (sort === "newest" || sort === "price-asc" || sort === "price-desc") filters.sort = sort;

  const category = single(params, "category");
  if (category) filters.category = category;

  const size = single(params, "size");
  if (size) filters.size = size;

  const inStock = single(params, "in_stock");
  if (inStock === "1") filters.inStock = true;
  if (inStock === "0") filters.inStock = false;

  const min = single(params, "min");
  const max = single(params, "max");
  if (min && !Number.isNaN(Number(min))) filters.minPrice = Number(min);
  if (max && !Number.isNaN(Number(max))) filters.maxPrice = Number(max);

  const page = single(params, "page");
  if (page && !Number.isNaN(Number(page))) filters.page = Math.max(1, Number(page));

  return filters;
}

export function buildShopQuery(params: Record<string, SearchParamValue>): string {
  const query = new URLSearchParams();
  for (const key of ["sort", "category", "size", "in_stock", "min", "max"]) {
    const value = single(params, key);
    if (value && value !== "newest") query.set(key, value);
  }
  return query.toString();
}
