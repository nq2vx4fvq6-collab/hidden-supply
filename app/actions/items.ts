"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createItem, updateItem, deleteItem } from "@/lib/inventoryService";
import type { InventoryStatus } from "@/lib/models";

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
        .split(",")
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
  revalidatePath("/");
  revalidatePath("/admin/items");
  redirect("/admin/items");
}

export async function updateItemAction(id: string, formData: FormData) {
  const data = parseFormData(formData);
  await updateItem(id, data);
  revalidatePath("/");
  revalidatePath("/admin/items");
  revalidatePath(`/item/${id}`);
  redirect("/admin/items");
}

export async function deleteItemAction(id: string) {
  await deleteItem(id);
  revalidatePath("/");
  revalidatePath("/admin/items");
}
