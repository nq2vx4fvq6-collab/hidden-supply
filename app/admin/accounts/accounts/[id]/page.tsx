import Link from "next/link";
import { notFound } from "next/navigation";
import { getAccountById, getPlatformSales, getActivityLogs } from "@/lib/services/marketplaceStore";
import PlatformBadge from "@/components/marketplace/PlatformBadge";
import SyncAccountButton from "@/components/marketplace/SyncAccountButton";
import DeleteAccountButton from "@/components/marketplace/DeleteAccountButton";
import CredentialsForm from "@/components/marketplace/CredentialsForm";
import ActivityLogPanel from "@/components/marketplace/ActivityLogPanel";
import AccountTabsClient from "@/components/marketplace/AccountTabsClient";

export const dynamic = "force-dynamic";

const PLATFORM_COLORS: Record<string, string> = {
  ebay:     "from-amber-500/10 to-transparent border-amber-500/20",
  poshmark: "from-pink-500/10 to-transparent border-pink-500/20",
  stockx:   "from-green-500/10 to-transparent border-green-500/20",
  grailed:  "from-red-500/10 to-transparent border-red-500/20",
  depop:    "from-red-400/10 to-transparent border-red-400/20",
};

const PLATFORM_ACCENT: Record<string, string> = {
  ebay:     "text-amber-400",
  poshmark: "text-pink-400",
  stockx:   "text-green-400",
  grailed:  "text-red-400",
  depop:    "text-red-300",
};

