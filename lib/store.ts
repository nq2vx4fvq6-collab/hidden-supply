import { promises as fs } from "fs";
import path from "path";
import { unstable_noStore as noStore } from "next/cache";
import type { Item } from "./models";

const DATA_FILE = path.join(process.cwd(), "data", "inventory.json");
const BLOB_PATH = "urban-supply-inventory.json";
const KV_KEY = "us-inventory";

export interface Store {
  items: Item[];
}

const isBlobEnabled = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
const isKvEnabled = Boolean(
  process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
);

// ─── Vercel Blob (preferred production store) ─────────────────────────────────

async function readBlob(): Promise<Store> {
  noStore(); // always fetch fresh inventory — never serve a cached response
  try {
    const { list } = await import("@vercel/blob");
    const { blobs } = await list({ prefix: BLOB_PATH });
    if (!blobs.length) return readFile(); // fall back to seeded file on first run
    const res = await fetch(blobs[0].url, { cache: "no-store" });
    if (!res.ok) return readFile();
    return (await res.json()) as Store;
  } catch (err) {
    console.warn("[store] Blob read failed, falling back to file:", err);
    return readFile();
  }
}

async function writeBlob(store: Store): Promise<void> {
  try {
    const { put } = await import("@vercel/blob");
    await put(BLOB_PATH, JSON.stringify(store, null, 2), {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
    });
  } catch (err) {
    console.error("[store] Blob write failed:", err);
    throw err;
  }
}

// ─── Vercel KV (legacy fallback) ─────────────────────────────────────────────

async function readKv(): Promise<Store> {
  try {
    const { kv } = await import("@vercel/kv");
    const data = await kv.get<Store>(KV_KEY);
    return data ?? { items: [] };
  } catch (err) {
    console.warn("[store] KV read failed, falling back to file:", err);
    return readFile();
  }
}

async function writeKv(store: Store): Promise<void> {
  try {
    const { kv } = await import("@vercel/kv");
    await kv.set(KV_KEY, store);
  } catch (err) {
    console.warn("[store] KV write failed, falling back to file:", err);
    await writeFile(store);
  }
}

// ─── JSON file (local dev) ────────────────────────────────────────────────────

async function readFile(): Promise<Store> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw) as Store;
  } catch {
    return { items: [] };
  }
}

async function writeFile(store: Store): Promise<void> {
  try {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(store, null, 2), "utf-8");
  } catch (err) {
    // Vercel serverless filesystem is read-only — configure BLOB_READ_WRITE_TOKEN
    console.warn("[store] file write failed (read-only filesystem):", err);
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function readStore(): Promise<Store> {
  if (isBlobEnabled) return readBlob();
  if (isKvEnabled) return readKv();
  return readFile();
}

export async function writeStore(store: Store): Promise<void> {
  if (isBlobEnabled) return writeBlob(store);
  if (isKvEnabled) return writeKv(store);
  return writeFile(store);
}
