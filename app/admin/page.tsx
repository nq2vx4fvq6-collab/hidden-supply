import Link from "next/link";
import { getStats, getAllItems } from "@/lib/inventoryService";
import StatusBadge from "@/components/StatusBadge";

export default async function AdminDashboard() {
  const [stats, items] = await Promise.all([getStats(), getAllItems()]);

  const realizedProfit = stats.soldRevenue - stats.soldCost;

  const statCards = [
    {
      label: "Total Items",
      value: stats.total,
      sub: "in inventory",
      color: "text-zinc-50",
    },
    {
      label: "Available",
      value: stats.available,
      sub: "ready to sell",
      color: "text-emerald-400",
    },
    {
      label: "Reserved",
      value: stats.reserved,
      sub: "held for clients",
      color: "text-amber-400",
    },
    {
      label: "Sold",
      value: stats.sold,
      sub: "units moved",
      color: "text-zinc-400",
    },
    {
      label: "Active Inventory Value",
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

  return (
    <div className="space-y-10">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-zinc-500">Urban Supply — business overview</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/items/new"
            className="rounded-full bg-zinc-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-black transition-colors hover:bg-white"
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

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card) => (
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

      {/* Additional stats row */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Consigned", value: stats.consigned },
          { label: "In Transit", value: stats.inTransit },
          {
            label: "Total Cost Basis",
            value: `$${stats.totalCostBasis.toLocaleString()}`,
          },
          {
            label: "Sold Revenue",
            value: `$${stats.soldRevenue.toLocaleString()}`,
          },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-zinc-800/60 bg-zinc-900/20 p-4"
          >
            <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-600">
              {s.label}
            </p>
            <p className="mt-1 text-lg font-semibold text-zinc-300">
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Recent Items */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-medium uppercase tracking-[0.25em] text-zinc-500">
            Recent Items
          </h2>
          <Link
            href="/admin/items"
            className="text-xs text-zinc-600 transition-colors hover:text-zinc-400"
          >
            View all →
          </Link>
        </div>
        <div className="overflow-hidden rounded-2xl border border-zinc-800">
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-800 bg-zinc-900/50">
              <tr>
                {["SKU", "Brand", "Name", "Size", "Status", "List Price"].map(
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
              {recentItems.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
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
                  <td className="px-4 py-3 text-xs text-zinc-200">
                    {item.name}
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-400">
                    {item.size}
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
