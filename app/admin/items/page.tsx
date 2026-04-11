export const dynamic = "force-dynamic";

import { Suspense } from "react";
import Link from "next/link";
import { getAllItems } from "@/lib/services/inventory";
import type { InventoryStatus } from "@/lib/types/inventory";
import DeleteButton from "@/components/admin/DeleteButton";
import QuickStatusSelect from "@/components/admin/QuickStatusSelect";
import MarkSoldButton from "@/components/admin/MarkSoldButton";
import AdminFilters from "@/components/admin/AdminFilters";
import { bulkUpdateStatusAction } from "@/app/actions/items";
import PurgeImagesButton from "@/components/admin/PurgeImagesButton";
import StatusBadge from "@/components/ui/StatusBadge";

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
    "Select",
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
    <div className="page-enter space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight md:text-2xl">Inventory</h1>
          <p className="mt-0.5 text-sm text-zinc-500">
            {items.length} {items.length === 1 ? "item" : "items"}
            {search || status ? " matched" : " total"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="hidden md:flex md:items-center md:gap-2">
            <PurgeImagesButton />
            <Link
              href="/admin/import-export"
              className="border border-white/10 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400 transition-all hover:border-white/20 hover:text-zinc-200"
            >
              Import / Export
            </Link>
          </div>
          <Link
            href="/admin/items/new"
            className="btn-press bg-[#86C15A] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#050608] transition-opacity hover:opacity-85"
          >
            + Add
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Suspense fallback={<div className="h-10 animate-pulse bg-white/[0.04]" />}>
        <AdminFilters />
      </Suspense>

      {/* ── MOBILE CARD LIST ─────────────────────────────────────────────── */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center border border-white/[0.06] bg-white/[0.03]">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2} className="text-zinc-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-zinc-500">
              {search || status ? "No items match your filters." : "No items yet."}
            </p>
            {!search && !status && (
              <div className="mt-3 flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
                <Link href="/admin/items/new" className="text-sm text-[#86C15A] underline underline-offset-2">
                  Add your first item
                </Link>
                <span className="hidden text-zinc-700 sm:inline">or</span>
                <Link href="/admin/import-export" className="text-sm text-[#86C15A] underline underline-offset-2">
                  import from Excel
                </Link>
              </div>
            )}
            {(search || status) && (
              <Link href="/admin/items" className="mt-2 inline-block text-sm text-[#86C15A] underline underline-offset-2">
                Clear filters
              </Link>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="md:hidden">
            <form action={bulkUpdateStatusAction} className="space-y-3">
              {/* Bulk action bar */}
              <div className="flex items-center gap-2 border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-600">Bulk update →</span>
                <select
                  name="status"
                  required
                  className="flex-1 border border-white/[0.06] bg-[#0a0a0b] px-2 py-1.5 text-xs text-zinc-200 outline-none"
                >
                  {VALID_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1).replace("_", " ")}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="bg-[#86C15A] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#050608]"
                >
                  Apply
                </button>
              </div>

              {/* Card list */}
              <div className="space-y-2">
                {items.map((item) => {
                  const margin =
                    item.cost && item.listPrice
                      ? Math.round(((item.listPrice - item.cost) / item.listPrice) * 100)
                      : null;
                  const marginColor =
                    margin === null ? "text-zinc-600"
                      : margin >= 40 ? "text-emerald-400"
                      : margin >= 20 ? "text-amber-400"
                      : "text-red-400";

                  return (
                    <div
                      key={item.id}
                      className="border border-white/[0.06] bg-white/[0.02] p-4 transition-colors active:bg-white/[0.04]"
                    >
                      <div className="flex items-start gap-3">
                        {/* Checkbox */}
                        <input
                          type="checkbox"
                          name="ids"
                          value={item.id}
                          className="mt-0.5 h-5 w-5 flex-shrink-0 border-white/20 bg-white/[0.04] text-[#86C15A]"
                        />

                        {/* Content */}
                        <div className="flex-1 min-w-0 space-y-2">
                          {/* Name + Status */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-zinc-100">{item.name}</p>
                              <p className="text-[11px] text-zinc-500">{item.brand}</p>
                            </div>
                            <div className="flex-shrink-0">
                              <QuickStatusSelect id={item.id} status={item.status} />
                            </div>
                          </div>

                          {/* Metadata row */}
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                            <span className="font-mono text-[11px] text-zinc-600">{item.sku}</span>
                            {item.size && <span className="text-[11px] text-zinc-500">{item.size}</span>}
                            {item.condition && <span className="text-[11px] text-zinc-600">{item.condition}</span>}
                          </div>

                          {/* Price row */}
                          <div className="flex items-center gap-4">
                            {item.cost && (
                              <div>
                                <p className="text-[9px] uppercase tracking-[0.2em] text-zinc-700">Cost</p>
                                <p className="text-xs text-zinc-400">${item.cost.toLocaleString()}</p>
                              </div>
                            )}
                            {item.listPrice && (
                              <div>
                                <p className="text-[9px] uppercase tracking-[0.2em] text-zinc-700">List</p>
                                <p className="text-xs text-zinc-200">${item.listPrice.toLocaleString()}</p>
                              </div>
                            )}
                            {margin !== null && (
                              <div>
                                <p className="text-[9px] uppercase tracking-[0.2em] text-zinc-700">Margin</p>
                                <p className={`text-xs font-medium ${marginColor}`}>{margin}%</p>
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-4 pt-1">
                            <Link
                              href={`/admin/items/${item.id}/edit`}
                              className="min-h-[36px] flex items-center text-xs font-medium text-[#86C15A]"
                            >
                              Edit
                            </Link>
                            <MarkSoldButton id={item.id} status={item.status} listPrice={item.listPrice} />
                            <DeleteButton id={item.id} />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </form>
          </div>

          {/* ── DESKTOP TABLE ────────────────────────────────────────────────── */}
          <div className="hidden md:block">
            <form action={bulkUpdateStatusAction} className="space-y-3">
              <div className="flex flex-wrap items-center gap-3 border border-white/[0.06] bg-white/[0.02] px-4 py-2">
                <span className="text-[10px] uppercase tracking-[0.25em] text-zinc-500">
                  Update selected to
                </span>
                <select
                  name="status"
                  required
                  className="border border-white/[0.06] bg-[#0a0a0b] px-3 py-1.5 text-xs text-zinc-200 outline-none focus:border-zinc-600"
                >
                  {VALID_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1).replace("_", " ")}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="btn-press bg-[#86C15A] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#050608]"
                >
                  Apply
                </button>
              </div>

              <div className="overflow-x-auto border border-white/[0.06]">
                <table className="w-full whitespace-nowrap text-sm">
                  <thead className="border-b border-white/[0.06] bg-white/[0.02]">
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
                    {items.map((item, i) => {
                      const margin =
                        item.cost && item.listPrice
                          ? Math.round(((item.listPrice - item.cost) / item.listPrice) * 100)
                          : null;
                      const marginColor =
                        margin === null ? "text-zinc-600"
                          : margin >= 40 ? "text-emerald-400"
                          : margin >= 20 ? "text-amber-400"
                          : "text-red-400";

                      return (
                        <tr
                          key={item.id}
                          className={`transition-colors duration-150 hover:bg-white/[0.03] ${i < items.length - 1 ? "border-b border-white/[0.04]" : ""}`}
                        >
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              name="ids"
                              value={item.id}
                              className="h-4 w-4 border-zinc-700 bg-zinc-900 text-zinc-100 focus:ring-zinc-500"
                            />
                          </td>
                          <td className="px-4 py-3 font-mono text-[11px] text-zinc-500">{item.sku}</td>
                          <td className="px-4 py-3 text-xs text-zinc-400">{item.brand}</td>
                          <td className="max-w-[180px] truncate px-4 py-3 text-xs text-zinc-200">{item.name}</td>
                          <td className="px-4 py-3 text-xs text-zinc-500">{item.category}</td>
                          <td className="px-4 py-3 text-xs text-zinc-400">{item.size}</td>
                          <td className="px-4 py-3 text-xs text-zinc-400">{item.condition}</td>
                          <td className="px-4 py-3 text-xs text-zinc-500">{item.colorway || "—"}</td>
                          <td className="px-4 py-3">
                            <QuickStatusSelect id={item.id} status={item.status} />
                          </td>
                          <td className="px-4 py-3 text-xs text-zinc-400">
                            {item.cost ? `$${item.cost.toLocaleString()}` : "—"}
                          </td>
                          <td className="px-4 py-3 text-xs font-medium text-zinc-200">
                            {item.listPrice ? `$${item.listPrice.toLocaleString()}` : "—"}
                          </td>
                          <td className="px-4 py-3 text-xs text-zinc-400">
                            {item.salePrice ? `$${item.salePrice.toLocaleString()}` : "—"}
                          </td>
                          <td className="px-4 py-3 text-xs text-zinc-500">{item.soldDate ?? "—"}</td>
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
                              <MarkSoldButton id={item.id} status={item.status} listPrice={item.listPrice} />
                              <DeleteButton id={item.id} />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Floating Action Button — mobile only */}
      <Link
        href="/admin/items/new"
        className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center bg-[#86C15A] text-[#050608] shadow-lg shadow-black/40 transition-transform active:scale-95 md:hidden"
        style={{ bottom: "calc(env(safe-area-inset-bottom) + 5rem)" }}
        aria-label="Add item"
      >
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </Link>
    </div>
  );
}
