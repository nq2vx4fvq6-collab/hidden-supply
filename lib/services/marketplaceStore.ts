import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { unstable_noStore as noStore } from "next/cache";
import type {
  MarketplaceStore,
  MarketplaceAccount,
  PlatformSale,
  ActivityLog,
  LogAction,
  LogStatus,
  Platform,
} from "@/lib/marketplaceModels";

const DATA_FILE = path.join(process.cwd(), "data", "marketplace.json");
const BLOB_PATH = "urban-supply-marketplace.json";

const defaultStore: MarketplaceStore = {
  accounts: [],
  platformSales: [],
  activityLogs: [],
};

// ─── Vercel Blob (preferred production store) ─────────────────────────────────

const isBlobEnabled = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

async function readBlob(): Promise<MarketplaceStore> {
  noStore();
  try {
    const { list } = await import("@vercel/blob");
    const { blobs } = await list({ prefix: BLOB_PATH });
    if (!blobs.length) return readFile();
    const res = await fetch(blobs[0].url, { cache: "no-store" });
    if (!res.ok) return readFile();
    const data = (await res.json()) as MarketplaceStore;
    // Back-fill missing activityLogs array for older stored data
    return { ...defaultStore, ...data };
  } catch (err) {
    console.warn("[marketplaceStore] Blob read failed, falling back to file:", err);
    return readFile();
  }
}

async function writeBlob(store: MarketplaceStore): Promise<void> {
  try {
    const { put } = await import("@vercel/blob");
    await put(BLOB_PATH, JSON.stringify(store, null, 2), {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
    });
  } catch (err) {
    console.error("[marketplaceStore] Blob write failed:", err);
    throw err;
  }
}

// ─── JSON file (local dev fallback) ──────────────────────────────────────────

async function readFile(): Promise<MarketplaceStore> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    const data = JSON.parse(raw) as MarketplaceStore;
    return { ...defaultStore, ...data };
  } catch {
    return { ...defaultStore };
  }
}

async function writeFile(store: MarketplaceStore): Promise<void> {
  try {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(store, null, 2), "utf-8");
  } catch (err) {
    console.warn("[marketplaceStore] file write failed (read-only filesystem):", err);
  }
}

// ─── Public store API ─────────────────────────────────────────────────────────

export async function readMarketplaceStore(): Promise<MarketplaceStore> {
  if (isBlobEnabled) return readBlob();
  return readFile();
}

export async function writeMarketplaceStore(store: MarketplaceStore): Promise<void> {
  if (isBlobEnabled) return writeBlob(store);
  return writeFile(store);
}

// ─── Accounts ────────────────────────────────────────────────────────────────

export async function getAllAccounts(): Promise<MarketplaceAccount[]> {
  const store = await readMarketplaceStore();
  return store.accounts;
}

export async function getAccountById(id: string): Promise<MarketplaceAccount | null> {
  const store = await readMarketplaceStore();
  return store.accounts.find((a) => a.id === id) ?? null;
}

export async function getAccountsByPlatform(platform: Platform): Promise<MarketplaceAccount[]> {
  const store = await readMarketplaceStore();
  return store.accounts.filter((a) => a.platform === platform);
}

export async function createAccount(
  data: Omit<MarketplaceAccount, "id" | "createdAt" | "updatedAt">
): Promise<MarketplaceAccount> {
  const store = await readMarketplaceStore();
  const now = new Date().toISOString();
  const account: MarketplaceAccount = { ...data, id: randomUUID(), createdAt: now, updatedAt: now };
  store.accounts.push(account);
  // Auto-log creation
  store.activityLogs.push({
    id: randomUUID(),
    accountId: account.id,
    action: "account_created",
    detail: `Account "${account.displayName}" created on ${account.platform}`,
    status: "success",
    timestamp: now,
  });
  await writeMarketplaceStore(store);
  return account;
}

