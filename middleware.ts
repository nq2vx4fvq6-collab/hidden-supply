import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE = "us-admin-auth";

/** Hash password + secret with Web Crypto (Edge Runtime compatible) */
async function computeToken(password: string): Promise<string> {
  const secret = process.env.SESSION_SECRET ?? "dev-secret-urban-supply";
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest(
    "SHA-256",
    enc.encode(password + ":" + secret)
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function redirectToLogin(req: NextRequest): NextResponse {
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("from", req.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only guard /admin routes
  if (!pathname.startsWith("/admin")) return NextResponse.next();

  const cookie = req.cookies.get(COOKIE)?.value;
  if (!cookie) return redirectToLogin(req);

  const password = process.env.ADMIN_PASSWORD ?? "admin";
  const expected = await computeToken(password);

  if (cookie !== expected) return redirectToLogin(req);
  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};
