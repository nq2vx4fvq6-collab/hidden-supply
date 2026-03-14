import { randomUUID } from "crypto";
import { NextRequest } from "next/server";
import { getAccountById, getPlatformSales, updateAccount, readMarketplaceStore, writeMarketplaceStore } from "@/lib/services/marketplaceStore";
import { getEbayAccessToken, fetchEbayOrders, ebayOrderToSaleFields } from "@/lib/services/ebayService";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const accountId = body.accountId as string;
  if (!accountId) {
    return new Response(JSON.stringify({ error: "accountId required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const account = await getAccountById(accountId);
  if (!account) {
    return new Response(JSON.stringify({ error: "Account not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const now = new Date().toISOString();

  if (account.platform === "ebay") {
    const refreshToken = account.credentialsRef ?? process.env.EBAY_REFRESH_TOKEN;
    const accessToken = refreshToken
      ? await getEbayAccessToken(refreshToken)
      : null;

    if (accessToken) {
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - 90);
      const orders = await fetchEbayOrders(accessToken, fromDate);
      const existingSales = await getPlatformSales({ accountId });
      const existingIds = new Set(
        existingSales
          .map((s) => s.externalSaleId)
          .filter(Boolean)
      );

      let created = 0;
      const store = await readMarketplaceStore();
      for (const order of orders) {
        const orderId = order.orderId;
        if (!orderId || existingIds.has(orderId)) continue;
        const fields = ebayOrderToSaleFields(order);
        store.platformSales.push({
          id: randomUUID(),
          accountId,
          platform: "ebay",
          externalSaleId: fields.externalSaleId,
          title: fields.title,
          amount: fields.amount,
          currency: "USD",
          soldAt: fields.soldAt,
          sku: fields.sku,
          rawPayload: fields.rawPayload,
          createdAt: now,
          updatedAt: now,
        });
        existingIds.add(orderId);
        created++;
      }
      if (created > 0) await writeMarketplaceStore(store);
      await updateAccount(accountId, {
        lastSyncedAt: now,
        isConnected: true,
      });
      return Response.json({
        ok: true,
        platform: "ebay",
        ordersFetched: orders.length,
        newSalesCreated: created,
        lastSyncedAt: now,
      });
    }
  }

  await updateAccount(accountId, { lastSyncedAt: now });
  return Response.json({
    ok: true,
    platform: account.platform,
    message: "Sync recorded; no API integration for this account.",
    lastSyncedAt: now,
  });
}