export async function updateAccount(
  id: string,
  data: Partial<Omit<MarketplaceAccount, "id" | "createdAt">>
): Promise<MarketplaceAccount | null> {
  const store = await readMarketplaceStore();
  const idx = store.accounts.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  store.accounts[idx] = { ...store.accounts[idx], ...data, id, updatedAt: new Date().toISOString() };
  await writeMarketplaceStore(store);
  return store.accounts[idx];
}

export async function deleteAccount(id: string): Promise<boolean> {
  const store = await readMarketplaceStore();
  const originalLen = store.accounts.length;
  store.accounts = store.accounts.filter((a) => a.id !== id);
  if (store.accounts.length === originalLen) return false;
  await writeMarketplaceStore(store);
  return true;
}

// ─── Platform sales ──────────────────────────────────────────────────────────

export interface PlatformSaleFilters {
  platform?: Platform;
  accountId?: string;
  matched?: boolean;
  fromDate?: string;
  toDate?: string;
}

export async function getPlatformSales(filters?: PlatformSaleFilters): Promise<PlatformSale[]> {
  const store = await readMarketplaceStore();
  let list = [...store.platformSales];
  if (filters?.platform) list = list.filter((s) => s.platform === filters.platform);
  if (filters?.accountId) list = list.filter((s) => s.accountId === filters.accountId);
  if (filters?.matched === true) list = list.filter((s) => s.matchedItemId != null && s.matchedItemId !== "");
  if (filters?.matched === false) list = list.filter((s) => !s.matchedItemId || s.matchedItemId === "");
  if (filters?.fromDate) list = list.filter((s) => s.soldAt >= filters.fromDate!);
  if (filters?.toDate) list = list.filter((s) => s.soldAt <= filters.toDate!);
  return list.sort((a, b) => new Date(b.soldAt).getTime() - new Date(a.soldAt).getTime());
}

export async function getPlatformSaleById(id: string): Promise<PlatformSale | null> {
  const store = await readMarketplaceStore();
  return store.platformSales.find((s) => s.id === id) ?? null;
}

export async function createPlatformSale(
  data: Omit<PlatformSale, "id" | "createdAt" | "updatedAt">
): Promise<PlatformSale> {
  const store = await readMarketplaceStore();
  const now = new Date().toISOString();
  const sale: PlatformSale = { ...data, id: randomUUID(), createdAt: now, updatedAt: now };
  store.platformSales.push(sale);
  await writeMarketplaceStore(store);
  return sale;
}

export async function updatePlatformSale(
  id: string,
  data: Partial<Omit<PlatformSale, "id" | "createdAt">>
): Promise<PlatformSale | null> {
  const store = await readMarketplaceStore();
  const idx = store.platformSales.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  store.platformSales[idx] = { ...store.platformSales[idx], ...data, id, updatedAt: new Date().toISOString() };
  await writeMarketplaceStore(store);
  return store.platformSales[idx];
}

export async function linkSaleToItem(saleId: string, itemId: string | null): Promise<PlatformSale | null> {
  return updatePlatformSale(saleId, { matchedItemId: itemId ?? undefined });
}

// ─── Activity logs ────────────────────────────────────────────────────────────

export async function getActivityLogs(accountId: string): Promise<ActivityLog[]> {
  const store = await readMarketplaceStore();
  return (store.activityLogs ?? [])
    .filter((l) => l.accountId === accountId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export async function addActivityLog(
  accountId: string,
  action: LogAction,
  detail: string,
  status: LogStatus = "info",
  metadata?: Record<string, unknown>
): Promise<ActivityLog> {
  const store = await readMarketplaceStore();
  const log: ActivityLog = {
    id: randomUUID(),
    accountId,
    action,
    detail,
    status,
    timestamp: new Date().toISOString(),
    ...(metadata ? { metadata } : {}),
  };
  if (!store.activityLogs) store.activityLogs = [];
  store.activityLogs.push(log);
  await writeMarketplaceStore(store);
  return log;
}
