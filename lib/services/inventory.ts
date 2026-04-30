import { randomUUID } from "crypto";
import { unstable_noStore as noStore } from "next/cache";
import { getSupabaseClient } from "@/lib/supabase";
import { applyItemFilters } from "@/lib/services/filters";
import {
  isSheetsConfigured,
  fetchItemsFromSheet,
  appendItemToSheet,
  updateItemInSheet,
} from "@/lib/services/googleSheets";
import type { Item, ItemFilters, InventoryStatus } from "@/lib/types/inventory";

// ─── Row ↔ Item mappers ───────────────────────────────────────────────────────

function rowToItem(row: Record<string, unknown>): Item {
  return {
    id: row.id as string,
    sku: row.sku as string,
    brand: row.brand as string,
    name: row.name as string,
    category: row.category as string,
    size: row.size as string,
    condition: row.condition as string,
    colorway: (row.colorway as string | null) ?? undefined,
    cost: (row.cost as number | null) ?? undefined,
    listPrice: (row.list_price as number | null) ?? undefined,
    salePrice: (row.sale_price as number | null) ?? undefined,
    status: row.status as Item["status"],
    images: (row.images as string[]) ?? [],
    acquisitionDate: (row.acquisition_date as string | null) ?? undefined,
    soldDate: (row.sold_date as string | null) ?? undefined,
    soldTo: (row.sold_to as string | null) ?? undefined,
    notes: (row.notes as string | null) ?? undefined,
    listedOnPlatforms: (row.listed_on_platforms as Item["listedOnPlatforms"]) ?? undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function itemToRow(item: Partial<Item> & { id: string }) {
  const row: Record<string, unknown> = { id: item.id };
  if (item.sku !== undefined)              row.sku = item.sku;
  if (item.brand !== undefined)            row.brand = item.brand;
  if (item.name !== undefined)             row.name = item.name;
  if (item.category !== undefined)         row.category = item.category;
  if (item.size !== undefined)             row.size = item.size;
  if (item.condition !== undefined)        row.condition = item.condition;
  if ("colorway" in item)                  row.colorway = item.colorway ?? null;
  if ("cost" in item)                      row.cost = item.cost ?? null;
  if ("listPrice" in item)                 row.list_price = item.listPrice ?? null;
  if ("salePrice" in item)                 row.sale_price = item.salePrice ?? null;
  if (item.status !== undefined)           row.status = item.status;
  if (item.images !== undefined)           row.images = item.images;
  if ("acquisitionDate" in item)           row.acquisition_date = item.acquisitionDate ?? null;
  if ("soldDate" in item)                  row.sold_date = item.soldDate ?? null;
  if ("soldTo" in item)                    row.sold_to = item.soldTo ?? null;
  if ("notes" in item)                     row.notes = item.notes ?? null;
  if ("listedOnPlatforms" in item)         row.listed_on_platforms = item.listedOnPlatforms ?? null;
  if (item.createdAt !== undefined)        row.created_at = item.createdAt;
  if (item.updatedAt !== undefined)        row.updated_at = item.updatedAt;
  return row;
}

// ─── Read source (Sheets → Supabase) ─────────────────────────────────────────

async function getItemsSource(): Promise<Item[]> {
  noStore();
  if (isSheetsConfigured()) {
    try {
      return await fetchItemsFromSheet();
    } catch {
      // fall through to Supabase
    }
  }
  const { data, error } = await getSupabaseClient()
    .from("items")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[inventoryService] read failed:", error.message);
    return [];
  }
  return (data ?? []).map(rowToItem);
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function getAllItems(filters?: ItemFilters): Promise<Item[]> {
  const items = await getItemsSource();
  if (!filters || Object.values(filters).every((v) => v === undefined || v === "")) {
    return items;
  }
  return applyItemFilters(items, filters);
}

export async function getItemById(id: string): Promise<Item | undefined> {
  noStore();
  const { data, error } = await getSupabaseClient()
    .from("items")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return undefined;
  return rowToItem(data);
}

export async function createItem(
  data: Omit<Item, "id" | "createdAt" | "updatedAt">
): Promise<Item> {
  const now = new Date().toISOString();
  const item: Item = { ...data, id: randomUUID(), createdAt: now, updatedAt: now };

  const { error } = await getSupabaseClient().from("items").insert(itemToRow(item));
  if (error) {
    console.error("[inventoryService] createItem failed:", error.message);
    throw error;
  }

  if (isSheetsConfigured()) {
    try {
      await appendItemToSheet(item);
    } catch (err) {
      console.error("[inventoryService] push to sheet failed:", err);
    }
  }
  return item;
}

export async function updateItem(
  id: string,
  data: Partial<Omit<Item, "id" | "createdAt">>
): Promise<Item | null> {
  const now = new Date().toISOString();
  const row = itemToRow({ ...data, id, updatedAt: now });
  delete row.id; // don't pass id in the update payload

  const { data: updated, error } = await getSupabaseClient()
    .from("items")
    .update(row)
    .eq("id", id)
    .select()
    .single();

  if (error || !updated) {
    console.error("[inventoryService] updateItem failed:", error?.message);
    return null;
  }

  if (isSheetsConfigured()) {
    try {
      await updateItemInSheet(id, data);
    } catch (err) {
      console.error("[inventoryService] update in sheet failed:", err);
    }
  }
  return rowToItem(updated);
}

export async function deleteItem(id: string): Promise<boolean> {
  const { error, count } = await getSupabaseClient()
    .from("items")
    .delete({ count: "exact" })
    .eq("id", id);

  if (error) {
    console.error("[inventoryService] deleteItem failed:", error.message);
    return false;
  }
  return (count ?? 0) > 0;
}

export async function clearAllItems(): Promise<void> {
  const { error } = await getSupabaseClient().from("items").delete().neq("id", "");
  if (error) {
    console.error("[inventoryService] clearAllItems failed:", error.message);
    throw error;
  }
}

export async function getStats() {
  const items = await getItemsSource();
  const soldItems = items.filter((i) => i.status === "sold");
  const activeItems = items.filter(
    (i) => i.status !== "sold" && i.status !== "archived"
  );

  return {
    total: items.length,
    available: items.filter((i) => i.status === "available").length,
    reserved: items.filter((i) => i.status === "reserved").length,
    sold: soldItems.length,
    consigned: items.filter((i) => i.status === "consigned").length,
    inTransit: items.filter((i) => i.status === "in_transit").length,
    totalCostBasis: items.reduce((sum, i) => sum + (i.cost ?? 0), 0),
    activeListValue: activeItems.reduce((sum, i) => sum + (i.listPrice ?? 0), 0),
    soldRevenue: soldItems.reduce(
      (sum, i) => sum + (i.salePrice ?? i.listPrice ?? 0),
      0
    ),
    soldCost: soldItems.reduce((sum, i) => sum + (i.cost ?? 0), 0),
  };
}

export type { InventoryStatus };
