import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { unstable_noStore as noStore } from "next/cache";
import type {
  MarketplaceStore,
  MarketplaceAccount,
  PlatformSale,
  Platform,
} from "@/lib/marketplaceModels";

const DATA_FILE = path.join(process.cwd(), "data", "marketplace.json");

const defaultStore: MarketplaceStore = {
  accounts: [],
  platformSales: [],
};

async function readFile(): Promise<MarketplaceStore> {
  noStore();
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw) as MarketplaceStore;
  } catch {
    return { ...defaultStore };
  }
}

async function writeFile(store: MarketplaceStore): Promise<void> {
  try {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(
      DATA_FILE,
      JSON.stringify(store, null, 2),
      "utf-8"
    );
  } catch (err) {
    console.warn("[marketplaceStore] file write failed:", err);
  }
}

export async function readMarketplaceStore(): Promise<MarketplaceStore> {
  return readFile();
}

export async function writeMarketplaceStore(
  store: MarketplaceStore
): Promise<void> {
  await writeFile(store);
}

// ─── Accounts ────────────────────────────────────────────────────────────────

export async function getAllAccounts(): Promise<MarketplaceAccount[]> {
  const store = await readMarketplaceStore();
  return store.accounts;
}

export async function getAccountById(
  id: string
): Promise<MarketplaceAccount | null> {
  const store = await readMarketplaceStore();
  return store.accounts.find((a) => a.id === id) ?? null;
}

export async function getAccountsByPlatform(
  platform: Platform
): Promise<MarketplaceAccount[]> {
  const store = await readMarketplaceStore();
  return store.accounts.filter((a) => a.platform === platform);
}

export async function createAccount(
  data: Omit<MarketplaceAccount, "id" | "createdAt" | "updatedAt">
): Promise<MarketplaceAccount> {
  const store = await readMarketplaceStore();
  const now = new Date().toISOString();
  const account: MarketplaceAccount = {
    ...data,
    id: randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
  store.accounts.push(account);
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
  store.accounts[idx] = {
    ...store.accounts[idx],
    ...data,
    id,
    updatedAt: new Date().toISOString(),
  };
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

export async function getPlatformSales(
  filters?: PlatformSaleFilters
): Promise<PlatformSale[]> {
  const store = await readMarketplaceStore();
  let list = [...store.platformSales];
  if (filters?.platform)
    list = list.filter((s) => s.platform === filters.platform);
  if (filters?.accountId)
    list = list.filter((s) => s.accountId === filters.accountId);
  if (filters?.matched === true)
    list = list.filter((s) => s.matchedItemId != null && s.matchedItemId !== "");
  if (filters?.matched === false)
    list = list.filter((s) => !s.matchedItemId || s.matchedItemId === "");
  if (filters?.fromDate)
    list = list.filter((s) => s.soldAt >= filters.fromDate!);
  if (filters?.toDate)
    list = list.filter((s) => s.soldAt <= filters.toDate!);
  return list.sort(
    (a, b) => new Date(b.soldAt).getTime() - new Date(a.soldAt).getTime()
  );
}

export async function getPlatformSaleById(
  id: string
): Promise<PlatformSale | null> {
  const store = await readMarketplaceStore();
  return store.platformSales.find((s) => s.id === id) ?? null;
}

export async function createPlatformSale(
  data: Omit<PlatformSale, "id" | "createdAt" | "updatedAt">
): Promise<PlatformSale> {
  const store = await readMarketplaceStore();
  const now = new Date().toISOString();
  const sale: PlatformSale = {
    ...data,
    id: randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
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
  store.platformSales[idx] = {
    ...store.platformSales[idx],
    ...data,
    id,
    updatedAt: new Date().toISOString(),
  };
  await writeMarketplaceStore(store);
  return store.platformSales[idx];
}

export async function linkSaleToItem(
  saleId: string,
  itemId: string | null
): Promise<PlatformSale | null> {
  return updatePlatformSale(saleId, { matchedItemId: itemId ?? undefined });
}
