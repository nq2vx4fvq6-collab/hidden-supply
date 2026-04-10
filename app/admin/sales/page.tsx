import Link from "next/link";
import { getAllItems } from "@/lib/services/inventory";

export const dynamic = "force-dynamic";

export default async function SalesPage() {
  const allItems = await getAllItems();

  const soldItems = allItems
    .filter((i) => i.status === "sold")
    .sort((a, b) =>
      (b.soldDate ?? b.updatedAt ?? "").localeCompare(
        a.soldDate ?? a.updatedAt ?? ""
      )
    );

  const totalRevenue = soldItems.reduce((s, i) => s + (i.salePrice ?? i.listPrice ?? 0), 0);
  const totalCost = soldItems.reduce((s, i) => s + (i.cost ?? 0), 0);
  const totalProfit = totalRevenue - totalCost;
  const avgMargin = totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0;

  const summaryCards = [
    { label: "Revenue",    value: `$${totalRevenue.toLocaleString()}`, color: "text-zinc-50"   },
    { label: "Cost",       value: `$${totalCost.toLocaleString()}`,    color: "text-zinc-400"  },
    { label: "Net Profit", value: `$${totalProfit.toLocaleString()}`,  color: totalProfit >= 0 ? "text-emerald-400" : "text-red-400" },
    { label: "Avg Margin", value: `${avgMargin}%`,                     color: avgMargin >= 40 ? "text-emerald-400" : avgMargin >= 20 ? "text-amber-400" : "text-red-400" },
  ];

  return (
    <div className="page-enter space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight md:text-2xl">Sales</h1>
          <p className="mt-0.5 text-sm text-zinc-500">
            {soldItems.length} {soldItems.length === 1 ? "item" : "items"} sold
          </p>
        </div>
        <Link
          href="/admin/items"
          className="text-xs text-zinc-600 transition-colors hover:text-zinc-400"
        >
          ← Inventory
        </Link>
      </div>

      {/* Summary cards — 2 col on mobile, 4 on sm+ */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="border border-white/[0.06] bg-white/[0.02] p-4"
          >
            <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-500">{card.label}</p>
            <p className={`mt-1.5 text-xl font-semibold tabular-nums ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {soldItems.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center border border-white/[0.06] bg-white/[0.03]">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2} className="text-zinc-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
            </svg>
          </div>
          <p className="text-sm text-zinc-500">
            No sales yet. Mark items as sold from the{" "}
            <Link href="/admin/items" className="text-[#86C15A] underline underline-offset-2">
              Inventory
            </Link>{" "}
            page.
          </p>
        </div>
      ) : (
        <>
          {/* ── MOBILE CARD LIST ──────────────────────────────────────────── */}
          <div className="space-y-2 md:hidden">
            {soldItems.map((item) => {
              const revenue = item.salePrice ?? item.listPrice ?? 0;
              const cost = item.cost ?? 0;
              const profit = revenue - cost;
              const margin = revenue > 0 ? Math.round((profit / revenue) * 100) : null;
              const profitColor = profit > 0 ? "text-emerald-400" : profit < 0 ? "text-red-400" : "text-zinc-500";
              const marginColor =
                margin === null ? "text-zinc-600"
                  : margin >= 40 ? "text-emerald-400"
                  : margin >= 20 ? "text-amber-400"
                  : "text-red-400";

              return (
                <div
                  key={item.id}
                  className="border border-white/[0.06] bg-white/[0.02] p-4 space-y-3"
                >
                  {/* Name + date */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-zinc-100">{item.name}</p>
                      <p className="text-[11px] text-zinc-500">{item.brand}{item.size ? ` · ${item.size}` : ""}</p>
                    </div>
                    <p className="flex-shrink-0 text-[11px] text-zinc-600">{item.soldDate ?? "—"}</p>
                  </div>

                  {/* Price breakdown */}
                  <div className="flex items-center gap-5">
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.2em] text-zinc-700">Revenue</p>
                      <p className="text-sm font-semibold text-zinc-100">
                        {revenue > 0 ? `$${revenue.toLocaleString()}` : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.2em] text-zinc-700">Cost</p>
                      <p className="text-sm text-zinc-400">
                        {cost > 0 ? `$${cost.toLocaleString()}` : "—"}
                      </p>
                    </div>
                    {revenue > 0 && (
                      <div>
                        <p className="text-[9px] uppercase tracking-[0.2em] text-zinc-700">Profit</p>
                        <p className={`text-sm font-semibold ${profitColor}`}>
                          {profit >= 0 ? "+" : ""}${profit.toLocaleString()}
                        </p>
                      </div>
                    )}
                    {margin !== null && (
                      <div>
                        <p className="text-[9px] uppercase tracking-[0.2em] text-zinc-700">Margin</p>
                        <p className={`text-sm font-medium ${marginColor}`}>{margin}%</p>
                      </div>
                    )}
                  </div>

                  {/* SKU + buyer */}
                  <div className="flex items-center gap-3 border-t border-white/[0.04] pt-2">
                    <span className="font-mono text-[10px] text-zinc-600">{item.sku}</span>
                    {item.soldTo && (
                      <span className="text-[11px] text-zinc-600">→ {item.soldTo}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── DESKTOP TABLE ────────────────────────────────────────────── */}
          <div className="hidden overflow-x-auto border border-white/[0.06] md:block">
            <table className="w-full whitespace-nowrap text-sm">
              <thead className="border-b border-white/[0.06] bg-white/[0.02]">
                <tr>
                  {["Date Sold", "Brand", "Name", "SKU", "Size", "Cost", "Sale Price", "Profit", "Margin", "Buyer"].map((h) => (
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
                {soldItems.map((item, i) => {
                  const revenue = item.salePrice ?? item.listPrice ?? 0;
                  const cost = item.cost ?? 0;
                  const profit = revenue - cost;
                  const margin = revenue > 0 ? Math.round((profit / revenue) * 100) : null;
                  const profitColor = profit > 0 ? "text-emerald-400" : profit < 0 ? "text-red-400" : "text-zinc-500";
                  const marginColor =
                    margin === null ? "text-zinc-600"
                      : margin >= 40 ? "text-emerald-400"
                      : margin >= 20 ? "text-amber-400"
                      : "text-red-400";

                  return (
                    <tr
                      key={item.id}
                      className={`transition-colors hover:bg-white/[0.03] ${i < soldItems.length - 1 ? "border-b border-white/[0.04]" : ""}`}
                    >
                      <td className="px-4 py-3 text-xs text-zinc-500">{item.soldDate ?? "—"}</td>
                      <td className="px-4 py-3 text-xs text-zinc-400">{item.brand}</td>
                      <td className="max-w-[180px] truncate px-4 py-3 text-xs text-zinc-200">{item.name}</td>
                      <td className="px-4 py-3 font-mono text-[11px] text-zinc-600">{item.sku}</td>
                      <td className="px-4 py-3 text-xs text-zinc-500">{item.size}</td>
                      <td className="px-4 py-3 text-xs text-zinc-400">{cost > 0 ? `$${cost.toLocaleString()}` : "—"}</td>
                      <td className="px-4 py-3 text-xs font-medium text-zinc-100">{revenue > 0 ? `$${revenue.toLocaleString()}` : "—"}</td>
                      <td className={`px-4 py-3 text-xs font-semibold ${profitColor}`}>
                        {revenue > 0 ? `${profit >= 0 ? "+" : ""}$${profit.toLocaleString()}` : "—"}
                      </td>
                      <td className={`px-4 py-3 text-xs font-medium ${marginColor}`}>
                        {margin !== null ? `${margin}%` : "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-500">{item.soldTo ?? "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Per-brand breakdown */}
          <div className="space-y-3">
            <h2 className="text-[11px] font-medium uppercase tracking-[0.25em] text-zinc-500">
              By Brand
            </h2>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(
                soldItems.reduce<Record<string, { revenue: number; profit: number; count: number }>>(
                  (acc, item) => {
                    const rev = item.salePrice ?? item.listPrice ?? 0;
                    const pft = rev - (item.cost ?? 0);
                    if (!acc[item.brand]) acc[item.brand] = { revenue: 0, profit: 0, count: 0 };
                    acc[item.brand].revenue += rev;
                    acc[item.brand].profit += pft;
                    acc[item.brand].count += 1;
                    return acc;
                  },
                  {}
                )
              )
                .sort(([, a], [, b]) => b.revenue - a.revenue)
                .map(([brand, data]) => (
                  <div
                    key={brand}
                    className="flex items-center justify-between border border-white/[0.06] bg-white/[0.02] px-4 py-3"
                  >
                    <div>
                      <p className="text-xs font-medium text-zinc-200">{brand}</p>
                      <p className="text-[10px] text-zinc-600">
                        {data.count} {data.count === 1 ? "item" : "items"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-zinc-100">${data.revenue.toLocaleString()}</p>
                      <p className={`text-[10px] font-medium ${data.profit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {data.profit >= 0 ? "+" : ""}${data.profit.toLocaleString()} profit
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
