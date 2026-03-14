import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { importItemsFromExcel } from "@/lib/services/excelService";
import { createItem, updateItem, getAllItems } from "@/lib/services/inventoryService";
import {
  getAccessToken,
  getExcelContentBySharingUrl,
} from "@/lib/services/sharePointService";
import type { InventoryStatus } from "@/lib/models";

/** Vercel Cron sends Authorization: Bearer <CRON_SECRET>. Also allow GET with same header. */
function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const refreshToken = process.env.SHAREPOINT_REFRESH_TOKEN;
  const clientId = process.env.SHAREPOINT_CLIENT_ID;
  const clientSecret = process.env.SHAREPOINT_CLIENT_SECRET;
  const excelUrl = process.env.SHAREPOINT_EXCEL_URL;

  if (!refreshToken || !clientId || !clientSecret || !excelUrl) {
    return NextResponse.json(
      {
        error: "Missing SharePoint config",
        need: ["SHAREPOINT_REFRESH_TOKEN", "SHAREPOINT_CLIENT_ID", "SHAREPOINT_CLIENT_SECRET", "SHAREPOINT_EXCEL_URL"],
      },
      { status: 500 }
    );
  }

  let buffer: ArrayBuffer;
  try {
    const accessToken = await getAccessToken(refreshToken, clientId, clientSecret);
    buffer = await getExcelContentBySharingUrl(accessToken, excelUrl);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[cron/sync-sharepoint]", message);
    return NextResponse.json({ error: "SharePoint fetch failed", detail: message }, { status: 502 });
  }

  const rows = importItemsFromExcel(buffer);
  if (rows.length === 0) {
    return NextResponse.json({ ok: true, created: 0, updated: 0, total: 0, message: "No rows in sheet" });
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

  return NextResponse.json({ ok: true, created, updated, total: rows.length });
}
