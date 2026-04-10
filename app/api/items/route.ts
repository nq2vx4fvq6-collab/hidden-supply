import { NextRequest, NextResponse } from "next/server";
import { getAllItems, createItem } from "@/lib/services/inventory";
import type { ItemFilters, InventoryStatus } from "@/lib/types/inventory";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const filters: ItemFilters = {
    search: sp.get("search") || undefined,
    brand: sp.get("brand") || undefined,
    category: sp.get("category") || undefined,
    size: sp.get("size") || undefined,
    status: (sp.get("status") as InventoryStatus) || undefined,
    minPrice: sp.get("minPrice") ? Number(sp.get("minPrice")) : undefined,
    maxPrice: sp.get("maxPrice") ? Number(sp.get("maxPrice")) : undefined,
  };
  const items = await getAllItems(filters);
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const item = await createItem({
      ...body,
      images: body.images ?? [],
    });
    return NextResponse.json(item, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
