"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { MarketplaceAccount } from "@/lib/marketplaceModels";

interface Props {
  accounts: MarketplaceAccount[];
}

const PLATFORMS = [
  { value: "", label: "All platforms" },
  { value: "ebay", label: "eBay" },
  { value: "poshmark", label: "Poshmark" },
  { value: "stockx", label: "StockX" },
  { value: "grailed", label: "Grailed" },
  { value: "depop", label: "Depop" },
];

export default function SalesMonitorFilters({ accounts }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/30 px-4 py-3">
      <select
        value={searchParams.get("platform") ?? ""}
        onChange={(e) => setParam("platform", e.target.value)}
        className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-[11px] uppercase tracking-wider text-zinc-400 outline-none focus:border-zinc-600"
      >
        {PLATFORMS.map((o) => (
          <option key={o.value || "all"} value={o.value} className="bg-zinc-900">
            {o.label}
          </option>
        ))}
      </select>
      <select
        value={searchParams.get("accountId") ?? ""}
        onChange={(e) => setParam("accountId", e.target.value)}
        className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-[11px] uppercase tracking-wider text-zinc-400 outline-none focus:border-zinc-600"
      >
        <option value="" className="bg-zinc-900">All accounts</option>
        {accounts.map((a) => (
          <option key={a.id} value={a.id} className="bg-zinc-900">
            {a.displayName} ({a.platform})
          </option>
        ))}
      </select>
      <select
        value={searchParams.get("matched") ?? ""}
        onChange={(e) => setParam("matched", e.target.value)}
        className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-[11px] uppercase tracking-wider text-zinc-400 outline-none focus:border-zinc-600"
      >
        <option value="" className="bg-zinc-900">All</option>
        <option value="yes" className="bg-zinc-900">Matched</option>
        <option value="no" className="bg-zinc-900">Unmatched</option>
      </select>
      <input
        type="date"
        value={searchParams.get("fromDate") ?? ""}
        onChange={(e) => setParam("fromDate", e.target.value)}
        className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-[11px] text-zinc-400 outline-none focus:border-zinc-600"
      />
      <input
        type="date"
        value={searchParams.get("toDate") ?? ""}
        onChange={(e) => setParam("toDate", e.target.value)}
        className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-[11px] text-zinc-400 outline-none focus:border-zinc-600"
      />
      {(searchParams.get("platform") || searchParams.get("accountId") || searchParams.get("matched") || searchParams.get("fromDate") || searchParams.get("toDate")) && (
        <button
          type="button"
          onClick={() => router.push(pathname)}
          className="text-[11px] text-zinc-500 hover:text-zinc-300"
        >
          Clear
        </button>
      )}
    </div>
  );
}
