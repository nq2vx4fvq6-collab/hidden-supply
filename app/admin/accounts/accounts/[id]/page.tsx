import Link from "next/link";
import { notFound } from "next/navigation";
import { getAccountById, getPlatformSales } from "@/lib/services/marketplaceStore";
import PlatformBadge from "@/components/marketplace/PlatformBadge";
import SyncAccountButton from "@/components/marketplace/SyncAccountButton";

export const dynamic = "force-dynamic";

export default async function AccountDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const account = await getAccountById(id);
  if (!account) notFound();

  const sales = await getPlatformSales({ accountId: id });
  const recentSales = sales.slice(0, 10);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <Link
            href="/admin/accounts/accounts"
            className="text-[11px] text-zinc-500 hover:text-accent"
          >
            ← Accounts
          </Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-100">
            {account.displayName || "Unnamed account"}
          </h1>
          <div className="mt-2 flex items-center gap-2">
            <PlatformBadge platform={account.platform} />
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase ${
                account.isConnected
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-zinc-800 text-zinc-500"
              }`}
            >
              {account.isConnected ? "Connected" : "Not connected"}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <SyncAccountButton accountId={account.id} platform={account.platform} />
          <Link
            href={`/admin/accounts/accounts/${id}/edit`}
            className="rounded-full border border-zinc-700 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
          >
            Edit
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5">
          <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-500">
            Details
          </p>
          <dl className="mt-3 space-y-2 text-sm">
            <div>
              <dt className="text-zinc-600">Display name</dt>
              <dd className="text-zinc-200">{account.displayName || "—"}</dd>
            </div>
            {account.email && (
              <div>
                <dt className="text-zinc-600">Email</dt>
                <dd className="text-zinc-200">{account.email}</dd>
              </div>
            )}
            <div>
              <dt className="text-zinc-600">Last synced</dt>
              <dd className="text-zinc-200">
                {account.lastSyncedAt
                  ? new Date(account.lastSyncedAt).toLocaleString()
                  : "Never"}
              </dd>
            </div>
          </dl>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5">
          <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-500">
            Sales
          </p>
          <p className="mt-3 text-2xl font-semibold text-zinc-50">
            {sales.length} total
          </p>
          <p className="mt-0.5 text-xs text-zinc-600">
            <Link href="/admin/accounts/sales" className="hover:text-accent">
              View all sales →
            </Link>
          </p>
        </div>
      </div>

      {/* Recent sales from this account */}
      <div>
        <h2 className="mb-4 text-[11px] font-medium uppercase tracking-[0.25em] text-zinc-500">
          Recent sales
        </h2>
        {recentSales.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/20 p-8 text-center text-sm text-zinc-600">
            No sales recorded for this account yet. Sync or add sales manually.
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-zinc-800">
            <table className="w-full text-sm">
              <thead className="border-b border-zinc-800 bg-zinc-900/50">
                <tr>
                  <th className="px-4 py-3 text-left text-[10px] font-normal uppercase tracking-[0.25em] text-zinc-500">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-normal uppercase tracking-[0.25em] text-zinc-500">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-normal uppercase tracking-[0.25em] text-zinc-500">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-normal uppercase tracking-[0.25em] text-zinc-500">
                    Match
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentSales.map((sale, i) => (
                  <tr
                    key={sale.id}
                    className={`transition-colors hover:bg-zinc-900/40 ${
                      i < recentSales.length - 1 ? "border-b border-zinc-900" : ""
                    }`}
                  >
                    <td className="px-4 py-3 text-xs text-zinc-500">
                      {sale.soldAt}
                    </td>
                    <td className="max-w-[200px] truncate px-4 py-3 text-xs text-zinc-200">
                      {sale.title}
                    </td>
                    <td className="px-4 py-3 text-xs font-medium text-zinc-100">
                      ${sale.amount.toLocaleString()} {sale.currency}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {sale.matchedItemId ? (
                        <Link
                          href={`/admin/items/${sale.matchedItemId}/edit`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-400 hover:underline"
                        >
                          Linked
                        </Link>
                      ) : (
                        <span className="text-zinc-600">Unmatched</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