export default async function AccountDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const [{ id }, { tab = "overview" }] = await Promise.all([params, searchParams]);
  const account = await getAccountById(id);
  if (!account) notFound();

  const [sales, logs] = await Promise.all([
    getPlatformSales({ accountId: id }),
    getActivityLogs(id),
  ]);

  const recentSales = sales.slice(0, 20);
  const totalRevenue = sales.reduce((sum, s) => sum + (s.amount ?? 0), 0);
  const unmatchedCount = sales.filter((s) => !s.matchedItemId).length;

  const gradient = PLATFORM_COLORS[account.platform] ?? "from-zinc-800/30 to-transparent border-zinc-700/30";
  const accentColor = PLATFORM_ACCENT[account.platform] ?? "text-zinc-300";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`rounded-2xl border bg-gradient-to-b ${gradient} p-6`}>
        <Link
          href="/admin/accounts/accounts"
          className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          ← All accounts
        </Link>
        <div className="mt-3 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className={`text-2xl font-bold tracking-tight ${accentColor}`}>
                {account.displayName || "Unnamed account"}
              </h1>
              <PlatformBadge platform={account.platform} />
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                  account.isConnected
                    ? "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30"
                    : "bg-zinc-800 text-zinc-500"
                }`}
              >
                {account.isConnected ? "● Connected" : "○ Not connected"}
              </span>
            </div>
            {account.email && (
              <p className="mt-1 text-sm text-zinc-400">{account.email}</p>
            )}
            {account.loginUsername && (
              <p className="mt-0.5 text-xs text-zinc-500">@{account.loginUsername}</p>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            <SyncAccountButton accountId={account.id} platform={account.platform} />
            <Link
              href={`/admin/accounts/accounts/${id}/edit`}
              className="rounded-full border border-zinc-700 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400 hover:border-zinc-600 hover:text-zinc-200 transition-colors"
            >
              Edit
            </Link>
            <DeleteAccountButton accountId={id} />
          </div>
        </div>

        {/* Quick stats row */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl bg-black/30 p-3">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500">Total sales</p>
            <p className="mt-1 text-xl font-bold text-zinc-100">{sales.length}</p>
          </div>
          <div className="rounded-xl bg-black/30 p-3">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500">Revenue</p>
            <p className="mt-1 text-xl font-bold text-emerald-400">${totalRevenue.toLocaleString()}</p>
          </div>
          <div className="rounded-xl bg-black/30 p-3">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500">Unmatched</p>
            <p className="mt-1 text-xl font-bold text-amber-400">{unmatchedCount}</p>
          </div>
          <div className="rounded-xl bg-black/30 p-3">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500">Last sync</p>
            <p className="mt-1 text-sm font-medium text-zinc-300">
              {account.lastSyncedAt
                ? new Date(account.lastSyncedAt).toLocaleDateString()
                : "Never"}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <AccountTabsClient activeTab={tab} accountId={id}>
        {{
          overview: (
            <div className="space-y-6">
              {/* Account details */}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/20 p-5">
                <p className="mb-4 text-[10px] font-medium uppercase tracking-[0.25em] text-zinc-500">Account info</p>
                <dl className="grid gap-y-3 gap-x-8 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-zinc-600">Display name</dt>
                    <dd className="text-zinc-200">{account.displayName || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-zinc-600">Platform</dt>
                    <dd className="capitalize text-zinc-200">{account.platform}</dd>
                  </div>
                  {account.email && (
                    <div>
                      <dt className="text-zinc-600">Email</dt>
                      <dd className="text-zinc-200">{account.email}</dd>
                    </div>
                  )}
                  {account.loginUsername && (
                    <div>
                      <dt className="text-zinc-600">Username</dt>
                      <dd className="text-zinc-200">{account.loginUsername}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-zinc-600">Created</dt>
                    <dd className="text-zinc-200">{new Date(account.createdAt).toLocaleDateString()}</dd>
                  </div>
                  <div>
                    <dt className="text-zinc-600">Last sync</dt>
                    <dd className="text-zinc-200">
                      {account.lastSyncedAt ? new Date(account.lastSyncedAt).toLocaleString() : "Never"}
                    </dd>
                  </div>
                </dl>
                {account.notes && (
                  <div className="mt-4 border-t border-zinc-800 pt-4">
                    <dt className="text-xs text-zinc-600">Notes</dt>
                    <dd className="mt-1 text-sm text-zinc-400 whitespace-pre-wrap">{account.notes}</dd>
                  </div>
                )}
              </div>

              {/* Recent sales preview */}
              {sales.length > 0 && (
                <div className="rounded-2xl border border-zinc-800 overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
                    <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-zinc-500">Recent sales</p>
                    <span className="text-[11px] text-zinc-600">{sales.length} total</span>
                  </div>
                  <table className="w-full text-sm">
                    <tbody>
                      {recentSales.slice(0, 5).map((sale, i) => (
                        <tr key={sale.id} className={`transition-colors hover:bg-zinc-900/40 ${i < 4 ? "border-b border-zinc-900" : ""}`}>
                          <td className="px-5 py-3 text-xs text-zinc-500 w-24">{sale.soldAt.slice(0, 10)}</td>
                          <td className="px-5 py-3 text-xs text-zinc-200 max-w-[200px] truncate">{sale.title}</td>
                          <td className="px-5 py-3 text-xs font-semibold text-zinc-100 text-right">${sale.amount.toLocaleString()}</td>
                          <td className="px-5 py-3 text-xs text-right">
                            {sale.matchedItemId
                              ? <span className="text-emerald-400">Matched</span>
                              : <span className="text-zinc-600">Unmatched</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ),

          credentials: (
            <div className="max-w-lg space-y-4">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/20 p-4 text-xs text-zinc-500 flex gap-3">
                <span className="text-amber-400 text-base leading-none mt-0.5">⚠</span>
                <span>Credentials are stored in your Vercel Blob (private to this admin panel). Do not share your admin password.</span>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/20 p-6">
                <CredentialsForm account={account} />
              </div>
            </div>
          ),

          sales: (
            <div>
              {recentSales.length === 0 ? (
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/20 p-12 text-center text-sm text-zinc-600">
                  No sales recorded yet. Sync this account or add sales manually.
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-zinc-800">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
                    <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-zinc-500">
                      All sales — {sales.length} total
                    </p>
                    <p className="text-xs font-semibold text-emerald-400">${totalRevenue.toLocaleString()}</p>
                  </div>
                  <table className="w-full text-sm">
                    <thead className="border-b border-zinc-800 bg-zinc-900/50">
                      <tr>
                        <th className="px-5 py-3 text-left text-[10px] font-normal uppercase tracking-[0.2em] text-zinc-500">Date</th>
                        <th className="px-5 py-3 text-left text-[10px] font-normal uppercase tracking-[0.2em] text-zinc-500">Item</th>
                        <th className="px-5 py-3 text-left text-[10px] font-normal uppercase tracking-[0.2em] text-zinc-500 hidden sm:table-cell">SKU</th>
                        <th className="px-5 py-3 text-right text-[10px] font-normal uppercase tracking-[0.2em] text-zinc-500">Amount</th>
                        <th className="px-5 py-3 text-right text-[10px] font-normal uppercase tracking-[0.2em] text-zinc-500">Match</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentSales.map((sale, i) => (
                        <tr key={sale.id} className={`transition-colors hover:bg-zinc-900/40 ${i < recentSales.length - 1 ? "border-b border-zinc-900" : ""}`}>
                          <td className="px-5 py-3 text-xs text-zinc-500 whitespace-nowrap">{sale.soldAt.slice(0, 10)}</td>
                          <td className="px-5 py-3 text-xs text-zinc-200 max-w-[180px] truncate">{sale.title}</td>
                          <td className="px-5 py-3 text-xs text-zinc-500 hidden sm:table-cell">{sale.sku ?? "—"}</td>
                          <td className="px-5 py-3 text-xs font-semibold text-zinc-100 text-right">${sale.amount.toLocaleString()}</td>
                          <td className="px-5 py-3 text-xs text-right">
                            {sale.matchedItemId ? (
                              <Link href={`/admin/items/${sale.matchedItemId}/edit`} className="text-emerald-400 hover:underline">Matched</Link>
                            ) : (
                              <Link href="/admin/accounts/supply" className="text-zinc-600 hover:text-amber-400 transition-colors">Match →</Link>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ),

          logs: (
            <div className="max-w-2xl">
              <ActivityLogPanel accountId={id} initialLogs={logs} />
            </div>
          ),
        }}
      </AccountTabsClient>
    </div>
  );
}
