import Link from "next/link";
import { getPlatformSales, getAllAccounts } from "@/lib/marketplaceStore";
import PlatformBadge from "@/components/PlatformBadge";
import SalesMonitorFilters from "@/components/SalesMonitorFilters";

export const dynamic = "force-dynamic";

export default async function SalesMonitorPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const platform = params.platform as "ebay" | "poshmark" | "stockx" | "grailed" | "depop" | undefined;
  const accountId = params.accountId;
  const matched = params.matched;
  const fromDate = params.fromDate;
  const toDate = params.toDate;

  const [sales, accounts] = await Promise.all([
    getPlatformSales({
      platform: platform || undefined,
      accountId: accountId || undefined,
      matched:
        matched === "yes" ? true : matched === "no" ? false : undefined,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
    }),
    getAllAccounts(),
  ]);

  const accountMap = new Map(accounts.map((a) => [a.id, a]));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Sales</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {sales.length} {sales.length === 1 ? "sale" : "sales"} from marketplace accounts
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/accounts/sales/import"
            className="rounded-full border border-zinc-700 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
          >
            Import CSV
          </Link>
          <Link
            href="/admin/accounts/sales/new"
            className="rounded-full bg-accent px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-accent-foreground transition-opacity hover:opacity-90"
          >
            + Add sale
          </Link>
        </div>
      </div>

      <SalesMonitorFilters accounts={accounts} />

      <div className="overflow-hidden rounded-2xl border border-zinc-800">
        <table className="w-full text-sm">
          <thead className="border-b border-zinc-800 bg-zinc-900/50">
            <tr>
              {["Platform", "Account", "Date", "Title", "SKU", "Amount", "Match"].map(
                (h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-[10px] font-normal uppercase tracking-[0.25em] text-zinc-500"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {sales.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-12 text-center text-sm text-zinc-600"
                >
                  No sales yet. Add sales manually or import CSV.
                </td>
              </tr>
            )}
            {sales.map((sale, i) => {
              const account = accountMap.get(sale.accountId);
              return (
                <tr
                  key={sale.id}
                  className={`transition-colors hover:bg-zinc-900/40 ${
                    i < sales.length - 1 ? "border-b border-zinc-900" : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    <PlatformBadge platform={sale.platform} />
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-400">
                    {account?.displayName ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-500">
                    {sale.soldAt}
                  </td>
                  <td className="max-w-[180px] truncate px-4 py-3 text-xs text-zinc-200">
                    {sale.title}
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-zinc-500">
                    {sale.sku ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-xs font-medium text-zinc-100">
                    ${sale.amount.toLocaleString()} {sale.currency}
                  </td>
                  <td className="px-4 py-3">
                    {sale.matchedItemId ? (
                      <Link
                        href={`/admin/items/${sale.matchedItemId}/edit`}
                        className="text-[11px] text-emerald-400 hover:underline"
                      >
                        Linked
                      </Link>
                    ) : (
                      <Link
                        href={`/admin/accounts/supply?highlight=${sale.id}`}
                        className="text-[11px] text-amber-400 hover:underline"
                      >
                        Unmatched
                      </Link>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
