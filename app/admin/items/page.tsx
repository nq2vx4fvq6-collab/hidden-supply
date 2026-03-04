import { Suspense } from "react";
import Link from "next/link";
import { getAllItems } from "@/lib/inventoryService";
import type { InventoryStatus } from "@/lib/models";
import DeleteButton from "@/components/DeleteButton";
import QuickStatusSelect from "@/components/QuickStatusSelect";
import MarkSoldButton from "@/components/MarkSoldButton";
import AdminFilters from "@/components/AdminFilters";

const VALID_STATUSES: InventoryStatus[] = [
  "available",
  "reserved",
  "sold",
  "consigned",
  "in_transit",
  "archived",
];

interface AdminItemsPageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function AdminItemsPage({
  searchParams,
}: AdminItemsPageProps) {
  const params = await searchParams;
  const search = params.search || undefined;
  const rawStatus = params.status ?? "";
  const status = VALID_STATUSES.includes(rawStatus as InventoryStatus)
    ? (rawStatus as InventoryStatus)
    : undefined;

  const items = await getAllItems({ search, status });

  const TABLE_HEADERS = [
    "SKU",
    "Brand",
    "Name",
    "Category",
    "Size",
    "Condition",
    "Colorway",
    "Status",
    "Cost",
    "List",
    "Sale",
    "Sold Date",
    "Margin",
    "Actions",
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Inventory</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {items.length} {items.length === 1 ? "item" : "items"}
            {search || status ? " matched" : " total"}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/import-export"
            className="rounded-full border border-zinc-700 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-200"
          >
            Import / Export
          </Link>
          <Link
            href="/admin/items/new"
            className="rounded-full bg-zinc-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-black transition-colors hover:bg-white"
          >
            + Add Item
          </Link>
        </div>
      </div>

      {/* Search + Status filters */}
      <Suspense
        fallback={
          <div className="h-9 animate-pulse rounded-full bg-zinc-900/60" />
        }
      >
        <AdminFilters />
      </Suspense>

      <div className="overflow-x-auto rounded-2xl border border-zinc-800">
        <table className="w-full whitespace-nowrap text-sm">
          <thead className="border-b border-zinc-800 bg-zinc-900/50">
            <tr>
              {TABLE_HEADERS.map((h) => (
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
            {items.length === 0 && (
              <tr>
                <td
                  colSpan={TABLE_HEADERS.length}
                  className="px-4 py-12 text-center text-sm text-zinc-600"
                >
                  {search || status ? (
                    <>
                      No items match your filters.{" "}
                      <Link href="/admin/items" className="underline">
                        Clear filters
                      </Link>
                    </>
                  ) : (
                    <>
                      No items yet.{" "}
                      <Link href="/admin/items/new" className="underline">
                        Add your first item
                      </Link>{" "}
                      or{" "}
                      <Link href="/admin/import-export" className="underline">
                        import from Excel
                      </Link>
                      .
                    </>
                  )}
                </td>
              </tr>
            )}
            {items.map((item, i) => {
              const margin =
                item.cost && item.listPrice
                  ? Math.round(
                      ((item.listPrice - item.cost) / item.listPrice) * 100
                    )
                  : null;
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
                  className={`transition-colors hover:bg-zinc-900/30 ${i < items.length - 1 ? "border-b border-zinc-900" : ""}`}
                >
                  <td className="px-4 py-3 font-mono text-[11px] text-zinc-500">
                    {item.sku}
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-400">
                    {item.brand}
                  </td>
                  <td className="max-w-[180px] truncate px-4 py-3 text-xs text-zinc-200">
                    {item.name}
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-500">
                    {item.category}
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-400">
                    {item.size}
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-400">
                    {item.condition}
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-500">
                    {item.colorway || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <QuickStatusSelect id={item.id} status={item.status} />
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-400">
                    {item.cost ? `$${item.cost.toLocaleString()}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-xs font-medium text-zinc-200">
                    {item.listPrice
                      ? `$${item.listPrice.toLocaleString()}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-400">
                    {item.salePrice
                      ? `$${item.salePrice.toLocaleString()}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-500">
                    {item.soldDate ?? "—"}
                  </td>
                  <td className={`px-4 py-3 text-xs font-medium ${marginColor}`}>
                    {margin !== null ? `${margin}%` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/items/${item.id}/edit`}
                        className="text-xs text-zinc-400 transition-colors hover:text-zinc-100"
                      >
                        Edit
                      </Link>
                      <MarkSoldButton
                        id={item.id}
                        status={item.status}
                        listPrice={item.listPrice}
                      />
                      <DeleteButton id={item.id} />
                    </div>
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
