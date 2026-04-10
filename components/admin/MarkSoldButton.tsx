"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { InventoryStatus } from "@/lib/types/inventory";

export default function MarkSoldButton({
  id,
  status,
  listPrice,
}: {
  id: string;
  status: InventoryStatus;
  listPrice?: number;
}) {
  const [open, setOpen] = useState(false);
  const [salePrice, setSalePrice] = useState(listPrice?.toString() ?? "");
  const [soldTo, setSoldTo] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  // Only show for unsold active items
  if (status === "sold" || status === "archived") return null;

  const handleConfirm = () => {
    startTransition(async () => {
      await fetch(`/api/items/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "sold",
          salePrice: salePrice ? Number(salePrice) : undefined,
          soldDate: new Date().toISOString().split("T")[0],
          soldTo: soldTo.trim() || undefined,
        }),
      });
      setOpen(false);
      router.refresh();
    });
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-zinc-500 transition-colors hover:text-emerald-400"
      >
        Sell
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm space-y-5 rounded-2xl border border-zinc-800 bg-zinc-950 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">
                Record Sale
              </h3>
              <p className="mt-0.5 text-xs text-zinc-500">
                This will mark the item as sold and log the details.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-[10px] uppercase tracking-[0.25em] text-zinc-500">
                  Sale Price ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  placeholder={listPrice?.toString() ?? "0.00"}
                  autoFocus
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-zinc-600 transition-colors"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[10px] uppercase tracking-[0.25em] text-zinc-500">
                  Sold To
                  <span className="ml-1 normal-case text-zinc-600">
                    (optional)
                  </span>
                </label>
                <input
                  type="text"
                  value={soldTo}
                  onChange={(e) => setSoldTo(e.target.value)}
                  placeholder="@handle or client name"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-zinc-600 transition-colors"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleConfirm}
                disabled={pending}
                className="flex-1 rounded-full bg-zinc-100 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-black transition-colors hover:bg-white disabled:opacity-50"
              >
                {pending ? "Saving…" : "Confirm Sale"}
              </button>
              <button
                onClick={() => setOpen(false)}
                className="rounded-full border border-zinc-800 px-4 py-2 text-xs text-zinc-500 transition-colors hover:text-zinc-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
