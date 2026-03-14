"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { PlatformSale } from "@/lib/marketplaceModels";
import type { Item } from "@/lib/models";
import PlatformBadge from "@/components/PlatformBadge";

interface Props {
  sales: PlatformSale[];
  items: Item[];
  highlightSaleId?: string;
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function scoreMatch(sale: PlatformSale, item: Item): number {
  let score = 0;
  if (sale.sku && item.sku && normalize(sale.sku) === normalize(item.sku)) {
    return 100;
  }
  if (sale.brand && item.brand && normalize(sale.brand).includes(normalize(item.brand))) {
    score += 40;
  }
  if (sale.size && item.size && normalize(sale.size) === normalize(item.size)) {
    score += 30;
  }
  const saleTitle = normalize(sale.title);
  const itemName = normalize(item.name);
  if (saleTitle.includes(itemName) || itemName.includes(saleTitle)) {
    score += 30;
  }
  return score;
}

function getSuggestions(sale: PlatformSale, items: Item[], limit = 5): Item[] {
  return items
    .map((item) => ({ item, score: scoreMatch(sale, item) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ item }) => item);
}

export default function SupplyCrossCheckList({
  sales,
  items,
  highlightSaleId,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const handleLink = async (saleId: string, itemId: string | null) => {
    startTransition(async () => {
      await fetch(`/api/marketplace/sales/${saleId}/link`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      });
      router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      {sales.map((sale) => {
        const suggestions = getSuggestions(sale, items);
        const isHighlight = highlightSaleId === sale.id;

        return (
          <div
            key={sale.id}
            className={`rounded-2xl border bg-zinc-900/30 p-4 ${
              isHighlight ? "border-accent/50 ring-1 ring-accent/30" : "border-zinc-800"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <PlatformBadge platform={sale.platform} />
                  <span className="text-xs text-zinc-500">{sale.soldAt}</span>
                </div>
                <p className="mt-1 font-medium text-zinc-200">{sale.title}</p>
                <p className="text-xs text-zinc-500">
                  ${sale.amount.toLocaleString()} {sale.currency}
                  {sale.sku && ` · SKU: ${sale.sku}`}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[10px] uppercase tracking-wider text-zinc-500">
                  Match to inventory
                </span>
                {suggestions.length === 0 ? (
                  <button
                    type="button"
                    onClick={() => handleLink(sale.id, null)}
                    disabled={pending}
                    className="rounded-lg border border-zinc-700 px-3 py-1.5 text-[11px] text-zinc-500 hover:bg-zinc-800 disabled:opacity-50"
                  >
                    No match (dismiss)
                  </button>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleLink(sale.id, item.id)}
                        disabled={pending}
                        className="rounded-lg border border-zinc-700 bg-zinc-800/60 px-3 py-1.5 text-left text-[11px] text-zinc-300 hover:border-zinc-600 hover:bg-zinc-800 disabled:opacity-50"
                      >
                        {item.sku} · {item.name}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleLink(sale.id, null)}
                      disabled={pending}
                      className="rounded-lg border border-zinc-700 px-3 py-1.5 text-[11px] text-zinc-500 hover:bg-zinc-800 disabled:opacity-50"
                    >
                      None
                    </button>
                  </div>
                )}
              </div>
            </div>
            {suggestions.length > 0 && (
              <div className="mt-3 border-t border-zinc-800 pt-3">
                <p className="text-[10px] uppercase tracking-wider text-zinc-600">
                  Suggested matches
                </p>
                <ul className="mt-1 space-y-1">
                  {suggestions.map((item) => (
                    <li key={item.id} className="flex items-center gap-2 text-xs">
                      <Link
                        href={`/admin/items/${item.id}/edit`}
                        className="text-zinc-400 hover:text-accent"
                      >
                        {item.sku} — {item.brand} {item.name} ({item.size})
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
