import { randomUUID } from "crypto";
import { unstable_noStore as noStore } from "next/cache";
import {
  readAccounts,
  getAccountRow,
  readAccountsByPlatform,
  insertAccount,
  updateAccountRow,
  deleteAccountRow,
  readPlatformSales,
  getPlatformSaleRow,
  insertPlatformSale,
  updatePlatformSaleRow,
  readActivityLogs,
  insertActivityLog,
  type PlatformSaleFilters,
} from "@/lib/services/marketplaceStore";
import type {
  MarketplaceAccount,
  PlatformSale,
  ActivityLog,
  LogAction,
  LogStatus,
  Platform,
} from "@/lib/types/marketplace";

// ─── Accounts ────────────────────────────────────────────────────────────────

export async function getAllAccounts(): Promise<MarketplaceAccount[]> {
  noStore();
  return readAccounts();
}

export async function getAccountById(id: string): Promise<MarketplaceAccount | null> {
  noStore();
  return getAccountRow(id);
}

export async function getAccountsByPlatform(platform: Platform): Promise<MarketplaceAccount[]> {
  noStore();
  return readAccountsByPlatform(platform);
}

export async function createAccount(
  data: Omit<MarketplaceAccount, "id" | "createdAt" | "updatedAt">
): Promise<MarketplaceAccount> {
  const now = new Date().toISOString();
  const account: MarketplaceAccount = {
    ...data,
    id: randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
  const inserted = await insertAccount(account);

  await addActivityLog(
    inserted.id,
    "account_created",
    `Account "${inserted.displayName}" created on ${inserted.platform}`,
    "success"
  );

  return inserted;
}

export async function updateAccount(
  id: string,
  data: Partial<Omit<MarketplaceAccount, "id" | "createdAt">>
): Promise<MarketplaceAccount | null> {
  return updateAccountRow(id, data);
}

export async function deleteAccount(id: string): Promise<boolean> {
  return deleteAccountRow(id);
}

// ─── Platform sales ──────────────────────────────────────────────────────────

export type { PlatformSaleFilters };

export async function getPlatformSales(filters?: PlatformSaleFilters): Promise<PlatformSale[]> {
  noStore();
  return readPlatformSales(filters);
}

export async function getPlatformSaleById(id: string): Promise<PlatformSale | null> {
  noStore();
  return getPlatformSaleRow(id);
}

export async function createPlatformSale(
  data: Omit<PlatformSale, "id" | "createdAt" | "updatedAt">
): Promise<PlatformSale> {
  const now = new Date().toISOString();
  const sale: PlatformSale = { ...data, id: randomUUID(), createdAt: now, updatedAt: now };
  return insertPlatformSale(sale);
}

export async function updatePlatformSale(
  id: string,
  data: Partial<Omit<PlatformSale, "id" | "createdAt">>
): Promise<PlatformSale | null> {
  return updatePlatformSaleRow(id, data);
}

export async function linkSaleToItem(
  saleId: string,
  itemId: string | null
): Promise<PlatformSale | null> {
  return updatePlatformSale(saleId, { matchedItemId: itemId ?? undefined });
}

// ─── Activity logs ───────────────────────────────────────────────────────────

export async function getActivityLogs(accountId: string): Promise<ActivityLog[]> {
  noStore();
  return readActivityLogs(accountId);
}

export async function addActivityLog(
  accountId: string,
  action: LogAction,
  detail: string,
  status: LogStatus = "info",
  metadata?: Record<string, unknown>
): Promise<ActivityLog> {
  return insertActivityLog(accountId, action, detail, status, metadata);
}
