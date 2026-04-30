import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAdminPassword, getSessionSecret } from "@/lib/env";

const COOKIE = "us-admin-auth";

/** Known bot / scraper user-agent signatures */
const BOT_SIGNATURES = [
  "scrapy", "wget", "python-requests", "python-urllib",
  "go-http-client", "java/", "libwww-perl", "httrack",
  "curl/", "okhttp",
  // SEO crawlers
  "ahrefsbot", "semrushbot", "dotbot", "mj12bot", "blexbot",
  "petalbot", "dataforseobot", "rogerbot", "exabot",
  // Search engine scrapers
  "baiduspider", "yandexbot", "seznambot",
  // Archive bots
  "ia_archiver", "archive.org_bot",
  // AI training crawlers
  "gptbot", "ccbot", "claudebot", "anthropic-ai",
  "cohere-ai", "perplexitybot", "bytespider",
  // Social media preview bots
  "facebookexternalhit", "twitterbot",
];

/** API paths that require admin auth regardless of method */
const PROTECTED_API = ["/api/upload", "/api/import", "/api/export"];

async function computeToken(password: string): Promise<string> {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest(
    "SHA-256",
    enc.encode(password + ":" + getSessionSecret())
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function isValidToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const expected = await computeToken(getAdminPassword());
  return token === expected;
}

function redirectToLogin(req: NextRequest): NextResponse {
  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  url.searchParams.set("from", req.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const ua = (req.headers.get("user-agent") ?? "").toLowerCase();

  // ── 1. Block scrapers & bots ──────────────────────────────────────────────
  const isBot = BOT_SIGNATURES.some((sig) => ua.includes(sig));
  if (isBot) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // ── 2. Protect /admin/* pages (except login) ──────────────────────────────
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const token = req.cookies.get(COOKIE)?.value;
    if (!(await isValidToken(token))) {
      const res = redirectToLogin(req);
      if (token) res.cookies.delete(COOKIE); // clear bad/stale cookie
      return res;
    }
  }

  // ── 3. Protect write API endpoints ───────────────────────────────────────
  // Skip auth API itself
  if (pathname.startsWith("/api/auth")) return NextResponse.next();

  const isProtectedApi =
    PROTECTED_API.some((p) => pathname.startsWith(p)) ||
    (pathname.startsWith("/api/items") && req.method !== "GET");

  if (isProtectedApi) {
    const token = req.cookies.get(COOKIE)?.value;
    if (!(await isValidToken(token))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  // Match all routes except Next.js internals and static assets
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2?)$).*)",
  ],
};
