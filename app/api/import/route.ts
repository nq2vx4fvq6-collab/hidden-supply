import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { importItemsFromExcel } from "@/lib/services/excelService";
import { createItem, updateItem, getAllItems, clearAllItems } from "@/lib/services/inventoryService";
import type { InventoryStatus, Item } from "@/lib/models";

export async function POST(req: NextRequest) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const mode = (formData.get("mode") as string) || "merge";

  const buffer = await file.arrayBuffer();
  const rows = importItemsFromExcel(buffer);

  if (rows.length === 0) {
    return NextResponse.json(
      { error: "No valid rows found. Check column headers match the required format." },
      { status: 400 }
    );
  }

  let existingItems: Item[];
  let existingBySku: Map<string, Item>;

  if (mode === "replace") {
    await clearAllItems();
    existingItems = [];
    existingBySku = new Map();
  } else {
    existingItems = await getAllItems();
    existingBySku = new Map(existingItems.map((i) => [i.sku, i]));
  }

  let created = 0;
  let updated = 0;

  for (const row of rows) {
    if (!row.brand && !row.name) continue;

    const existing = row.sku ? existingBySku.get(row.sku) : undefined;

    if (existing) {
      await updateItem(existing.id, row);
      updated++;
    } else {
      await createItem({
        sku: row.sku || `US-${randomUUID().slice(0, 8).toUpperCase()}`,
        brand: row.brand || "",
        name: row.name || "",
        category: row.category || "",
        size: row.size || "",
        condition: row.condition || "",
        status: (row.status as InventoryStatus) || "available",
        images: row.images || [],
        colorway: row.colorway,
        cost: row.cost,
        listPrice: row.listPrice,
        salePrice: row.salePrice,
        acquisitionDate: row.acquisitionDate,
        notes: row.notes,
      });
      created++;
    }
  }

  return NextResponse.json({ created, updated, total: rows.length });
}
