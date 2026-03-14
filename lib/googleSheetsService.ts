import { google } from "googleapis";
import { excelColumnsConfig } from "./excelColumnsConfig";
import type { Item, InventoryStatus } from "./models";

type ColKey = keyof typeof excelColumnsConfig;
const COL_KEYS = Object.keys(excelColumnsConfig) as ColKey[];

function itemToRow(item: Item | Partial<Item>): string[] {
  return COL_KEYS.map((key) => {
    const v = item[key as keyof Item];
    if (Array.isArray(v)) return (v as string[]).join("\n");
    if (v === undefined || v === null) return "";
    return String(v);
  });
}

const CACHE_TTL_MS = 60 * 1000; // 60 seconds
let cachedItems: Item[] | null = null;
let cacheTime = 0;

const STATUS_VALUES: InventoryStatus[] = [
  "available",
  "reserved",
  "sold",
  "archived",
  "consigned",
  "in_transit",
];

function normalizeStatus(raw: unknown): InventoryStatus {
  const s = String(raw ?? "").trim().toLowerCase().replace(/[\s-]/g, "_");
  if (STATUS_VALUES.includes(s as InventoryStatus)) return s as InventoryStatus;
  if (s === "in_transit") return "in_transit";
  return "available";
}

function parseNumber(v: unknown): number | undefined {
  if (v === undefined || v === null || v === "") return undefined;
  const n = Number(typeof v === "string" ? v.replace(/,/g, "") : v);
  return Number.isFinite(n) ? n : undefined;
}

function parseImages(v: unknown): string[] {
  if (!v) return [];
  const s = String(v).trim();
  if (!s) return [];
  return s.split(/\n|,/).map((x) => x.trim()).filter(Boolean);
}

export function isSheetsConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_SHEETS_ID && process.env.GOOGLE_CREDENTIALS
  );
}

export function invalidateSheetsCache(): void {
  cachedItems = null;
  cacheTime = 0;
}

export async function fetchItemsFromSheet(): Promise<Item[]> {
  const sheetId = process.env.GOOGLE_SHEETS_ID;
  const credsJson = process.env.GOOGLE_CREDENTIALS;
  if (!sheetId || !credsJson) return [];

  const now = Date.now();
  if (cachedItems !== null && now - cacheTime < CACHE_TTL_MS) {
    return cachedItems;
  }

  const fetchWithTimeout = async (): Promise<Item[]> => {
    const credentials = JSON.parse(credsJson) as {
      client_email?: string;
      private_key?: string;
    };
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });
    const sheets = google.sheets({ version: "v4", auth });
    const range = process.env.GOOGLE_SHEETS_RANGE ?? "Sheet1";
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range,
    });
    const rows = res.data.values as string[][] | undefined;
    if (!rows || rows.length < 2) {
      return [];
    }

    const headers = rows[0].map((h) => String(h ?? "").trim());
    const colIndex: Record<string, number> = {};
    for (const [key, label] of Object.entries(excelColumnsConfig)) {
      const i = headers.findIndex(
        (h) => h.toLowerCase() === (label as string).toLowerCase()
      );
      if (i >= 0) colIndex[key] = i;
    }

    const items: Item[] = [];
    for (let r = 1; r < rows.length; r++) {
      const row = rows[r] ?? [];
      const get = (key: string): unknown => {
        const i = colIndex[key];
        return i !== undefined ? row[i] : undefined;
      };
      const brand = String(get("brand") ?? "").trim();
      const name = String(get("name") ?? "").trim();
      if (!brand && !name) continue;

      const id = String(get("id") ?? "").trim() || `sheet-${r}`;
      const status = normalizeStatus(get("status"));
      const images = parseImages(get("images"));

      items.push({
        id,
        sku: String(get("sku") ?? "").trim() || id,
        brand,
        name,
        category: String(get("category") ?? "").trim(),
        size: String(get("size") ?? "").trim(),
        condition: String(get("condition") ?? "").trim(),
        colorway: String(get("colorway") ?? "").trim() || undefined,
        cost: parseNumber(get("cost")),
        listPrice: parseNumber(get("listPrice")),
        salePrice: parseNumber(get("salePrice")),
        status,
        images,
        acquisitionDate: String(get("acquisitionDate") ?? "").trim() || undefined,
        soldDate: String(get("soldDate") ?? "").trim() || undefined,
        soldTo: String(get("soldTo") ?? "").trim() || undefined,
        notes: String(get("notes") ?? "").trim() || undefined,
        createdAt: String(get("createdAt") ?? "").trim() || undefined,
        updatedAt: String(get("updatedAt") ?? "").trim() || undefined,
      });
    }
    return items;
  };

  try {
    const timeoutMs = 10000; // 10s max so build doesn't hang
    const items = await Promise.race([
      fetchWithTimeout(),
      new Promise<Item[]>((_, reject) =>
        setTimeout(() => reject(new Error("Sheets fetch timeout")), timeoutMs)
      ),
    ]);
    cachedItems = items;
    cacheTime = now;
    return items;
  } catch (err) {
    console.error("[googleSheetsService] fetch failed:", err);
    throw err;
  }
}

