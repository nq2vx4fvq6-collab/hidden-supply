import Link from "next/link";
import { getAllAccounts, getPlatformSales } from "@/lib/marketplaceStore";
import type { Platform } from "@/lib/marketplaceModels";

export const dynamic = "force-dynamic";

const PLATFORMS: Platform[] = ["ebay", "poshmark", "stockx", "grailed", "depop"];
const PLATFORM_LABELS: Record<Platform, string> = {
  ebay: "eBay",
  poshmark: "Poshmark",
  stockx: "StockX",
  grailed: "Grailed",
  depop: "Depop",
};

export default async function AccountsDashboardPage() {
  const [accounts, sales] = await Promise.all([
    getAllAccounts(),
    getPlatformSales(),
  ]);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .slice(0, 10);

  const salesThisMonth = sales.filter((s) => s.soldAt >= startOfMonth);
  const byPlatform = PLATFORMS.map((platform) => {
    const platformAccounts = accounts.filter((a) => a.platform === platform);
    const platformSalesThisMonth = salesThisMonth.filter(
      (s) => s.platform === platform
    );
    return {
      platform,
      label: PLATFORM_LABELS[platform],
      accountCount: platformAccounts.length,
      salesThisMonth: platformSalesThisMonth.length,
      totalRevenueThisMonth: platformSalesThisMonth.reduce(
        (sum, s) => sum + (s.amount ?? 0),
        0
      ),
    };
  });

  const totalAccounts = accounts.length;
  const totalSalesThisMonth = salesThisMonth.length;
  const totalRevenueThisMonth = salesThisMonth.reduce(
    (sum, s) => sum + (s.amount ?? 0),
    0
  );
  const unmatchedCount = sales.filter((s) => !s.matchedItemId || s.matchedItemId === "").length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Reseller accounts
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Manage marketplace accounts and monitor sales
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5">
          <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-500">
            Accounts
          </p>
          <p className="mt-1.5 text-2xl font-semibold text-zinc-50">
            {totalAccounts}
          </p>
          <p className="mt-0.5 text-xs text-zinc-600">across all platforms</p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5">
          <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-500">
            Sales this month
          </p>
          <p className="mt-1.5 text-2xl font-semibold text-zinc-50">
            {totalSalesThisMonth}
          </p>
          <p className="mt-0.5 text-xs text-zinc-600">platform sales</p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5">
          <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-500">
            Revenue this month
          </p>
          <p className="mt-1.5 text-2xl font-semibold text-emerald-400">
            ${totalRevenueThisMonth.toLocaleString()}
          </p>
          <p className="mt-0.5 text-xs text-zinc-600">from platform sales</p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5">
          <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-500">
            Unmatched sales
          </p>
          <p className="mt-1.5 text-2xl font-semibold text-amber-400">
            {unmatchedCount}
          </p>
          <Link
            href="/admin/accounts/supply"
            className="mt-0.5 block text-xs text-zinc-600 hover:text-accent"
          >
            Cross-check supply →
          </Link>
        </div>
      </div>

      {/* Per-platform cards */}
      <div>
        <h2 className="mb-4 text-[11px] font-medium uppercase tracking-[0.25em] text-zinc-500">
          By platform
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {byPlatform.map(({ platform, label, accountCount, salesThisMonth, totalRevenueThisMonth }) => (
            <Link
              key={platform}
              href="/admin/accounts/accounts"
              className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5 transition-colors hover:border-zinc-700 hover:bg-zinc-900/50"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium capitalize text-zinc-200">
                  {label}
                </span>
                <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] uppercase tracking-wider text-zinc-500">
                  {platform}
                </span>
              </div>
              <p className="mt-3 text-2xl font-semibold text-zinc-50">
                {accountCount} {accountCount === 1 ? "account" : "accounts"}
              </p>
              <p className="mt-1 text-xs text-zinc-600">
                {salesThisMonth} sales this month
                {totalRevenueThisMonth > 0 &&
                  ` · $${totalRevenueThisMonth.toLocaleString()} revenue`}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin/accounts/accounts"
          className="rounded-full bg-accent px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-accent-foreground transition-opacity hover:opacity-90"
        >
          Manage accounts
        </Link>
        <Link
          href="/admin/accounts/sales"
          className="rounded-full border border-zinc-700 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-zinc-400 transition-colors hover:border-zinc-600 hover:text-zinc-200"
        >
          Sales monitor
        </Link>
        <Link
          href="/admin/accounts/supply"
          className="rounded-full border border-zinc-700 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-zinc-400 transition-colors hover:border-zinc-600 hover:text-zinc-200"
        >
          Supply cross-check
        </Link>
      </div>
    </div>
  );
}
