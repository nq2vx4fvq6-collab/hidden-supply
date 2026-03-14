import { randomUUID } from "crypto";
import { readStore, writeStore } from "@/lib/services/store";
import { applyItemFilters } from "@/lib/services/filters";
import {
  isSheetsConfigured,
  fetchItemsFromSheet,
  appendItemToSheet,
  updateItemInSheet,
} from "@/lib/services/googleSheetsService";
import type { Item, ItemFilters, InventoryStatus } from "@/lib/models";

async function getItemsSource(): Promise<Item[]> {
  if (isSheetsConfigured()) {
    try {
      return await fetchItemsFromSheet();
    } catch {
      return (await readStore()).items;
    }
  }
  const { items } = await readStore();
  return items;
}

export async function getAllItems(filters?: ItemFilters): Promise<Item[]> {
  const items = await getItemsSource();
  if (!filters || Object.values(filters).every((v) => v === undefined || v === "")) {
    return items;
  }
  return applyItemFilters(items, filters);
}

export async function getItemById(id: string): Promise<Item | undefined> {
  const items = await getItemsSource();
  return items.find((i) => i.id === id);
}

export async function createItem(
  data: Omit<Item, "id" | "createdAt" | "updatedAt">
): Promise<Item> {
  const store = await readStore();
  const now = new Date().toISOString();
  const item: Item = { ...data, id: randomUUID(), createdAt: now, updatedAt: now };
  store.items.push(item);
  await writeStore(store);
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
  const store = await readStore();
  const idx = store.items.findIndex((i) => i.id === id);
  if (idx === -1) return null;
  store.items[idx] = {
    ...store.items[idx],
    ...data,
    id,
    updatedAt: new Date().toISOString(),
  };
  await writeStore(store);
  if (isSheetsConfigured()) {
    try {
      await updateItemInSheet(id, data);
    } catch (err) {
      console.error("[inventoryService] update in sheet failed:", err);
    }
  }
  return store.items[idx];
}

export async function deleteItem(id: string): Promise<boolean> {
  const store = await readStore();
  const originalLen = store.items.length;
  store.items = store.items.filter((i) => i.id !== id);
  if (store.items.length === originalLen) return false;
  await writeStore(store);
  return true;
}

export async function clearAllItems(): Promise<void> {
  await writeStore({ items: [] });
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
