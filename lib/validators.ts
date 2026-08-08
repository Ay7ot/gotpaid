import { z } from "zod";
import { isValidPhone } from "@/lib/nigeria";

export const orderItemSchema = z.object({
  variantId: z.string().uuid(),
  qty: z.number().int().min(1).max(99),
});

export const checkoutSchema = z.object({
  items: z.array(orderItemSchema).min(1).max(100),
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(254),
  phone: z
    .string()
    .trim()
    .min(7)
    .max(20)
    .refine((value) => isValidPhone(value), "Enter a valid Nigerian phone number."),
  state: z.string().trim().min(1).max(80),
  city: z.string().trim().min(1).max(80),
  street: z.string().trim().min(1).max(200),
  landmark: z.string().trim().max(200).optional(),
});

export const productStatusSchema = z.enum(["draft", "published", "archived"]);

export const productVariantSchema = z.object({
  id: z.string().uuid().optional(),
  size: z.string().trim().max(20).optional(),
  color: z.string().trim().max(40).optional(),
  sku: z.string().trim().max(40).optional(),
  price: z.string().trim().max(12).optional(),
  stock: z.string().trim().max(8).optional(),
});

export const productImageSchema = z.object({
  id: z.string().uuid().optional(),
  url: z.string().url().max(500),
  alt: z.string().trim().max(200).optional(),
});

export const productFormSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(160),
  slug: z.string().trim().max(200).optional(),
  description: z.string().trim().max(2000).optional(),
  category: z.string().trim().max(80).optional(),
  collection: z.string().trim().max(80).optional(),
  drop: z.string().trim().max(80).optional(),
  status: productStatusSchema,
  variants: z.array(productVariantSchema).max(100),
  images: z.array(productImageSchema).max(20),
});

export const dropFormSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(160),
  slug: z.string().trim().max(200).optional(),
  description: z.string().trim().max(2000).optional(),
  releaseAt: z.string().trim().min(1),
  endAt: z.string().trim().optional(),
  status: z.enum(["draft", "scheduled", "live", "ended"]),
  productIds: z.array(z.string().uuid()).max(200),
});

export const collectionFormSchema = z.object({
  name: z.string().trim().min(1).max(120),
  slug: z.string().trim().max(120).optional(),
  description: z.string().trim().max(500).optional(),
  image: z.string().url().max(500).optional(),
});

export const mockCompleteSchema = z.object({
  order: z.string().min(1).max(40),
  outcome: z.enum(["success", "failed", "abandon"]),
});

export const productQuerySchema = z.object({
  sort: z.enum(["newest", "price-asc", "price-desc"]).optional(),
  category: z.string().trim().max(80).optional(),
  size: z.string().trim().max(20).optional(),
  collection: z.string().trim().max(80).optional(),
  drop: z.string().trim().max(80).optional(),
  page: z.coerce.number().int().min(1).optional(),
  perPage: z.coerce.number().int().min(1).max(48).optional(),
  min: z.coerce.number().min(0).optional(),
  max: z.coerce.number().min(0).optional(),
  in_stock: z.enum(["0", "1"]).optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(6).max(200),
});

export function firstError(error: z.ZodError) {
  return error.issues[0]?.message ?? "Invalid input.";
}
