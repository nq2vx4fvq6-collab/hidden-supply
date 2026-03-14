"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

const BRANDS = [
  "Supreme", "BAPE", "Gallery Dept", "Off-White", "Stussy", "Palace",
  "Kith", "Fear of God", "Essentials", "Rhude", "Amiri", "Chrome Hearts",
  "Corteiz", "Travis Scott", "Nike", "Jordan Brand",
];

const CATEGORIES = [
  "Hoodie", "Tee", "Jeans", "Jacket", "Shorts", "Fleece",
  "Sweatpants", "Accessories", "Footwear", "Shirt", "Pants", "Hat", "Bag",
];

const SIZES = [
  "XS", "S", "M", "L", "XL", "XXL", "XXXL",
  "28", "29", "30", "31", "32", "33", "34", "36", "38",
  "6", "7", "8", "9", "10", "11", "12", "13",
];

const selectClass = [
  "border border-[rgba(5,6,8,0.14)] bg-[#F6F1E6]",
  "px-3 py-1 text-[9px] uppercase tracking-[0.2em] text-[#7A7A7A]",
  "outline-none cursor-pointer",
  "transition-colors hover:border-[rgba(5,6,8,0.3)] hover:text-[#050608]",
  "focus:border-[#050608] focus:text-[#050608]",
].join(" ");

const SORT_OPTIONS = [
  { value: "newest",     label: "Newest"   },
  { value: "price_asc",  label: "Price ↑"  },
  { value: "price_desc", label: "Price ↓"  },
];

export default function CatalogFilters({
  total,
  sort = "newest",
}: {
  total: number;
  sort?: string;
}) {
  const router     = useRouter();
  const pathname   = usePathname();
  const searchParams = useSearchParams();

  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) { params.set(key, value); } else { params.delete(key); }
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
      <select value={searchParams.get("brand")    ?? ""} onChange={(e) => setParam("brand",    e.target.value)} className={selectClass}>
        <option value="">All Brands</option>
        {BRANDS.map((b)     => <option key={b} value={b}>{b}</option>)}
      </select>

      <select value={searchParams.get("category") ?? ""} onChange={(e) => setParam("category", e.target.value)} className={selectClass}>
        <option value="">All Categories</option>
        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>

      <select value={searchParams.get("size")     ?? ""} onChange={(e) => setParam("size",     e.target.value)} className={selectClass}>
        <option value="">All Sizes</option>
        {SIZES.map((s)      => <option key={s} value={s}>{s}</option>)}
      </select>

      <div className="h-3 w-px bg-[rgba(5,6,8,0.12)]" />

      <select value={searchParams.get("sort") ?? "newest"} onChange={(e) => setParam("sort", e.target.value === "newest" ? "" : e.target.value)} className={selectClass}>
        {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>

      {hasFilters && (
        <button
          onClick={clearAll}
          className="border border-[rgba(5,6,8,0.14)] px-3 py-1 text-[9px] uppercase tracking-[0.2em] text-[#7A7A7A] transition-all hover:border-[#86C15A] hover:text-[#86C15A] active:scale-[0.95]"
        >
          Clear
        </button>
      )}
    </div>
  );
}
