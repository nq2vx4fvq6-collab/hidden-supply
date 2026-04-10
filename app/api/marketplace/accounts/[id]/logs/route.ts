import { NextRequest } from "next/server";
import { getActivityLogs, addActivityLog } from "@/lib/services/marketplace";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const logs = await getActivityLogs(id);
  return Response.json(logs);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const { detail = "", status = "info", metadata } = body;
  const log = await addActivityLog(id, "manual_note", detail, status, metadata);
  return Response.json(log, { status: 201 });
}
