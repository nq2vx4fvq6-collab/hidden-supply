import Link from "next/link";
import { getAllItems } from "@/lib/inventoryService";

export default async function SalesPage() {
  const allItems = await getAllItems();

  const soldItems = allItems
    .filter((i) => i.status === "sold")
    .sort((a, b) =>
      (b.soldDate ?? b.updatedAt ?? "").localeCompare(
        a.soldDate ?? a.updatedAt ?? ""
      )
    );

  const totalRevenue = soldItems.reduce(
    (s, i) => s + (i.salePrice ?? i.listPrice ?? 0),
    0
  );
  const totalCost = soldItems.reduce((s, i) => s + (i.cost ?? 0), 0);
  const totalProfit = totalRevenue - totalCost;
  const avgMargin =
    totalRevenue > 0
      ? Math.round((totalProfit / totalRevenue) * 100)
      : 0;

  const summaryCards = [
    {
      label: "Total Revenue",
      value: `$${totalRevenue.toLocaleString()}`,
      color: "text-zinc-50",
    },
    {
      label: "Total Cost",
      value: `$${totalCost.toLocaleString()}`,
      color: "text-zinc-400",
    },
    {
      label: "Net Profit",
      value: `$${totalProfit.toLocaleString()}`,
      color: totalProfit >= 0 ? "text-emerald-400" : "text-red-400",
    },
    {
      label: "Avg Margin",
      value: `${avgMargin}%`,
      color:
        avgMargin >= 40
          ? "text-emerald-400"
          : avgMargin >= 20
            ? "text-amber-400"
            : "text-red-400",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Sales</h1>
          <p className="mt-1 text-sm text-zinc-500">
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

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-4"
          >
            <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-500">
              {card.label}
            </p>
            <p className={`mt-1.5 text-xl font-semibold ${card.color}`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Sales table */}
      <div className="overflow-x-auto rounded-2xl border border-zinc-800">
        <table className="w-full whitespace-nowrap text-sm">
          <thead className="border-b border-zinc-800 bg-zinc-900/50">
            <tr>
              {[
                "Date Sold",
                "Brand",
                "Name",
                "SKU",
                "Size",
                "Cost",
                "Sale Price",
                "Profit",
                "Margin",
                "Buyer",
              ].map((h) => (
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
            {soldItems.length === 0 && (
              <tr>
                <td
                  colSpan={10}
                  className="px-4 py-16 text-center text-sm text-zinc-600"
                >
                  No sales yet. Mark items as sold from the{" "}
                  <Link href="/admin/items" className="underline">
                    Inventory
                  </Link>{" "}
                  page.
                </td>
              </tr>
            )}
            {soldItems.map((item, i) => {
              const revenue = item.salePrice ?? item.listPrice ?? 0;
              const cost = item.cost ?? 0;
              const profit = revenue - cost;
              const margin =
                revenue > 0 ? Math.round((profit / revenue) * 100) : null;

              const profitColor =
                profit > 0
                  ? "text-emerald-400"
                  : profit < 0
                    ? "text-red-400"
                    : "text-zinc-500";

              const marginColor =
                margin === null
                  ? "text-zinc-600"
                  : margin >= 40
                    ? "text-emerald-400"
                    : margin >= 20
                      ? "text-amber-400"
                      : "text-red-400";

              return (
                <tr
                  key={item.id}
                  className={`transition-colors hover:bg-zinc-900/30 ${i < soldItems.length - 1 ? "border-b border-zinc-900" : ""}`}
                >
                  <td className="px-4 py-3 text-xs text-zinc-500">
                    {item.soldDate ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-400">
                    {item.brand}
                  </td>
                  <td className="max-w-[180px] truncate px-4 py-3 text-xs text-zinc-200">
                    {item.name}
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-zinc-600">
                    {item.sku}
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-500">
                    {item.size}
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-400">
                    {cost > 0 ? `$${cost.toLocaleString()}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-xs font-medium text-zinc-100">
                    {revenue > 0 ? `$${revenue.toLocaleString()}` : "—"}
                  </td>
                  <td className={`px-4 py-3 text-xs font-semibold ${profitColor}`}>
                    {revenue > 0
                      ? `${profit >= 0 ? "+" : ""}$${profit.toLocaleString()}`
                      : "—"}
                  </td>
                  <td className={`px-4 py-3 text-xs font-medium ${marginColor}`}>
                    {margin !== null ? `${margin}%` : "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-500">
                    {item.soldTo ?? "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Per-brand breakdown */}
      {soldItems.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.25em] text-zinc-500">
            By Brand
          </h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(
              soldItems.reduce<
                Record<string, { revenue: number; profit: number; count: number }>
              >((acc, item) => {
                const rev = item.salePrice ?? item.listPrice ?? 0;
                const pft = rev - (item.cost ?? 0);
                if (!acc[item.brand])
                  acc[item.brand] = { revenue: 0, profit: 0, count: 0 };
                acc[item.brand].revenue += rev;
                acc[item.brand].profit += pft;
                acc[item.brand].count += 1;
                return acc;
              }, {})
            )
              .sort(([, a], [, b]) => b.revenue - a.revenue)
              .map(([brand, data]) => (
                <div
                  key={brand}
                  className="flex items-center justify-between rounded-xl border border-zinc-800/60 bg-zinc-900/20 px-4 py-3"
                >
                  <div>
                    <p className="text-xs font-medium text-zinc-200">{brand}</p>
                    <p className="text-[10px] text-zinc-600">
                      {data.count} {data.count === 1 ? "item" : "items"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-zinc-100">
                      ${data.revenue.toLocaleString()}
                    </p>
                    <p
                      className={`text-[10px] font-medium ${data.profit >= 0 ? "text-emerald-400" : "text-red-400"}`}
                    >
                      {data.profit >= 0 ? "+" : ""}${data.profit.toLocaleString()} profit
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
