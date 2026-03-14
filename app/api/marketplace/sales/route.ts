import { NextRequest } from "next/server";
import { createPlatformSale } from "@/lib/marketplaceStore";
import type { Platform } from "@/lib/marketplaceModels";

function parseBody(req: NextRequest): Promise<{
  accountId: string;
  platform: Platform;
  title: string;
  amount: number;
  currency: string;
  soldAt: string;
  sku?: string;
  brand?: string;
  size?: string;
}> {
  const contentType = req.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return req.json();
  }
  return req.formData().then((formData) => ({
    accountId: (formData.get("accountId") as string) ?? "",
    platform: (formData.get("platform") as Platform) ?? "ebay",
    title: (formData.get("title") as string)?.trim() || "Untitled",
    amount: Number(formData.get("amount")),
    currency: (formData.get("currency") as string)?.trim() || "USD",
    soldAt: (formData.get("soldAt") as string)?.trim() || new Date().toISOString().slice(0, 10),
    sku: (formData.get("sku") as string)?.trim() || undefined,
    brand: (formData.get("brand") as string)?.trim() || undefined,
    size: (formData.get("size") as string)?.trim() || undefined,
  }));
}

export async function POST(req: NextRequest) {
  const body = await parseBody(req);
  const { accountId, platform, title, amount, currency, soldAt, sku, brand, size } = body;

  if (!accountId || !platform) {
    return new Response(JSON.stringify({ error: "accountId and platform required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  if (!["ebay", "poshmark", "stockx", "grailed", "depop"].includes(platform)) {
    return new Response(JSON.stringify({ error: "Invalid platform" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const sale = await createPlatformSale({
    accountId,
    platform,
    title,
    amount: Number.isFinite(amount) ? amount : 0,
    currency,
    soldAt,
    sku,
    brand,
    size,
  });
  return Response.json(sale);
}
