import { NextRequest } from "next/server";
import { linkSaleToItem } from "@/lib/services/marketplace";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await _req.json();
  const itemId = (body.itemId as string) || null;
  const updated = await linkSaleToItem(id, itemId);
  if (!updated) return new Response(null, { status: 404 });
  return Response.json(updated);
}
