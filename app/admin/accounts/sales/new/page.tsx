import Link from "next/link";
import { getAllAccounts } from "@/lib/services/marketplaceStore";
import AddSaleForm from "@/components/marketplace/AddSaleForm";

export const dynamic = "force-dynamic";

export default async function NewSalePage() {
  const accounts = await getAllAccounts();

  return (
    <div className="max-w-xl space-y-8">
      <div>
        <Link
          href="/admin/accounts/sales"
          className="text-[11px] text-zinc-500 hover:text-accent"
        >
          ← Sales
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Add sale</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Record a sale from a marketplace account manually.
        </p>
      </div>

      {accounts.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 text-center">
          <p className="text-sm text-zinc-500">Add an account first.</p>
          <Link
            href="/admin/accounts/accounts/new"
            className="mt-2 inline-block text-xs text-accent hover:underline"
          >
            Add account →
          </Link>
        </div>
      ) : (
        <AddSaleForm accounts={accounts} />
      )}
    </div>
  );
}
