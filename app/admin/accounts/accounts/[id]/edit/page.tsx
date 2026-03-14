import Link from "next/link";
import { notFound } from "next/navigation";
import { getAccountById } from "@/lib/services/marketplaceStore";
import PlatformBadge from "@/components/marketplace/PlatformBadge";
import EditAccountForm from "@/components/marketplace/EditAccountForm";
import DeleteAccountButton from "@/components/marketplace/DeleteAccountButton";

export const dynamic = "force-dynamic";

export default async function EditAccountPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const account = await getAccountById(id);
  if (!account) notFound();

  return (
    <div className="max-w-xl space-y-8">
      <div>
        <Link
          href={`/admin/accounts/accounts/${id}`}
          className="text-[11px] text-zinc-500 hover:text-accent"
        >
          ← Account
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Edit account</h1>
        <div className="mt-2">
          <PlatformBadge platform={account.platform} />
        </div>
      </div>

      <EditAccountForm account={account} />
      <div className="border-t border-zinc-800 pt-6">
        <DeleteAccountButton accountId={id} displayName={account.displayName} />
      </div>
    </div>
  );
}
