import * as XLSX from "xlsx";
import { excelColumnsConfig } from "./excelColumnsConfig";
import type { Item } from "./models";

type ColKey = keyof typeof excelColumnsConfig;

export function exportItemsToExcel(items: Item[]): Buffer {
  // Header row using the configured column labels
  const headers = Object.values(excelColumnsConfig);

  // Data rows — each cell maps the item field to its configured column position
  const rows = items.map((item) =>
    (Object.keys(excelColumnsConfig) as ColKey[]).map((key) => {
      const val = item[key as keyof Item];
      if (Array.isArray(val)) return (val as string[]).join(", ");
      return val ?? "";
    })
  );

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

  // Auto-size columns
  const colWidths = headers.map((h, i) => {
    const maxLen = Math.max(
      h.length,
      ...rows.map((r) => String(r[i] ?? "").length)
    );
    return { wch: Math.min(maxLen + 2, 50) };
  });
  ws["!cols"] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Inventory");

  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
}

export function importItemsFromExcel(buffer: ArrayBuffer): Partial<Item>[] {
  const wb = XLSX.read(buffer, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1 });

  if (rows.length < 2) return [];

  const header = rows[0] as string[];

  // Build reverse map: "Item Name" -> "name"
  const colMap: Record<string, ColKey> = {};
  for (const [key, label] of Object.entries(excelColumnsConfig)) {
    colMap[label] = key as ColKey;
  }

  const items: Partial<Item>[] = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r] as unknown[];
    if (!row || row.every((c) => c === undefined || c === "")) continue;

    const obj: Record<string, unknown> = {};
    header.forEach((col, i) => {
      const field = colMap[col];
      if (!field) return;
      const val = row[i];

      if (field === "cost" || field === "listPrice" || field === "salePrice") {
        obj[field] = val !== undefined && val !== "" ? Number(val) : undefined;
      } else if (field === "images") {
        obj[field] = val
          ? String(val)
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [];
      } else {
        obj[field] = val !== undefined && val !== "" ? String(val) : undefined;
      }
    });

    if (obj.brand || obj.name) {
      items.push(obj as Partial<Item>);
    }
  }

  return items;
}
