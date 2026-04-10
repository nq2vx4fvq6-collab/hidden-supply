import Link from "next/link";
import { getAllAccounts } from "@/lib/services/marketplace";
import AddAccountForm from "@/components/marketplace/AddAccountForm";

export const dynamic = "force-dynamic";

const PLATFORMS: { value: "ebay" | "poshmark" | "stockx" | "grailed" | "depop"; label: string }[] = [
  { value: "ebay", label: "eBay" },
  { value: "poshmark", label: "Poshmark" },
  { value: "stockx", label: "StockX" },
  { value: "grailed", label: "Grailed" },
  { value: "depop", label: "Depop" },
];

export default async function NewAccountPage() {
  const accounts = await getAllAccounts();

  return (
    <div className="max-w-xl space-y-8">
      <div>
        <Link
          href="/admin/accounts/accounts"
          className="text-[11px] text-zinc-500 hover:text-accent"
        >
          ← Accounts
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Add account</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Connect a marketplace account. OAuth for eBay is available; other platforms use manual entry for now.
        </p>
      </div>

      <AddAccountForm platforms={PLATFORMS} existingAccounts={accounts} />
    </div>
  );
}
