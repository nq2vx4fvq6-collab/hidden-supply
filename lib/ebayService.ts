/**
 * eBay OAuth and Fulfillment API helpers.
 * Requires EBAY_CLIENT_ID, EBAY_CLIENT_SECRET, and EBAY_REFRESH_TOKEN (or per-account token).
 */

const EBAY_OAUTH_URL = "https://api.ebay.com/identity/v1/oauth2/token";
const EBAY_FULFILLMENT_BASE = "https://api.ebay.com/sell/fulfillment/v1";

export interface EbayOrder {
  orderId?: string;
  creationDate?: string;
  total?: string;
  pricingSummary?: { total?: string; value?: string; [key: string]: unknown };
  lineItems?: Array<{
    title?: string;
    sku?: string;
    quantity?: number;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}

export interface EbayOrdersResponse {
  orders?: EbayOrder[];
  next?: string;
  total?: number;
}

function getCredentials(): {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
} | null {
  const clientId = process.env.EBAY_CLIENT_ID;
  const clientSecret = process.env.EBAY_CLIENT_SECRET;
  const refreshToken = process.env.EBAY_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) return null;
  return { clientId, clientSecret, refreshToken };
}

/** Exchange refresh token for access token. */
export async function getEbayAccessToken(
  refreshToken?: string
): Promise<string | null> {
  const creds = getCredentials();
  const token = refreshToken ?? creds?.refreshToken;
  if (!token || !creds) return null;

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: token,
    scope: "https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly",
  });

  const res = await fetch(EBAY_OAUTH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${creds.clientId}:${creds.clientSecret}`).toString("base64")}`,
    },
    body: body.toString(),
  });

  if (!res.ok) {
    console.warn("[ebay] token exchange failed:", res.status, await res.text());
    return null;
  }

  const data = (await res.json()) as { access_token?: string };
  return data.access_token ?? null;
}

/** Fetch orders from eBay Fulfillment API (creation date filter). */
export async function fetchEbayOrders(
  accessToken: string,
  fromDate: Date
): Promise<EbayOrder[]> {
  const iso = fromDate.toISOString();
  const filter = `creationdate:[${iso}..]`;
  const url = `${EBAY_FULFILLMENT_BASE}/order?filter=${encodeURIComponent(filter)}&limit=200`;
  const all: EbayOrder[] = [];

  let nextUrl: string | null = url;

  while (nextUrl) {
    const res = await fetch(nextUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      console.warn("[ebay] getOrders failed:", res.status, await res.text());
      break;
    }

    const data = (await res.json()) as EbayOrdersResponse;
    const orders = data.orders ?? [];
    all.push(...orders);
    nextUrl = data.next ?? null;
  }

  return all;
}

/** Map eBay order to a flat structure for PlatformSale. */
export function ebayOrderToSaleFields(order: EbayOrder): {
  externalSaleId: string;
  title: string;
  amount: number;
  soldAt: string;
  sku?: string;
  rawPayload: Record<string, unknown>;
} {
  const orderId = order.orderId ?? "";
  const total =
    order.total ??
    (order.pricingSummary as { value?: string } | undefined)?.value ??
    "0";
  const creationDate = order.creationDate ?? new Date().toISOString();
  const lineItems = order.lineItems ?? [];
  const firstLine = lineItems[0];
  const title = firstLine?.title ?? orderId;
  const sku = firstLine?.sku;

  return {
    externalSaleId: orderId,
    title,
    amount: parseFloat(total) || 0,
    soldAt: creationDate.slice(0, 10),
    sku,
    rawPayload: order as Record<string, unknown>,
  };
}
