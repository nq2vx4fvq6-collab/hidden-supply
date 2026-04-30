import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { isSupabaseEnabled, getSupabaseClient } from "@/lib/supabase";
import type {
  MarketplaceAccount,
  PlatformSale,
  ActivityLog,
  LogAction,
  LogStatus,
  Platform,
  MarketplaceStore,
} from "@/lib/types/marketplace";

/**
 * Single store module for the three marketplace tables (accounts, platform_sales,
 * activity_logs). They share one JSON fallback file (`data/marketplace.json`),
 * so co-locating the row mappers + read/write here avoids spreading shared
 * file-state across three modules.
 */

const DATA_FILE = path.join(process.cwd(), "data", "marketplace.json");

type Row = Record<string, unknown>;

// ─── JSON file fallback ──────────────────────────────────────────────────────

async function readFile(): Promise<MarketplaceStore> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw) as MarketplaceStore;
  } catch {
    return { accounts: [], platformSales: [], activityLogs: [] };
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

// ─── Account mappers ─────────────────────────────────────────────────────────

function accountFromRow(row: Row): MarketplaceAccount {
  return {
    id: row.id as string,
    platform: row.platform as MarketplaceAccount["platform"],
    displayName: row.display_name as string,
    externalId: (row.external_id as string | null) ?? undefined,
    credentialsRef: (row.credentials_ref as string | null) ?? undefined,
    loginUsername: (row.login_username as string | null) ?? undefined,
    loginPassword: (row.login_password as string | null) ?? undefined,
    loginNotes: (row.login_notes as string | null) ?? undefined,
    notes: (row.notes as string | null) ?? undefined,
    isConnected: row.is_connected as boolean,
    lastSyncedAt: (row.last_synced_at as string | null) ?? undefined,
    avatarUrl: (row.avatar_url as string | null) ?? undefined,
    email: (row.email as string | null) ?? undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function accountToInsertRow(account: MarketplaceAccount): Row {
  return {
    id: account.id,
    platform: account.platform,
    display_name: account.displayName,
    external_id: account.externalId ?? null,
    credentials_ref: account.credentialsRef ?? null,
    login_username: account.loginUsername ?? null,
    login_password: account.loginPassword ?? null,
    login_notes: account.loginNotes ?? null,
    notes: account.notes ?? null,
    is_connected: account.isConnected,
    last_synced_at: account.lastSyncedAt ?? null,
    avatar_url: account.avatarUrl ?? null,
    email: account.email ?? null,
    created_at: account.createdAt,
    updated_at: account.updatedAt,
  };
}

function accountToPatchRow(patch: Partial<MarketplaceAccount>): Row {
  const row: Row = { updated_at: new Date().toISOString() };
  if (patch.platform !== undefined)     row.platform = patch.platform;
  if (patch.displayName !== undefined)  row.display_name = patch.displayName;
  if ("externalId" in patch)            row.external_id = patch.externalId ?? null;
  if ("credentialsRef" in patch)        row.credentials_ref = patch.credentialsRef ?? null;
  if ("loginUsername" in patch)         row.login_username = patch.loginUsername ?? null;
  if ("loginPassword" in patch)         row.login_password = patch.loginPassword ?? null;
  if ("loginNotes" in patch)            row.login_notes = patch.loginNotes ?? null;
  if ("notes" in patch)                 row.notes = patch.notes ?? null;
  if (patch.isConnected !== undefined)  row.is_connected = patch.isConnected;
  if ("lastSyncedAt" in patch)          row.last_synced_at = patch.lastSyncedAt ?? null;
  if ("avatarUrl" in patch)             row.avatar_url = patch.avatarUrl ?? null;
  if ("email" in patch)                 row.email = patch.email ?? null;
  return row;
}

// ─── Sale mappers ────────────────────────────────────────────────────────────

function saleFromRow(row: Row): PlatformSale {
  return {
    id: row.id as string,
    accountId: row.account_id as string,
    platform: row.platform as PlatformSale["platform"],
    externalSaleId: (row.external_sale_id as string | null) ?? undefined,
    title: row.title as string,
    sku: (row.sku as string | null) ?? undefined,
    brand: (row.brand as string | null) ?? undefined,
    size: (row.size as string | null) ?? undefined,
    amount: row.amount as number,
    currency: row.currency as string,
    soldAt: row.sold_at as string,
    rawPayload: (row.raw_payload as Record<string, unknown> | null) ?? undefined,
    matchedItemId: (row.matched_item_id as string | null) ?? undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function saleToInsertRow(sale: PlatformSale): Row {
  return {
    id: sale.id,
    account_id: sale.accountId,
    platform: sale.platform,
    external_sale_id: sale.externalSaleId ?? null,
    title: sale.title,
    sku: sale.sku ?? null,
    brand: sale.brand ?? null,
    size: sale.size ?? null,
    amount: sale.amount,
    currency: sale.currency,
    sold_at: sale.soldAt,
    raw_payload: sale.rawPayload ?? null,
    matched_item_id: sale.matchedItemId ?? null,
    created_at: sale.createdAt,
    updated_at: sale.updatedAt,
  };
}

function saleToPatchRow(patch: Partial<PlatformSale>): Row {
  const row: Row = { updated_at: new Date().toISOString() };
  if ("externalSaleId" in patch) row.external_sale_id = patch.externalSaleId ?? null;
  if (patch.title !== undefined) row.title = patch.title;
  if ("sku" in patch)            row.sku = patch.sku ?? null;
  if ("brand" in patch)          row.brand = patch.brand ?? null;
  if ("size" in patch)           row.size = patch.size ?? null;
  if (patch.amount !== undefined)   row.amount = patch.amount;
  if (patch.currency !== undefined) row.currency = patch.currency;
  if (patch.soldAt !== undefined)   row.sold_at = patch.soldAt;
  if ("rawPayload" in patch)     row.raw_payload = patch.rawPayload ?? null;
  if ("matchedItemId" in patch)  row.matched_item_id = patch.matchedItemId ?? null;
  return row;
}

// ─── Log mappers ─────────────────────────────────────────────────────────────

function logFromRow(row: Row): ActivityLog {
  return {
    id: row.id as string,
    accountId: row.account_id as string,
    action: row.action as ActivityLog["action"],
    detail: (row.detail as string | null) ?? undefined,
    status: row.status as ActivityLog["status"],
    timestamp: row.timestamp as string,
    metadata: (row.metadata as Record<string, unknown> | null) ?? undefined,
  };
}

function logToInsertRow(log: ActivityLog): Row {
  return {
    id: log.id,
    account_id: log.accountId,
    action: log.action,
    detail: log.detail ?? null,
    status: log.status,
    timestamp: log.timestamp,
    metadata: log.metadata ?? null,
  };
}

// ═══ Accounts ════════════════════════════════════════════════════════════════

export async function readAccounts(): Promise<MarketplaceAccount[]> {
  if (isSupabaseEnabled) {
    const { data, error } = await getSupabaseClient()
      .from("marketplace_accounts")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("[marketplaceStore] readAccounts:", error.message);
      return [];
    }
    return (data ?? []).map(accountFromRow);
  }
  const store = await readFile();
  return store.accounts;
}

export async function getAccountRow(id: string): Promise<MarketplaceAccount | null> {
  if (isSupabaseEnabled) {
    const { data, error } = await getSupabaseClient()
      .from("marketplace_accounts")
      .select("*")
      .eq("id", id)
      .single();
    if (error || !data) return null;
    return accountFromRow(data);
  }
  const store = await readFile();
  return store.accounts.find((a) => a.id === id) ?? null;
}

export async function readAccountsByPlatform(platform: Platform): Promise<MarketplaceAccount[]> {
  if (isSupabaseEnabled) {
    const { data, error } = await getSupabaseClient()
      .from("marketplace_accounts")
      .select("*")
      .eq("platform", platform)
      .order("created_at", { ascending: false });
    if (error) {
      console.error("[marketplaceStore] readAccountsByPlatform:", error.message);
      return [];
    }
    return (data ?? []).map(accountFromRow);
  }
  const store = await readFile();
  return store.accounts.filter((a) => a.platform === platform);
}

export async function insertAccount(account: MarketplaceAccount): Promise<MarketplaceAccount> {
  if (isSupabaseEnabled) {
    const { data, error } = await getSupabaseClient()
      .from("marketplace_accounts")
      .insert(accountToInsertRow(account))
      .select()
      .single();
    if (error || !data) throw new Error(`[marketplaceStore] insertAccount: ${error?.message}`);
    return accountFromRow(data);
  }
  const store = await readFile();
  store.accounts.unshift(account);
  await writeFile(store);
  return account;
}

export async function updateAccountRow(
  id: string,
  patch: Partial<MarketplaceAccount>
): Promise<MarketplaceAccount | null> {
  if (isSupabaseEnabled) {
    const { data, error } = await getSupabaseClient()
      .from("marketplace_accounts")
      .update(accountToPatchRow(patch))
      .eq("id", id)
      .select()
      .single();
    if (error || !data) {
      console.error("[marketplaceStore] updateAccountRow:", error?.message);
      return null;
    }
    return accountFromRow(data);
  }
  const store = await readFile();
  const idx = store.accounts.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  store.accounts[idx] = {
    ...store.accounts[idx],
    ...patch,
    id,
    updatedAt: new Date().toISOString(),
  };
  await writeFile(store);
  return store.accounts[idx];
}

export async function deleteAccountRow(id: string): Promise<boolean> {
  if (isSupabaseEnabled) {
    const { error, count } = await getSupabaseClient()
      .from("marketplace_accounts")
      .delete({ count: "exact" })
      .eq("id", id);
    if (error) {
      console.error("[marketplaceStore] deleteAccountRow:", error.message);
      return false;
    }
    return (count ?? 0) > 0;
  }
  const store = await readFile();
  const before = store.accounts.length;
  store.accounts = store.accounts.filter((a) => a.id !== id);
  if (store.accounts.length === before) return false;
  await writeFile(store);
  return true;
}

// ═══ Platform sales ══════════════════════════════════════════════════════════

export interface PlatformSaleFilters {
  platform?: Platform;
  accountId?: string;
  matched?: boolean;
  fromDate?: string;
  toDate?: string;
}

export async function readPlatformSales(filters?: PlatformSaleFilters): Promise<PlatformSale[]> {
  if (isSupabaseEnabled) {
    let query = getSupabaseClient()
      .from("platform_sales")
      .select("*")
      .order("sold_at", { ascending: false });
    if (filters?.platform)           query = query.eq("platform", filters.platform);
    if (filters?.accountId)          query = query.eq("account_id", filters.accountId);
    if (filters?.matched === true)   query = query.not("matched_item_id", "is", null);
    if (filters?.matched === false)  query = query.is("matched_item_id", null);
    if (filters?.fromDate)           query = query.gte("sold_at", filters.fromDate);
    if (filters?.toDate)             query = query.lte("sold_at", filters.toDate);
    const { data, error } = await query;
    if (error) {
      console.error("[marketplaceStore] readPlatformSales:", error.message);
      return [];
    }
    return (data ?? []).map(saleFromRow);
  }
  const store = await readFile();
  let sales = store.platformSales.slice();
  if (filters?.platform)          sales = sales.filter((s) => s.platform === filters.platform);
  if (filters?.accountId)         sales = sales.filter((s) => s.accountId === filters.accountId);
  if (filters?.matched === true)  sales = sales.filter((s) => !!s.matchedItemId);
  if (filters?.matched === false) sales = sales.filter((s) => !s.matchedItemId);
  if (filters?.fromDate)          sales = sales.filter((s) => s.soldAt >= filters.fromDate!);
  if (filters?.toDate)            sales = sales.filter((s) => s.soldAt <= filters.toDate!);
  sales.sort((a, b) => (a.soldAt < b.soldAt ? 1 : -1));
  return sales;
}

export async function getPlatformSaleRow(id: string): Promise<PlatformSale | null> {
  if (isSupabaseEnabled) {
    const { data, error } = await getSupabaseClient()
      .from("platform_sales")
      .select("*")
      .eq("id", id)
      .single();
    if (error || !data) return null;
    return saleFromRow(data);
  }
  const store = await readFile();
  return store.platformSales.find((s) => s.id === id) ?? null;
}

export async function insertPlatformSale(sale: PlatformSale): Promise<PlatformSale> {
  if (isSupabaseEnabled) {
    const { data, error } = await getSupabaseClient()
      .from("platform_sales")
      .insert(saleToInsertRow(sale))
      .select()
      .single();
    if (error || !data) throw new Error(`[marketplaceStore] insertPlatformSale: ${error?.message}`);
    return saleFromRow(data);
  }
  const store = await readFile();
  store.platformSales.unshift(sale);
  await writeFile(store);
  return sale;
}

export async function updatePlatformSaleRow(
  id: string,
  patch: Partial<PlatformSale>
): Promise<PlatformSale | null> {
  if (isSupabaseEnabled) {
    const { data, error } = await getSupabaseClient()
      .from("platform_sales")
      .update(saleToPatchRow(patch))
      .eq("id", id)
      .select()
      .single();
    if (error || !data) {
      console.error("[marketplaceStore] updatePlatformSaleRow:", error?.message);
      return null;
    }
    return saleFromRow(data);
  }
  const store = await readFile();
  const idx = store.platformSales.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  store.platformSales[idx] = {
    ...store.platformSales[idx],
    ...patch,
    id,
    updatedAt: new Date().toISOString(),
  };
  await writeFile(store);
  return store.platformSales[idx];
}

// ═══ Activity logs ═══════════════════════════════════════════════════════════

export async function readActivityLogs(accountId: string): Promise<ActivityLog[]> {
  if (isSupabaseEnabled) {
    const { data, error } = await getSupabaseClient()
      .from("activity_logs")
      .select("*")
      .eq("account_id", accountId)
      .order("timestamp", { ascending: false });
    if (error) {
      console.error("[marketplaceStore] readActivityLogs:", error.message);
      return [];
    }
    return (data ?? []).map(logFromRow);
  }
  const store = await readFile();
  return store.activityLogs
    .filter((l) => l.accountId === accountId)
    .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
}

export async function insertActivityLog(
  accountId: string,
  action: LogAction,
  detail: string,
  status: LogStatus = "info",
  metadata?: Record<string, unknown>
): Promise<ActivityLog> {
  const log: ActivityLog = {
    id: randomUUID(),
    accountId,
    action,
    detail,
    status,
    timestamp: new Date().toISOString(),
    metadata,
  };

  if (isSupabaseEnabled) {
    const { data, error } = await getSupabaseClient()
      .from("activity_logs")
      .insert(logToInsertRow(log))
      .select()
      .single();
    if (error || !data) throw new Error(`[marketplaceStore] insertActivityLog: ${error?.message}`);
    return logFromRow(data);
  }
  const store = await readFile();
  store.activityLogs.unshift(log);
  await writeFile(store);
  return log;
}
