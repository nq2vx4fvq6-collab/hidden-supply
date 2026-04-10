export type Platform = "ebay" | "poshmark" | "stockx" | "grailed" | "depop";

export interface MarketplaceAccount {
  id: string;
  platform: Platform;
  displayName: string;
  externalId?: string;
  /** OAuth token ref or other API credential. */
  credentialsRef?: string;
  /** Stored login username / seller ID for manual reference. */
  loginUsername?: string;
  /** Stored login password (admin-gated, stored in blob). */
  loginPassword?: string;
  /** Extra login notes — 2FA backup codes, recovery email, etc. */
  loginNotes?: string;
  /** General account notes. */
  notes?: string;
  isConnected: boolean;
  lastSyncedAt?: string;
  avatarUrl?: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlatformSale {
  id: string;
  accountId: string;
  platform: Platform;
  externalSaleId?: string;
  title: string;
  sku?: string;
  brand?: string;
  size?: string;
  amount: number;
  currency: string;
  soldAt: string;
  rawPayload?: Record<string, unknown>;
  /** Link to inventory Item for supply cross-check. */
  matchedItemId?: string;
  createdAt: string;
  updatedAt: string;
}

export type LogAction =
  | "account_created"
  | "account_updated"
  | "credentials_updated"
  | "sync_started"
  | "sync_completed"
  | "sync_failed"
  | "sale_synced"
  | "sale_matched"
  | "manual_note";

export type LogStatus = "success" | "info" | "warning" | "error";

export interface ActivityLog {
  id: string;
  accountId: string;
  action: LogAction;
  detail?: string;
  status: LogStatus;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface MarketplaceStore {
  accounts: MarketplaceAccount[];
  platformSales: PlatformSale[];
  activityLogs: ActivityLog[];
}
