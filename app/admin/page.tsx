import Link from "next/link";
import { getStats, getAllItems } from "@/lib/inventoryService";
import StatusBadge from "@/components/StatusBadge";
import AdminDashboardCharts from "@/components/AdminDashboardCharts";
import AdminExpandableStats from "@/components/AdminExpandableStats";
import type { MonthlyData, BrandData, StatusData } from "@/components/SalesCharts";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [stats, items] = await Promise.all([getStats(), getAllItems()]);
  const realizedProfit = stats.soldRevenue - stats.soldCost;

  const primaryStats = [
    { label: "Total Items", value: stats.total, sub: "in inventory", color: "text-zinc-50" },
    { label: "Available", value: stats.available, sub: "ready to sell", color: "text-emerald-400" },
    { label: "Sold", value: stats.sold, sub: "units moved", color: "text-zinc-400" },
    {
      label: "Active Value",
      value: `$${stats.activeListValue.toLocaleString()}`,
      sub: "at list price",
      color: "text-zinc-50",
    },
    {
      label: "Realized Profit",
      value: `$${realizedProfit.toLocaleString()}`,
      sub: "from sold items",
      color: realizedProfit >= 0 ? "text-emerald-400" : "text-red-400",
    },
  ];

  const recentItems = [...items]
    .sort(
      (a, b) =>
        new Date(b.createdAt ?? 0).getTime() -
        new Date(a.createdAt ?? 0).getTime()
    )
    .slice(0, 6);

  // Chart data
  const soldItems = items.filter((i) => i.status === "sold");
  const monthMap = new Map<string, MonthlyData>();
  for (const item of soldItems) {
    if (!item.soldDate) continue;
    const d = new Date(item.soldDate);
    const key = `${d.toLocaleString("default", { month: "short" })} ${String(d.getFullYear()).slice(2)}`;
    const prev = monthMap.get(key) ?? { month: key, revenue: 0, cost: 0, profit: 0, units: 0 };
    const revenue = item.salePrice ?? 0;
    const cost = item.cost ?? 0;
    monthMap.set(key, {
      ...prev,
      revenue: prev.revenue + revenue,
      cost: prev.cost + cost,
      profit: prev.profit + (revenue - cost),
      units: prev.units + 1,
    });
  }
  const parseMonthKey = (s: string) => new Date(`${s.slice(0, 3)} 20${s.slice(-2)}`);
  const monthly: MonthlyData[] = Array.from(monthMap.values()).sort(
    (a, b) => parseMonthKey(a.month).getTime() - parseMonthKey(b.month).getTime()
  );

  const brandMap = new Map<string, BrandData>();
  for (const item of soldItems) {
    const brand = item.brand ?? "Unknown";
    const prev = brandMap.get(brand) ?? { brand, revenue: 0, profit: 0, units: 0 };
    const revenue = item.salePrice ?? 0;
    const cost = item.cost ?? 0;
    brandMap.set(brand, {
      ...prev,
      revenue: prev.revenue + revenue,
      profit: prev.profit + (revenue - cost),
      units: prev.units + 1,
    });
  }
  const brands: BrandData[] = Array.from(brandMap.values()).sort(
    (a, b) => b.revenue - a.revenue
  );

  const statusBreakdown: StatusData[] = [
    { name: "Available", value: stats.available, color: "#34d399" },
    { name: "Reserved", value: stats.reserved, color: "#fbbf24" },
    { name: "Sold", value: stats.sold, color: "#71717a" },
    { name: "Consigned", value: stats.consigned, color: "#60a5fa" },
    { name: "In Transit", value: stats.inTransit, color: "#a78bfa" },
  ];

  return (
    <div className="page-enter space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-zinc-500">Urban Supply — business overview</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/items/new"
            className="rounded-full bg-accent px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-accent-foreground transition-all duration-200 hover:opacity-90 active:scale-[0.97]"
          >
            + Add Item
          </Link>
          <Link
            href="/admin/import-export"
            className="rounded-full border border-zinc-700 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-200"
          >
            Import / Export
          </Link>
        </div>
      </div>

      {/* Primary stat row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {primaryStats.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5"
          >
            <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-500">
              {card.label}
            </p>
            <p className={`mt-1.5 text-2xl font-semibold ${card.color}`}>
              {card.value}
            </p>
            <p className="mt-0.5 text-xs text-zinc-600">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Expandable secondary stats */}
      <AdminExpandableStats
        stats={[
          { label: "Reserved", value: stats.reserved },
          { label: "Consigned", value: stats.consigned },
          { label: "In Transit", value: stats.inTransit },
          { label: "Total Cost Basis", value: `$${stats.totalCostBasis.toLocaleString()}` },
          { label: "Sold Revenue", value: `$${stats.soldRevenue.toLocaleString()}` },
        ]}
      />

      {/* Collapsible Analytics */}
      <AdminDashboardCharts
        monthly={monthly}
        brands={brands}
        statusBreakdown={statusBreakdown}
      />

      {/* Recent Items — 5 columns */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.25em] text-zinc-500">
            Recent Items
          </h2>
          <Link
            href="/admin/items"
            className="rounded-full border border-zinc-700 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-400 transition-colors hover:border-zinc-600 hover:text-zinc-200"
          >
            View all
          </Link>
        </div>
        <div className="overflow-hidden rounded-2xl border border-zinc-800">
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-800 bg-zinc-900/50">
              <tr>
                {["SKU", "Brand", "Name", "Status", "List Price"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-[10px] font-normal uppercase tracking-[0.25em] text-zinc-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentItems.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-sm text-zinc-600"
                  >
                    No items yet.{" "}
                    <Link href="/admin/items/new" className="underline">
                      Add one
                    </Link>{" "}
                    or{" "}
                    <Link href="/admin/import-export" className="underline">
                      import from Excel
                    </Link>
                    .
                  </td>
                </tr>
              )}
              {recentItems.map((item, i) => (
                <tr
                  key={item.id}
                  className={`transition-colors hover:bg-zinc-900/40 ${i < recentItems.length - 1 ? "border-b border-zinc-900" : ""}`}
                >
                  <td className="px-4 py-3 font-mono text-[11px] text-zinc-500">
                    {item.sku}
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-400">
                    {item.brand}
                  </td>
                  <td className="max-w-[200px] truncate px-4 py-3 text-xs text-zinc-200">
                    {item.name}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-200">
                    {item.listPrice
                      ? `$${item.listPrice.toLocaleString()}`
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
