import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { importItemsFromExcel } from "@/lib/services/excel";
import { createItem, updateItem, getAllItems } from "@/lib/services/inventory";
import {
  getAccessToken,
  getExcelContentBySharingUrl,
  tryDirectFetch,
} from "@/lib/services/sharepoint";
import type { InventoryStatus } from "@/lib/types/inventory";

/** Vercel Cron sends Authorization: Bearer <CRON_SECRET>. Also allow GET/POST with same header. */
function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

/** Merge Excel rows into inventory (by SKU). Returns stats. */
async function mergeExcelIntoInventory(buffer: ArrayBuffer): Promise<{
  ok: boolean;
  created: number;
  updated: number;
  total: number;
  message?: string;
}> {
  const rows = importItemsFromExcel(buffer);
  if (rows.length === 0) {
    return { ok: true, created: 0, updated: 0, total: 0, message: "No rows in sheet" };
  }

  const existingItems = await getAllItems();
  const existingBySku = new Map(existingItems.map((i) => [i.sku, i]));
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

  return { ok: true, created, updated, total: rows.length };
}

/** GET: fetch Excel from SharePoint. Tries direct URL first (if "Anyone with the link"), then OAuth if configured. */
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const excelUrl = process.env.SHAREPOINT_EXCEL_URL;
  if (!excelUrl) {
    return NextResponse.json(
      { error: "Missing SHAREPOINT_EXCEL_URL (your Excel sharing link)" },
      { status: 500 }
    );
  }

  let buffer: ArrayBuffer | null = null;

  // 1) Try direct fetch (works if file is shared "Anyone with the link can view")
  buffer = await tryDirectFetch(excelUrl);

  // 2) Fall back to OAuth if we have refresh token + client credentials
  if (!buffer) {
    const refreshToken = process.env.SHAREPOINT_REFRESH_TOKEN;
    const clientId = process.env.SHAREPOINT_CLIENT_ID;
    const clientSecret = process.env.SHAREPOINT_CLIENT_SECRET;
    if (refreshToken && clientId && clientSecret) {
      try {
        const accessToken = await getAccessToken(refreshToken, clientId, clientSecret);
        buffer = await getExcelContentBySharingUrl(accessToken, excelUrl);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error("[cron/sync-sharepoint]", message);
        return NextResponse.json(
          {
            error: "SharePoint fetch failed",
            detail: message,
            hint: "Use Option A (POST from Power Automate) or re-run Connect SharePoint for a new token.",
          },
          { status: 502 }
        );
      }
    }
  }

  if (!buffer) {
    return NextResponse.json(
      {
        error: "Could not read Excel from SharePoint",
        hint: "Set the file to 'Anyone with the link can view', or use Option A: POST the file from Power Automate (see docs), or complete Connect SharePoint.",
      },
      { status: 502 }
    );
  }

  const result = await mergeExcelIntoInventory(buffer);
  return NextResponse.json(result);
}

/**
 * POST: receive Excel file in body (sync "through" SharePoint from your side).
 * No Microsoft sign-in in the app. Use Power Automate or a script to download
 * the file from SharePoint and POST here with Authorization: Bearer CRON_SECRET.
 * Body: raw Excel bytes, or multipart/form-data with field "file".
 */
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let buffer: ArrayBuffer;
  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file in form (use field 'file')" }, { status: 400 });
    }
    buffer = await file.arrayBuffer();
  } else {
    buffer = await req.arrayBuffer();
  }

  if (buffer.byteLength === 0) {
    return NextResponse.json({ error: "Empty body" }, { status: 400 });
  }

  try {
    const result = await mergeExcelIntoInventory(buffer);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[cron/sync-sharepoint POST]", message);
    return NextResponse.json({ error: "Import failed", detail: message }, { status: 400 });
  }
}
