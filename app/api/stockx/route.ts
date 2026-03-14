import { NextRequest, NextResponse } from "next/server";

// ─── Types ────────────────────────────────────────────────────────────────────

interface StockXProduct {
  name?: string;
  title?: string;
  urlKey?: string;
  url_key?: string;
  market?: {
    highestBid?: number | null;
    lowestAsk?: number | null;
    lastSale?: number | null;
  };
}

interface CacheEntry {
  price: number | null;
  url: string | null;
  exp: number;
}

// ─── Cache (globalThis-pinned — same pattern as lib/store.ts) ─────────────────

declare global {
  // eslint-disable-next-line no-var
  var __stockxCache: Map<string, CacheEntry> | undefined;
}

const cache: Map<string, CacheEntry> =
  globalThis.__stockxCache ??
  (globalThis.__stockxCache = new Map<string, CacheEntry>());

const TTL_MS = 60 * 60 * 1000; // 1 hour

function getCached(key: string): CacheEntry | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.exp) {
    cache.delete(key);
    return null;
  }
  return entry;
}

function setCached(key: string, price: number | null, url: string | null) {
  cache.set(key, { price, url, exp: Date.now() + TTL_MS });
}

// ─── Token-match validation ───────────────────────────────────────────────────

function tokenMatch(resultTitle: string, query: string): boolean {
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((t) => t.length > 2);
  const resultTokens = new Set(normalize(resultTitle));
  const queryTokens = normalize(query);
  return queryTokens.filter((t) => resultTokens.has(t)).length >= 2;
}

// ─── Build StockX search URL ──────────────────────────────────────────────────

function stockxSearchUrl(query: string): string {
  return `https://stockx.com/search?s=${encodeURIComponent(query)}`;
}

// ─── GET /api/stockx?q=SEARCH_QUERY ──────────────────────────────────────────
// Attempts to fetch the highest-bid (sell-now) price from StockX.
// Always returns { price: number|null, url: string } — url is the StockX
// search page as a reliable fallback even when price data is unavailable.

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q")?.trim();

  if (!query) {
    return NextResponse.json({ price: null, url: null }, { status: 400 });
  }

  const cacheKey = query.toLowerCase();
  const cached = getCached(cacheKey);
  const searchUrl = stockxSearchUrl(query);

  if (cached) {
    return NextResponse.json(
      { price: cached.price, url: cached.url ?? searchUrl },
      {
        headers: {
          "Cache-Control": "public, max-age=3600, stale-while-revalidate=600",
          "X-Cache": "HIT",
        },
      }
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    // Attempt the StockX Algolia search API (used by their own frontend)
    const algoliaUrl =
      "https://xw7sbct9v6-dsn.algolia.net/1/indexes/products/query";

    const res = await fetch(algoliaUrl, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) " +
          "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        "X-Algolia-Application-Id": "xw7sbct9v6",
        "X-Algolia-API-Key": process.env.STOCKX_ALGOLIA_KEY ?? "",
        Accept: "application/json",
      },
      body: JSON.stringify({ query, hitsPerPage: 5 }),
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      const hits: StockXProduct[] = data?.hits ?? [];

      const match =
        hits.find((h) => {
          const title = h.title ?? h.name ?? "";
          const bid = h.market?.highestBid;
          return bid != null && tokenMatch(title, query);
        }) ?? null;

      const price = match?.market?.highestBid ?? null;
      const productUrl = match?.urlKey
        ? `https://stockx.com/${match.urlKey}`
        : match?.url_key
          ? `https://stockx.com/${match.url_key}`
          : searchUrl;

      setCached(cacheKey, price, productUrl);

      return NextResponse.json(
        { price, url: productUrl },
        {
          headers: {
            "Cache-Control": "public, max-age=3600, stale-while-revalidate=600",
            "X-Cache": "MISS",
          },
        }
      );
    }

    // API unavailable — cache null but return searchUrl so the badge can
    // still link to StockX
    setCached(cacheKey, null, searchUrl);
    return NextResponse.json(
      { price: null, url: searchUrl },
      { headers: { "Cache-Control": "public, max-age=3600" } }
    );
  } catch {
    setCached(cacheKey, null, searchUrl);
    return NextResponse.json({ price: null, url: searchUrl });
  } finally {
    clearTimeout(timeout);
  }
}
