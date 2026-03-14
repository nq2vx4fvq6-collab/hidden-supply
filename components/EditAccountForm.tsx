"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MarketplaceAccount } from "@/lib/marketplaceModels";

interface Props {
  account: MarketplaceAccount;
}

export default function EditAccountForm({ account }: Props) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(account.displayName || "");
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    try {
      const res = await fetch(`/api/marketplace/accounts/${account.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: displayName.trim() || undefined }),
      });
      if (res.ok) {
        router.push(`/admin/accounts/accounts/${account.id}`);
        router.refresh();
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6">
      <div>
        <label htmlFor="displayName" className="block text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500">
          Display name
        </label>
        <input
          id="displayName"
          name="displayName"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-200 outline-none focus:border-zinc-600"
        />
      </div>
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-accent px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save"}
        </button>
        <Link
          href={`/admin/accounts/accounts/${account.id}`}
          className="rounded-full border border-zinc-700 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
