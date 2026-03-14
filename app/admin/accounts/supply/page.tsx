import Link from "next/link";
import { getPlatformSales } from "@/lib/marketplaceStore";
import { getAllItems } from "@/lib/inventoryService";
import SupplyCrossCheckList from "@/components/SupplyCrossCheckList";

export const dynamic = "force-dynamic";

export default async function SupplyCrossCheckPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const highlightId = params.highlight;

  const [unmatchedSales, items] = await Promise.all([
    getPlatformSales({ matched: false }),
    getAllItems(),
  ]);

  const availableItems = items.filter(
    (i) => i.status !== "sold" && i.status !== "archived"
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Supply cross-check
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Match platform sales to inventory. Unmatched: {unmatchedSales.length}
        </p>
      </div>

      {unmatchedSales.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-12 text-center">
          <p className="text-sm text-zinc-400">All sales are matched.</p>
          <Link
            href="/admin/accounts/sales"
            className="mt-2 inline-block text-xs text-accent hover:underline"
          >
            View sales →
          </Link>
        </div>
      ) : (
        <SupplyCrossCheckList
          sales={unmatchedSales}
          items={availableItems}
          highlightSaleId={highlightId ?? undefined}
        />
      )}
    </div>
  );
}
