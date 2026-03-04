import { promises as fs } from "fs";
import path from "path";
import type { Item } from "./models";

const DATA_FILE = path.join(process.cwd(), "data", "inventory.json");
const KV_KEY = "us-inventory";

export interface Store {
  items: Item[];
}

// Use Vercel KV when env vars are present (production), otherwise use JSON file (local dev)
const isKvEnabled = Boolean(
  process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
);

// ─── KV store (Vercel / production) ──────────────────────────────────────────

async function readKv(): Promise<Store> {
  try {
    const { kv } = await import("@vercel/kv");
    const data = await kv.get<Store>(KV_KEY);
    return data ?? { items: [] };
  } catch (err) {
    console.warn("[store] KV unavailable, falling back to file store:", err);
    return readFile();
  }
}

async function writeKv(store: Store): Promise<void> {
  try {
    const { kv } = await import("@vercel/kv");
    await kv.set(KV_KEY, store);
  } catch (err) {
    console.warn("[store] KV write failed, falling back to file store:", err);
    await writeFile(store);
  }
}

// ─── JSON file store (local dev) ─────────────────────────────────────────────

async function readFile(): Promise<Store> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw) as Store;
  } catch {
    return { items: [] };
  }
}

async function writeFile(store: Store): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(store, null, 2), "utf-8");
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function readStore(): Promise<Store> {
  return isKvEnabled ? readKv() : readFile();
}

export async function writeStore(store: Store): Promise<void> {
  return isKvEnabled ? writeKv(store) : writeFile(store);
}
