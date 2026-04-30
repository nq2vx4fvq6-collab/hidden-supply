import { NextRequest, NextResponse } from "next/server";
import { getAdminPassword, getSessionSecret } from "@/lib/env";

const COOKIE = "us-admin-auth";

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

export async function POST(req: NextRequest) {
  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const entered = body.password ?? "";

  if (entered !== getAdminPassword()) {
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
