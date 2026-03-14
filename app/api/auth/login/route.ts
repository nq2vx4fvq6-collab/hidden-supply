import { NextRequest, NextResponse } from "next/server";

const COOKIE = "us-admin-auth";

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

export async function POST(req: NextRequest) {
  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const entered = body.password ?? "";
  const expected = process.env.ADMIN_PASSWORD ?? "admin";

  if (entered !== expected) {
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }

  const token = await computeToken(entered);
  const res = NextResponse.json({ ok: true });

  res.cookies.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12, // 12 hours
  });

  return res;
}
