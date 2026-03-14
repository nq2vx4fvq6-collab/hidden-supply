import { NextRequest } from "next/server";
import { createAccount } from "@/lib/marketplaceStore";
import type { Platform } from "@/lib/marketplaceModels";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const platform = formData.get("platform") as Platform;
  const displayName = (formData.get("displayName") as string)?.trim() || "Unnamed";
  if (!platform || !["ebay", "poshmark", "stockx", "grailed", "depop"].includes(platform)) {
    return new Response(JSON.stringify({ error: "Invalid platform" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  const account = await createAccount({
    platform,
    displayName,
    isConnected: false,
  });
  return Response.json(account);
}
