"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAllItems, createItem, updateItem, deleteItem, getItemById } from "@/lib/services/inventory";
import { invalidateSheetsCache } from "@/lib/services/googleSheets";
import type { InventoryStatus } from "@/lib/types/inventory";

const SUPABASE_STORAGE_HOST = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : null;

/** Bust every relevant cache layer after any inventory mutation. */
function revalidateInventory() {
  invalidateSheetsCache();
  revalidatePath("/admin", "layout");     // all admin pages
  revalidatePath("/admin/items", "page"); // items list specifically
  revalidatePath("/", "layout");          // public catalog
}

/** Delete Supabase Storage images that were removed from an item's image list. */
async function deleteRemovedStorageImages(oldUrls: string[], newUrls: string[]) {
  const removed = oldUrls.filter(
    (url) =>
      !newUrls.includes(url) &&
      SUPABASE_STORAGE_HOST !== null &&
      url.includes(SUPABASE_STORAGE_HOST)
  );
  if (!removed.length) return;
  try {
    const { supabase } = await import("@/lib/supabase");
    // Extract the storage path from each public URL
    // Public URL format: https://<project>.supabase.co/storage/v1/object/public/product-images/<path>
    const paths = removed.map((url) => {
      const marker = "/object/public/product-images/";
      const idx = url.indexOf(marker);
      return idx !== -1 ? url.slice(idx + marker.length) : url;
    });
    const { error } = await supabase.storage.from("product-images").remove(paths);
    if (error) console.error("[items] Failed to delete storage images:", error);
  } catch (err) {
    console.error("[items] Failed to delete storage images:", err);
  }
}

function parseFormData(formData: FormData) {
  const get = (key: string): string | undefined =>
    (formData.get(key) as string) || undefined;

  const getNum = (key: string): number | undefined => {
    const v = formData.get(key) as string;
    return v && v.trim() !== "" ? Number(v) : undefined;
  };

  const imagesRaw = formData.get("images") as string;
  const images = imagesRaw
    ? imagesRaw
        .split(/\n/)
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  return {
    sku: get("sku") ?? "",
    brand: get("brand") ?? "",
    name: get("name") ?? "",
    category: get("category") ?? "",
    size: get("size") ?? "",
    condition: get("condition") ?? "",
    colorway: get("colorway"),
    cost: getNum("cost"),
    listPrice: getNum("listPrice"),
    salePrice: getNum("salePrice"),
    status: ((get("status") ?? "available") as InventoryStatus),
    images,
    acquisitionDate: get("acquisitionDate"),
    notes: get("notes"),
  };
}

export async function createItemAction(formData: FormData) {
  const data = parseFormData(formData);
  await createItem(data);
  revalidateInventory();
  redirect("/admin/items");
}

export async function updateItemAction(id: string, formData: FormData) {
  const data = parseFormData(formData);

  const existing = await getItemById(id);
  const oldImages = existing?.images ?? [];

  await updateItem(id, data);
  await deleteRemovedStorageImages(oldImages, data.images);

  revalidateInventory();
  redirect("/admin/items");
}

export async function deleteItemAction(id: string) {
  const existing = await getItemById(id);
  const oldImages = existing?.images ?? [];
  await deleteRemovedStorageImages(oldImages, []);

  await deleteItem(id);
  revalidateInventory();
}

export async function purgeInvalidImagesAction(): Promise<{ cleaned: number }> {
  const items = await getAllItems();
  let cleaned = 0;

  for (const item of items) {
    if (!item.images?.length) continue;
    const valid = item.images.filter((url) => url.startsWith("https://"));
    if (valid.length !== item.images.length) {
      await updateItem(item.id, { images: valid });
      cleaned++;
    }
  }

  revalidateInventory();
  return { cleaned };
}

export async function bulkUpdateStatusAction(formData: FormData) {
  const ids = formData.getAll("ids") as string[];
  const status = formData.get("status") as InventoryStatus | null;
  if (!ids.length || !status) return;
  const valid: InventoryStatus[] = [
    "available",
    "reserved",
    "sold",
    "archived",
    "consigned",
    "in_transit",
  ];
  if (!valid.includes(status)) return;
  for (const id of ids) {
    await updateItem(id, { status });
  }
  revalidateInventory();
}
