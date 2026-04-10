import Link from "next/link";
import { getAllAccounts } from "@/lib/services/marketplace";
import type { Platform } from "@/lib/types/marketplace";
import PlatformBadge from "@/components/marketplace/PlatformBadge";

export const dynamic = "force-dynamic";

const PLATFORM_ORDER: Platform[] = ["ebay", "poshmark", "stockx", "grailed", "depop"];

export default async function AccountsListPage() {
  const accounts = await getAllAccounts();
  const byPlatform = PLATFORM_ORDER.map((platform) => ({
    platform,
    accounts: accounts.filter((a) => a.platform === platform),
  }));

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Accounts</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {accounts.length} {accounts.length === 1 ? "account" : "accounts"} across marketplaces
          </p>
        </div>
        <Link
          href="/admin/accounts/accounts/new"
          className="rounded-full bg-accent px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-accent-foreground transition-opacity hover:opacity-90"
        >
          + Add account
        </Link>
      </div>

      {accounts.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-12 text-center">
          <p className="text-sm text-zinc-500">No accounts yet.</p>
          <p className="mt-1 text-xs text-zinc-600">
            Add an account for eBay, Poshmark, StockX, Grailed, or Depop to start monitoring sales.
          </p>
          <Link
            href="/admin/accounts/accounts/new"
            className="mt-4 inline-block rounded-full bg-accent px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-accent-foreground"
          >
            Add account
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {byPlatform.map(
            ({ platform, accounts: platformAccounts }) =>
              platformAccounts.length > 0 && (
                <div key={platform}>
                  <h2 className="mb-3 text-[11px] font-medium uppercase tracking-[0.25em] text-zinc-500">
                    <PlatformBadge platform={platform} />
                  </h2>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {platformAccounts.map((account) => (
                      <Link
                        key={account.id}
                        href={`/admin/accounts/accounts/${account.id}`}
                        className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900/30 p-4 transition-colors hover:border-zinc-700 hover:bg-zinc-900/50"
                      >
                        <div>
                          <p className="font-medium text-zinc-200">
                            {account.displayName || "Unnamed account"}
                          </p>
                          <p className="mt-0.5 text-[11px] text-zinc-600">
                            {account.isConnected ? "Connected" : "Not connected"}
                            {account.lastSyncedAt &&
                              ` · Synced ${new Date(account.lastSyncedAt).toLocaleDateString()}`}
                          </p>
                        </div>
                        <span className="text-zinc-600">→</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )
          )}
        </div>
      )}
    </div>
  );
}