/** Auth with write scope for push/update */
async function getSheetsClientWrite() {
  const credsJson = process.env.GOOGLE_CREDENTIALS;
  if (!credsJson) throw new Error("GOOGLE_CREDENTIALS not set");
  const credentials = JSON.parse(credsJson) as {
    client_email?: string;
    private_key?: string;
  };
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

export async function appendItemToSheet(item: Item): Promise<void> {
  const sheetId = process.env.GOOGLE_SHEETS_ID;
  const range = process.env.GOOGLE_SHEETS_RANGE ?? "Sheet1";
  if (!sheetId) return;
  const sheets = await getSheetsClientWrite();
  const row = itemToRow({ ...item, updatedAt: new Date().toISOString() });
  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [row] },
  });
  invalidateSheetsCache();
}

export async function updateItemInSheet(
  idOrSku: string,
  data: Partial<Item>
): Promise<void> {
  const sheetId = process.env.GOOGLE_SHEETS_ID;
  const range = process.env.GOOGLE_SHEETS_RANGE ?? "Sheet1";
  if (!sheetId) return;
  const sheets = await getSheetsClientWrite();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range,
  });
  const rows = res.data.values as string[][] | undefined;
  if (!rows || rows.length < 2) return;
  const headers = rows[0].map((h) => String(h ?? "").trim());
  const colIndex: Record<string, number> = {};
  for (const [key, label] of Object.entries(excelColumnsConfig)) {
    const i = headers.findIndex(
      (h) => h.toLowerCase() === (label as string).toLowerCase()
    );
    if (i >= 0) colIndex[key] = i;
  }
  const idCol = colIndex["id"];
  const skuCol = colIndex["sku"];
  let rowIndex = -1;
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r] ?? [];
    const rowId = idCol !== undefined ? String(row[idCol] ?? "").trim() : "";
    const rowSku = skuCol !== undefined ? String(row[skuCol] ?? "").trim() : "";
    if (rowId === idOrSku || rowSku === idOrSku) {
      rowIndex = r;
      break;
    }
  }
  if (rowIndex < 0) return;
  const updatedAt = new Date().toISOString();
  const fullData = { ...data, updatedAt };
  const numCols = headers.length;
  const updates: string[] = new Array(numCols).fill("");
  for (const [key, colIdx] of Object.entries(colIndex)) {
    const v = fullData[key as keyof Item];
    if (v === undefined) continue;
    const cell =
      Array.isArray(v) ? (v as string[]).join("\n") : String(v ?? "");
    if (colIdx < numCols) updates[colIdx] = cell;
  }
  const rangeA1 = `${range.split("!")[0] ?? "Sheet1"}!A${rowIndex + 1}:${String.fromCharCode(65 + numCols - 1)}${rowIndex + 1}`;
  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: rangeA1,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [updates] },
  });
  invalidateSheetsCache();
}
