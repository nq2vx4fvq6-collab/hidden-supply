import { randomUUID } from "crypto";
import { unstable_noStore as noStore } from "next/cache";
import { supabase } from "@/lib/supabase";
import type {
  MarketplaceAccount,
  PlatformSale,
  ActivityLog,
  LogAction,
  LogStatus,
  Platform,
} from "@/lib/marketplaceModels";

type Row = Record<string, unknown>;

// ─── Row → Model mappers ──────────────────────────────────────────────────────

function rowToAccount(row: Row): MarketplaceAccount {
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

function rowToSale(row: Row): PlatformSale {
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

function rowToLog(row: Row): ActivityLog {
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

// ─── Accounts ────────────────────────────────────────────────────────────────

export async function getAllAccounts(): Promise<MarketplaceAccount[]> {
  noStore();
  const { data, error } = await supabase
    .from("marketplace_accounts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[marketplaceStore] getAllAccounts failed:", error.message);
    return [];
  }
  return (data ?? []).map(rowToAccount);
}

export async function getAccountById(id: string): Promise<MarketplaceAccount | null> {
  noStore();
  const { data, error } = await supabase
    .from("marketplace_accounts")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return rowToAccount(data);
}

export async function getAccountsByPlatform(platform: Platform): Promise<MarketplaceAccount[]> {
  noStore();
  const { data, error } = await supabase
    .from("marketplace_accounts")
    .select("*")
    .eq("platform", platform)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[marketplaceStore] getAccountsByPlatform failed:", error.message);
    return [];
  }
  return (data ?? []).map(rowToAccount);
}

export async function createAccount(
  data: Omit<MarketplaceAccount, "id" | "createdAt" | "updatedAt">
): Promise<MarketplaceAccount> {
  const now = new Date().toISOString();
  const row = {
    id: randomUUID(),
    platform: data.platform,
    display_name: data.displayName,
    external_id: data.externalId ?? null,
    credentials_ref: data.credentialsRef ?? null,
    login_username: data.loginUsername ?? null,
    login_password: data.loginPassword ?? null,
    login_notes: data.loginNotes ?? null,
    notes: data.notes ?? null,
    is_connected: data.isConnected,
    last_synced_at: data.lastSyncedAt ?? null,
    avatar_url: data.avatarUrl ?? null,
    email: data.email ?? null,
    created_at: now,
    updated_at: now,
  };

  const { data: inserted, error } = await supabase
    .from("marketplace_accounts")
    .insert(row)
    .select()
    .single();

  if (error || !inserted) {
    console.error("[marketplaceStore] createAccount failed:", error?.message);
    throw error;
  }

  const account = rowToAccount(inserted);

  // Auto-log creation
  await addActivityLog(
    account.id,
    "account_created",
    `Account "${account.displayName}" created on ${account.platform}`,
    "success"
  );

  return account;
}

export async function updateAccount(
  id: string,
  data: Partial<Omit<MarketplaceAccount, "id" | "createdAt">>
): Promise<MarketplaceAccount | null> {
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (data.platform !== undefined)       patch.platform = data.platform;
  if (data.displayName !== undefined)    patch.display_name = data.displayName;
  if ("externalId" in data)              patch.external_id = data.externalId ?? null;
  if ("credentialsRef" in data)          patch.credentials_ref = data.credentialsRef ?? null;
  if ("loginUsername" in data)           patch.login_username = data.loginUsername ?? null;
  if ("loginPassword" in data)           patch.login_password = data.loginPassword ?? null;
  if ("loginNotes" in data)              patch.login_notes = data.loginNotes ?? null;
  if ("notes" in data)                   patch.notes = data.notes ?? null;
  if (data.isConnected !== undefined)    patch.is_connected = data.isConnected;
  if ("lastSyncedAt" in data)            patch.last_synced_at = data.lastSyncedAt ?? null;
  if ("avatarUrl" in data)               patch.avatar_url = data.avatarUrl ?? null;
  if ("email" in data)                   patch.email = data.email ?? null;

  const { data: updated, error } = await supabase
    .from("marketplace_accounts")
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  if (error || !updated) {
    console.error("[marketplaceStore] updateAccount failed:", error?.message);
    return null;
  }
  return rowToAccount(updated);
}

export async function deleteAccount(id: string): Promise<boolean> {
  const { error, count } = await supabase
    .from("marketplace_accounts")
    .delete({ count: "exact" })
    .eq("id", id);

  if (error) {
    console.error("[marketplaceStore] deleteAccount failed:", error.message);
    return false;
  }
  return (count ?? 0) > 0;
}

// ─── Platform sales ───────────────────────────────────────────────────────────

export interface PlatformSaleFilters {
  platform?: Platform;
  accountId?: string;
  matched?: boolean;
  fromDate?: string;
  toDate?: string;
}

export async function getPlatformSales(filters?: PlatformSaleFilters): Promise<PlatformSale[]> {
  noStore();
  let query = supabase
    .from("platform_sales")
    .select("*")
    .order("sold_at", { ascending: false });

  if (filters?.platform)              query = query.eq("platform", filters.platform);
  if (filters?.accountId)             query = query.eq("account_id", filters.accountId);
  if (filters?.matched === true)      query = query.not("matched_item_id", "is", null);
  if (filters?.matched === false)     query = query.is("matched_item_id", null);
  if (filters?.fromDate)              query = query.gte("sold_at", filters.fromDate);
  if (filters?.toDate)                query = query.lte("sold_at", filters.toDate);

  const { data, error } = await query;
  if (error) {
    console.error("[marketplaceStore] getPlatformSales failed:", error.message);
    return [];
  }
  return (data ?? []).map(rowToSale);
}

export async function getPlatformSaleById(id: string): Promise<PlatformSale | null> {
  noStore();
  const { data, error } = await supabase
    .from("platform_sales")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return rowToSale(data);
}

export async function createPlatformSale(
  data: Omit<PlatformSale, "id" | "createdAt" | "updatedAt">
): Promise<PlatformSale> {
  const now = new Date().toISOString();
  const row = {
    id: randomUUID(),
    account_id: data.accountId,
    platform: data.platform,
    external_sale_id: data.externalSaleId ?? null,
    title: data.title,
    sku: data.sku ?? null,
    brand: data.brand ?? null,
    size: data.size ?? null,
    amount: data.amount,
    currency: data.currency,
    sold_at: data.soldAt,
    raw_payload: data.rawPayload ?? null,
    matched_item_id: data.matchedItemId ?? null,
    created_at: now,
    updated_at: now,
  };

  const { data: inserted, error } = await supabase
    .from("platform_sales")
    .insert(row)
    .select()
    .single();

  if (error || !inserted) {
    console.error("[marketplaceStore] createPlatformSale failed:", error?.message);
    throw error;
  }
  return rowToSale(inserted);
}

export async function updatePlatformSale(
  id: string,
  data: Partial<Omit<PlatformSale, "id" | "createdAt">>
): Promise<PlatformSale | null> {
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if ("externalSaleId" in data)    patch.external_sale_id = data.externalSaleId ?? null;
  if (data.title !== undefined)    patch.title = data.title;
  if ("sku" in data)               patch.sku = data.sku ?? null;
  if ("brand" in data)             patch.brand = data.brand ?? null;
  if ("size" in data)              patch.size = data.size ?? null;
  if (data.amount !== undefined)   patch.amount = data.amount;
  if (data.currency !== undefined) patch.currency = data.currency;
  if (data.soldAt !== undefined)   patch.sold_at = data.soldAt;
  if ("rawPayload" in data)        patch.raw_payload = data.rawPayload ?? null;
  if ("matchedItemId" in data)     patch.matched_item_id = data.matchedItemId ?? null;

  const { data: updated, error } = await supabase
    .from("platform_sales")
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  if (error || !updated) {
    console.error("[marketplaceStore] updatePlatformSale failed:", error?.message);
    return null;
  }
  return rowToSale(updated);
}

export async function linkSaleToItem(saleId: string, itemId: string | null): Promise<PlatformSale | null> {
  return updatePlatformSale(saleId, { matchedItemId: itemId ?? undefined });
}

// ─── Activity logs ────────────────────────────────────────────────────────────

export async function getActivityLogs(accountId: string): Promise<ActivityLog[]> {
  noStore();
  const { data, error } = await supabase
    .from("activity_logs")
    .select("*")
    .eq("account_id", accountId)
    .order("timestamp", { ascending: false });

  if (error) {
    console.error("[marketplaceStore] getActivityLogs failed:", error.message);
    return [];
  }
  return (data ?? []).map(rowToLog);
}

export async function addActivityLog(
  accountId: string,
  action: LogAction,
  detail: string,
  status: LogStatus = "info",
  metadata?: Record<string, unknown>
): Promise<ActivityLog> {
  const row = {
    id: randomUUID(),
    account_id: accountId,
    action,
    detail,
    status,
    timestamp: new Date().toISOString(),
    metadata: metadata ?? null,
  };

  const { data: inserted, error } = await supabase
    .from("activity_logs")
    .insert(row)
    .select()
    .single();

  if (error || !inserted) {
    console.error("[marketplaceStore] addActivityLog failed:", error?.message);
    throw error;
  }
  return rowToLog(inserted);
}
