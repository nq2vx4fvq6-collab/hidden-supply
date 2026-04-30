import { promises as fs } from "fs";
import path from "path";
import { isSupabaseEnabled, getSupabaseClient } from "@/lib/supabase";
import type { Item } from "@/lib/types/inventory";

const DATA_FILE = path.join(process.cwd(), "data", "inventory.json");
const TABLE = "items";

interface ItemFile {
  items: Item[];
}

// ─── Row mappers ──────────────────────────────────────────────────────────────

function fromRow(row: Record<string, unknown>): Item {
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
    listedOnPlatforms:
      (row.listed_on_platforms as Item["listedOnPlatforms"]) ?? undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function toRow(item: Partial<Item> & { id: string }): Record<string, unknown> {
  const row: Record<string, unknown> = { id: item.id };
  if (item.sku !== undefined)         row.sku = item.sku;
  if (item.brand !== undefined)       row.brand = item.brand;
  if (item.name !== undefined)        row.name = item.name;
  if (item.category !== undefined)    row.category = item.category;
  if (item.size !== undefined)        row.size = item.size;
  if (item.condition !== undefined)   row.condition = item.condition;
  if ("colorway" in item)             row.colorway = item.colorway ?? null;
  if ("cost" in item)                 row.cost = item.cost ?? null;
  if ("listPrice" in item)            row.list_price = item.listPrice ?? null;
  if ("salePrice" in item)            row.sale_price = item.salePrice ?? null;
  if (item.status !== undefined)      row.status = item.status;
  if (item.images !== undefined)      row.images = item.images;
  if ("acquisitionDate" in item)      row.acquisition_date = item.acquisitionDate ?? null;
  if ("soldDate" in item)             row.sold_date = item.soldDate ?? null;
  if ("soldTo" in item)               row.sold_to = item.soldTo ?? null;
  if ("notes" in item)                row.notes = item.notes ?? null;
  if ("listedOnPlatforms" in item)    row.listed_on_platforms = item.listedOnPlatforms ?? null;
  if (item.createdAt !== undefined)   row.created_at = item.createdAt;
  if (item.updatedAt !== undefined)   row.updated_at = item.updatedAt;
  return row;
}

// ─── JSON file fallback ──────────────────────────────────────────────────────

async function readFile(): Promise<ItemFile> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw) as ItemFile;
  } catch {
    return { items: [] };
  }
}

async function writeFile(store: ItemFile): Promise<void> {
  try {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(store, null, 2), "utf-8");
  } catch (err) {
    console.warn("[itemStore] file write failed (read-only filesystem):", err);
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function readItemStore(): Promise<Item[]> {
  if (isSupabaseEnabled) {
    const { data, error } = await getSupabaseClient()
      .from(TABLE)
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("[itemStore] readItemStore:", error.message);
      return [];
    }
    return (data ?? []).map(fromRow);
  }
  const store = await readFile();
  return store.items;
}

export async function getItemRow(id: string): Promise<Item | undefined> {
  if (isSupabaseEnabled) {
    const { data, error } = await getSupabaseClient()
      .from(TABLE)
      .select("*")
      .eq("id", id)
      .single();
    if (error || !data) return undefined;
    return fromRow(data);
  }
  const store = await readFile();
  return store.items.find((i) => i.id === id);
}

export async function insertItem(item: Item): Promise<void> {
  if (isSupabaseEnabled) {
    const { error } = await getSupabaseClient().from(TABLE).insert(toRow(item));
    if (error) throw new Error(`[itemStore] insertItem: ${error.message}`);
    return;
  }
  const store = await readFile();
  store.items.unshift(item);
  await writeFile(store);
}

export async function updateItemRow(
  id: string,
  patch: Partial<Item>
): Promise<Item | null> {
  if (isSupabaseEnabled) {
    const row = toRow({ ...patch, id });
    delete row.id;
    const { data, error } = await getSupabaseClient()
      .from(TABLE)
      .update(row)
      .eq("id", id)
      .select()
      .single();
    if (error || !data) {
      console.error("[itemStore] updateItemRow:", error?.message);
      return null;
    }
    return fromRow(data);
  }
  const store = await readFile();
  const idx = store.items.findIndex((i) => i.id === id);
  if (idx === -1) return null;
  store.items[idx] = { ...store.items[idx], ...patch, id };
  await writeFile(store);
  return store.items[idx];
}

export async function deleteItemRow(id: string): Promise<boolean> {
  if (isSupabaseEnabled) {
    const { error, count } = await getSupabaseClient()
      .from(TABLE)
      .delete({ count: "exact" })
      .eq("id", id);
    if (error) {
      console.error("[itemStore] deleteItemRow:", error.message);
      return false;
    }
    return (count ?? 0) > 0;
  }
  const store = await readFile();
  const before = store.items.length;
  store.items = store.items.filter((i) => i.id !== id);
  if (store.items.length === before) return false;
  await writeFile(store);
  return true;
}

export async function clearAllItemRows(): Promise<void> {
  if (isSupabaseEnabled) {
    const { error } = await getSupabaseClient().from(TABLE).delete().neq("id", "");
    if (error) throw new Error(`[itemStore] clearAllItemRows: ${error.message}`);
    return;
  }
  await writeFile({ items: [] });
}
