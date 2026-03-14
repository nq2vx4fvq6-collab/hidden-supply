"use client";

import { useState } from "react";

interface Stat {
  label: string;
  value: string | number;
}

interface Props {
  stats: Stat[];
}

export default function AdminExpandableStats({ stats }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/20 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-2.5 text-left transition-colors hover:bg-zinc-800/30"
      >
        <span className="text-[10px] uppercase tracking-[0.25em] text-zinc-500">
          View all stats
        </span>
        <span className="text-xs text-zinc-500">{open ? "Hide" : "Show"}</span>
      </button>
      {open && (
        <div className="grid gap-3 border-t border-zinc-800/60 p-4 sm:grid-cols-2 lg:grid-cols-5">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-600">
                {s.label}
              </p>
              <p className="mt-1 text-lg font-semibold text-zinc-300">
                {s.value}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
