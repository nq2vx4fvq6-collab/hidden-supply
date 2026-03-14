"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "available", label: "Available" },
  { value: "reserved", label: "Reserved" },
  { value: "sold", label: "Sold" },
  { value: "consigned", label: "Consigned" },
  { value: "in_transit", label: "In Transit" },
  { value: "archived", label: "Archived" },
];

export default function AdminFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      value ? params.set(key, value) : params.delete(key);
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const hasFilters =
    searchParams.has("search") || searchParams.has("status");

  return (
    <div className="flex flex-wrap items-center gap-3">
      <form
        method="GET"
        action={pathname}
        className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/40 px-4 py-1.5"
      >
        {/* Preserve status filter across search submits */}
        {searchParams.get("status") && (
          <input
            type="hidden"
            name="status"
            value={searchParams.get("status")!}
          />
        )}
        <input
          type="text"
          name="search"
          defaultValue={searchParams.get("search") ?? ""}
          placeholder="Search SKU, brand, name…"
          className="w-52 bg-transparent text-xs text-zinc-200 outline-none placeholder:text-zinc-600"
        />
        <button
          type="submit"
          className="text-[10px] uppercase tracking-wider text-zinc-600 transition-colors hover:text-zinc-300"
        >
          Go
        </button>
      </form>

      <select
        value={searchParams.get("status") ?? ""}
        onChange={(e) => setParam("status", e.target.value)}
        className="cursor-pointer rounded-full border border-zinc-800 bg-zinc-900/40 px-3 py-1.5 text-[11px] uppercase tracking-wider text-zinc-400 outline-none transition-colors focus:border-zinc-600"
      >
        {STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value} className="bg-zinc-900">
            {o.label}
          </option>
        ))}
      </select>

      {hasFilters && (
        <button
          onClick={() => router.push(pathname)}
          className="text-[11px] text-zinc-600 transition-colors hover:text-zinc-400"
        >
          Clear
        </button>
      )}
    </div>
  );
}
