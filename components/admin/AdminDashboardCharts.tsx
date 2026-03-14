"use client";

import { useState } from "react";
import SalesCharts from "@/components/admin/SalesCharts";
import type { MonthlyData, BrandData, StatusData } from "@/components/admin/SalesCharts";

interface Props {
  monthly: MonthlyData[];
  brands: BrandData[];
  statusBreakdown: StatusData[];
}

export default function AdminDashboardCharts({
  monthly,
  brands,
  statusBreakdown,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-5 py-3 text-left transition-colors hover:bg-zinc-800/40"
      >
        <h2 className="text-[11px] font-medium uppercase tracking-[0.25em] text-zinc-500">
          Analytics
        </h2>
        <span className="text-xs text-zinc-500">
          {open ? "Hide" : "Show"} charts
        </span>
      </button>
      {open && (
        <div className="border-t border-zinc-800 p-5">
          <SalesCharts
            monthly={monthly}
            brands={brands}
            statusBreakdown={statusBreakdown}
          />
        </div>
      )}
    </div>
  );
}
