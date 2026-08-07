import { createAdminClient } from "@/lib/supabase/admin";

export const PRODUCT_IMAGES_BUCKET = "product-images";

export function getStoragePublicUrl(bucket: string, path: string) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
}

export async function uploadToStorage(
  bucket: string,
  path: string,
  file: File | Blob,
  contentType: string,
) {
  const supabase = createAdminClient();
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { contentType, upsert: true });

  if (error) {
    throw new Error(error.message);
  }

  return getStoragePublicUrl(bucket, path);
}
