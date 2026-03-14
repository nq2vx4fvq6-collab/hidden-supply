export type Platform =
  | "ebay"
  | "poshmark"
  | "stockx"
  | "grailed"
  | "depop";

export interface MarketplaceAccount {
  id: string;
  platform: Platform;
  displayName: string;
  externalId?: string;
  /** Placeholder for token / encrypted credentials; server-only. */
  credentialsRef?: string;
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

export interface MarketplaceStore {
  accounts: MarketplaceAccount[];
  platformSales: PlatformSale[];
}
