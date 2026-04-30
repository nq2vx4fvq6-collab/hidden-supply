import { randomUUID } from "crypto";
import { unstable_noStore as noStore } from "next/cache";
import {
  readItemStore,
  getItemRow,
  insertItem,
  updateItemRow,
  deleteItemRow,
  clearAllItemRows,
} from "@/lib/services/itemStore";
import { applyItemFilters } from "@/lib/services/filters";
import {
  isSheetsConfigured,
  fetchItemsFromSheet,
  appendItemToSheet,
  updateItemInSheet,
} from "@/lib/services/googleSheets";
import type { Item, ItemFilters, InventoryStatus } from "@/lib/types/inventory";

// ─── Read source (Sheets → Store) ────────────────────────────────────────────

async function getItemsSource(): Promise<Item[]> {
  noStore();
  if (isSheetsConfigured()) {
    try {
      return await fetchItemsFromSheet();
    } catch {
      // fall through to store (Supabase or JSON)
    }
  }
  return readItemStore();
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function getAllItems(filters?: ItemFilters): Promise<Item[]> {
  const items = await getItemsSource();
  if (!filters || Object.values(filters).every((v) => v === undefined || v === "")) {
    return items;
  }
  return applyItemFilters(items, filters);
}

export async function getItemById(id: string): Promise<Item | undefined> {
  noStore();
  return getItemRow(id);
}

export async function createItem(
  data: Omit<Item, "id" | "createdAt" | "updatedAt">
): Promise<Item> {
  const now = new Date().toISOString();
  const item: Item = { ...data, id: randomUUID(), createdAt: now, updatedAt: now };

  await insertItem(item);

  if (isSheetsConfigured()) {
    try {
      await appendItemToSheet(item);
    } catch (err) {
      console.error("[inventory] push to sheet failed:", err);
    }
  }
  return item;
}

export async function updateItem(
  id: string,
  data: Partial<Omit<Item, "id" | "createdAt">>
): Promise<Item | null> {
  const updated = await updateItemRow(id, { ...data, updatedAt: new Date().toISOString() });
  if (!updated) return null;

  if (isSheetsConfigured()) {
    try {
      await updateItemInSheet(id, data);
    } catch (err) {
      console.error("[inventory] update in sheet failed:", err);
    }
  }
  return updated;
}

export async function deleteItem(id: string): Promise<boolean> {
  return deleteItemRow(id);
}

export async function clearAllItems(): Promise<void> {
  await clearAllItemRows();
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
