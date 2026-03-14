import { NextRequest } from "next/server";
import { updateAccount, deleteAccount } from "@/lib/marketplaceStore";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const updated = await updateAccount(id, {
    displayName: body.displayName,
  });
  if (!updated) return new Response(null, { status: 404 });
  return Response.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const deleted = await deleteAccount(id);
  if (!deleted) return new Response(null, { status: 404 });
  return new Response(null, { status: 204 });
}
