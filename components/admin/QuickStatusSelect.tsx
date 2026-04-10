"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { InventoryStatus } from "@/lib/types/inventory";

const STATUS_OPTIONS: { value: InventoryStatus; label: string }[] = [
  { value: "available", label: "Available" },
  { value: "reserved", label: "Reserved" },
  { value: "sold", label: "Sold" },
  { value: "consigned", label: "Consigned" },
  { value: "in_transit", label: "In Transit" },
  { value: "archived", label: "Archived" },
];

const colorMap: Record<InventoryStatus, string> = {
  available: "text-emerald-400 border-emerald-900/60",
  reserved: "text-amber-400 border-amber-900/60",
  sold: "text-zinc-500 border-zinc-800",
  consigned: "text-blue-400 border-blue-900/60",
  in_transit: "text-purple-400 border-purple-900/60",
  archived: "text-zinc-600 border-zinc-900",
};

export default function QuickStatusSelect({
  id,
  status,
}: {
  id: string;
  status: InventoryStatus;
}) {
  const [current, setCurrent] = useState(status);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value as InventoryStatus;
    setCurrent(next);
    startTransition(async () => {
      await fetch(`/api/items/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      router.refresh();
    });
  };

  return (
    <select
      value={current}
      onChange={handleChange}
      disabled={pending}
      className={`cursor-pointer rounded-full border bg-transparent px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] outline-none transition-opacity disabled:opacity-40 ${colorMap[current]}`}
    >
      {STATUS_OPTIONS.map((o) => (
        <option key={o.value} value={o.value} className="bg-zinc-900 text-zinc-300">
          {o.label}
        </option>
      ))}
    </select>
  );
}
