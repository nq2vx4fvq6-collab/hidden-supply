import { NextRequest } from "next/server";
import { updateAccount, deleteAccount, addActivityLog } from "@/lib/services/marketplaceStore";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  const patch: Record<string, unknown> = {};
  if (body.displayName !== undefined) patch.displayName = body.displayName;
  if (body.email !== undefined) patch.email = body.email;
  if (body.notes !== undefined) patch.notes = body.notes;
  if (body.loginUsername !== undefined) patch.loginUsername = body.loginUsername;
  if (body.loginPassword !== undefined) patch.loginPassword = body.loginPassword;
  if (body.loginNotes !== undefined) patch.loginNotes = body.loginNotes;
  if (body.isConnected !== undefined) patch.isConnected = body.isConnected;

  const updated = await updateAccount(id, patch);
  if (!updated) return new Response(null, { status: 404 });

  // Log credentials update separately so it shows in the activity feed
  if (body.loginUsername !== undefined || body.loginPassword !== undefined || body.loginNotes !== undefined) {
    await addActivityLog(id, "credentials_updated", "Login credentials updated", "success");
  }

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
