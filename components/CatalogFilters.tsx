"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

const BRANDS = [
  "Supreme",
  "BAPE",
  "Gallery Dept",
  "Off-White",
  "Stussy",
  "Palace",
  "Kith",
  "Fear of God",
  "Essentials",
  "Rhude",
  "Amiri",
  "Chrome Hearts",
  "Corteiz",
  "Travis Scott",
  "Nike",
  "Jordan Brand",
];

const CATEGORIES = [
  "Hoodie",
  "Tee",
  "Jeans",
  "Jacket",
  "Shorts",
  "Fleece",
  "Sweatpants",
  "Accessories",
  "Footwear",
  "Shirt",
  "Pants",
  "Hat",
  "Bag",
];

const SIZES = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "XXXL",
  "28",
  "29",
  "30",
  "31",
  "32",
  "33",
  "34",
  "36",
  "38",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "13",
];

const selectClass =
  "rounded-full border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-[11px] uppercase tracking-wider text-zinc-400 outline-none focus:border-zinc-600 transition-colors cursor-pointer hover:border-zinc-700";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
];

export default function CatalogFilters({
  total,
  sort = "newest",
}: {
  total: number;
  sort?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const clearAll = () => {
    const search = searchParams.get("search");
    router.push(search ? `${pathname}?search=${encodeURIComponent(search)}` : pathname);
  };

  const hasFilters =
    searchParams.has("brand") ||
    searchParams.has("category") ||
    searchParams.has("size") ||
    (searchParams.get("sort") ?? "newest") !== "newest";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={searchParams.get("brand") ?? ""}
        onChange={(e) => setParam("brand", e.target.value)}
        className={selectClass}
      >
        <option value="">All Brands</option>
        {BRANDS.map((b) => (
          <option key={b} value={b}>
            {b}
          </option>
        ))}
      </select>

      <select
        value={searchParams.get("category") ?? ""}
        onChange={(e) => setParam("category", e.target.value)}
        className={selectClass}
      >
        <option value="">All Categories</option>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <select
        value={searchParams.get("size") ?? ""}
        onChange={(e) => setParam("size", e.target.value)}
        className={selectClass}
      >
        <option value="">All Sizes</option>
        {SIZES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <div className="h-5 w-px bg-zinc-800" />

      <select
        value={searchParams.get("sort") ?? "newest"}
        onChange={(e) => setParam("sort", e.target.value === "newest" ? "" : e.target.value)}
        className={selectClass}
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      {hasFilters && (
        <button
          onClick={clearAll}
          className="rounded-full border border-zinc-800 px-3 py-1.5 text-[11px] uppercase tracking-wider text-zinc-600 transition-colors hover:border-zinc-700 hover:text-zinc-400"
        >
          Clear filters
        </button>
      )}

      <span className="ml-auto text-xs text-zinc-600">
        {total} {total === 1 ? "piece" : "pieces"}
      </span>
    </div>
  );
}
