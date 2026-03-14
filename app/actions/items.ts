"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAllItems, createItem, updateItem, deleteItem, getItemById } from "@/lib/services/inventoryService";
import type { InventoryStatus } from "@/lib/models";

/** Delete Vercel Blob images that were removed from an item's image list. */
async function deleteRemovedBlobImages(oldUrls: string[], newUrls: string[]) {
  const removed = oldUrls.filter(
    (url) => !newUrls.includes(url) && url.includes("blob.vercel-storage.com")
  );
  if (!removed.length) return;
  try {
    const { del } = await import("@vercel/blob");
    await del(removed);
  } catch (err) {
    console.error("[items] Failed to delete removed blob images:", err);
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
  revalidatePath("/", "layout");
  redirect("/admin/items");
}

export async function updateItemAction(id: string, formData: FormData) {
  const data = parseFormData(formData);

  // Fetch old images before overwriting so we can clean up removed Blob files
  const existing = await getItemById(id);
  const oldImages = existing?.images ?? [];

  await updateItem(id, data);

  // Delete any Blob-hosted images that were removed from this listing
  await deleteRemovedBlobImages(oldImages, data.images);

  revalidatePath("/", "layout");
  redirect("/admin/items");
}

export async function deleteItemAction(id: string) {
  // Delete all Blob images for this item when the item itself is deleted
  const existing = await getItemById(id);
  const oldImages = existing?.images ?? [];
  await deleteRemovedBlobImages(oldImages, []);

  await deleteItem(id);
  revalidatePath("/", "layout");
}

/**
 * Scans every item and removes image URLs that are not valid https:// links
 * (e.g. old local /uploads/... paths that only worked in dev).
 * Returns the number of items that were cleaned up.
 */
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

  revalidatePath("/", "layout");
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
  revalidatePath("/", "layout");
  revalidatePath("/admin/items");
}
