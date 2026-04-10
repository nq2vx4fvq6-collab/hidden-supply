"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MarketplaceAccount } from "@/lib/types/marketplace";

interface PlatformOption {
  value: "ebay" | "poshmark" | "stockx" | "grailed" | "depop";
  label: string;
}

interface Props {
  platforms: PlatformOption[];
  existingAccounts: MarketplaceAccount[];
}

export default function AddAccountForm({ platforms, existingAccounts }: Props) {
  const router = useRouter();
  const [platform, setPlatform] = useState<PlatformOption["value"]>("ebay");
  const [displayName, setDisplayName] = useState("");
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    try {
      const formData = new FormData();
      formData.set("platform", platform);
      formData.set("displayName", displayName || "Unnamed account");
      const res = await fetch("/api/marketplace/accounts", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/admin/accounts/accounts/${data.id}`);
        router.refresh();
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6">
      <div>
        <label htmlFor="platform" className="block text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500">
          Platform
        </label>
        <select
          id="platform"
          name="platform"
          value={platform}
          onChange={(e) => setPlatform(e.target.value as PlatformOption["value"])}
          className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-200 outline-none focus:border-zinc-600"
        >
          {platforms.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>
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
          placeholder="e.g. Main eBay account"
          className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-zinc-600"
        />
      </div>
      {platform === "ebay" && (
        <p className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-xs text-zinc-500">
          After creating the account, you can connect it with eBay OAuth from the account detail page (Sync now).
        </p>
      )}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-accent px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Adding…" : "Add account"}
        </button>
        <Link
          href="/admin/accounts/accounts"
          className="rounded-full border border-zinc-700 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
