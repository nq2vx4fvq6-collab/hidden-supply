import Link from "next/link";
import { getAllAccounts } from "@/lib/services/marketplace";
import SalesImportForm from "@/components/marketplace/SalesImportForm";

export const dynamic = "force-dynamic";

export default async function SalesImportPage() {
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
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Import sales</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Upload a CSV with columns: accountId, title, amount, soldAt (YYYY-MM-DD). Optional: sku, brand, size, currency.
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
        <SalesImportForm accounts={accounts} />
      )}
    </div>
  );
}
